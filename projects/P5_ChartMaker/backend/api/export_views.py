import base64
import uuid
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4, A3, landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import Project, ChartConfig, ExportJob
from .serializers import ExportJobSerializer


class ExportPDFView(APIView):
    """
    Create a PDF export job for a project's chart.
    Accepts chart image (base64 encoded) and generates PDF.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        """
        Create a PDF export job.
        Expected payload:
        {
            "chart_image": "data:image/png;base64,...",  # Base64 encoded image
            "paper_size": "A4",  # A4, A3, Letter
            "orientation": "portrait",  # portrait, landscape
            "title": "Chart Title"  # Optional
        }
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate that chart config exists
        try:
            chart_config = ChartConfig.objects.get(project=project)
        except ChartConfig.DoesNotExist:
            return Response(
                {"detail": "No chart configuration found for this project. Please configure your chart first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get chart image from request
        chart_image_data = request.data.get("chart_image")
        if not chart_image_data:
            return Response(
                {"detail": "chart_image is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse base64 image
        try:
            # Remove data URL prefix if present
            if chart_image_data.startswith("data:image"):
                chart_image_data = chart_image_data.split(",")[1]
            
            image_data = base64.b64decode(chart_image_data)
            image = Image.open(BytesIO(image_data))
        except Exception as e:
            return Response(
                {"detail": f"Invalid image data: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get export options
        paper_size = request.data.get("paper_size", "A4").upper()
        orientation = request.data.get("orientation", "portrait").lower()
        title = request.data.get("title", chart_config.get_style().get("title") or project.name)

        # Validate paper size
        valid_paper_sizes = {"A4", "A3", "LETTER"}
        if paper_size not in valid_paper_sizes:
            return Response(
                {"detail": f"Invalid paper_size. Must be one of: {', '.join(valid_paper_sizes)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate orientation
        if orientation not in ["portrait", "landscape"]:
            return Response(
                {"detail": "Invalid orientation. Must be 'portrait' or 'landscape'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create export job
        export_job = ExportJob.objects.create(
            project=project,
            status="pending"
        )

        try:
            # Generate PDF
            pdf_filename = self._generate_pdf(
                export_job=export_job,
                image=image,
                title=title,
                paper_size=paper_size,
                orientation=orientation
            )

            # Update job status
            export_job.status = "done"
            export_job.result_storage_key = pdf_filename
            export_job.save()

            serializer = ExportJobSerializer(export_job)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Update job with error
            export_job.status = "error"
            export_job.error = str(e)
            export_job.save()
            
            return Response(
                {"detail": f"Failed to generate PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _generate_pdf(self, export_job, image, title, paper_size, orientation):
        """
        Generate PDF from chart image.
        Returns the storage key/filename of the generated PDF.
        """
        # Determine page size
        page_size_map = {
            "A4": A4,
            "A3": A3,
            "LETTER": letter,
        }
        base_size = page_size_map[paper_size]
        
        if orientation == "landscape":
            page_size = landscape(base_size)
        else:
            page_size = base_size

        # Create PDF buffer
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=page_size)

        # Get image dimensions
        img_width, img_height = image.size
        
        # Calculate scaling to fit on page with margins
        margin = 0.5 * inch
        max_width = page_size[0] - (2 * margin)
        max_height = page_size[1] - (2 * margin) - (0.5 * inch)  # Extra space for title
        
        # Calculate scale to fit image while maintaining aspect ratio
        scale_x = max_width / img_width
        scale_y = max_height / img_height
        scale = min(scale_x, scale_y, 1.0)  # Don't scale up
        
        scaled_width = img_width * scale
        scaled_height = img_height * scale
        
        # Center image on page
        x = (page_size[0] - scaled_width) / 2
        y = page_size[1] - margin - scaled_height - (0.5 * inch)  # Leave space for title

        # Draw title
        pdf.setFont("Helvetica-Bold", 16)
        title_y = page_size[1] - margin - 0.3 * inch
        pdf.drawString(margin, title_y, title)

        # Draw image
        img_reader = ImageReader(image)
        pdf.drawImage(
            img_reader,
            x,
            y,
            width=scaled_width,
            height=scaled_height,
            preserveAspectRatio=True
        )

        # Save PDF
        pdf.save()
        buffer.seek(0)

        # Save PDF to storage
        filename = f"exports/{export_job.id}_{uuid.uuid4().hex[:8]}.pdf"
        storage_path = default_storage.save(filename, ContentFile(buffer.read()))
        
        return storage_path


class ExportStatusView(APIView):
    """
    Get the status of an export job.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, export_id):
        """
        Get export job status and download URL if ready.
        """
        try:
            export_job = ExportJob.objects.get(id=export_id)
        except ExportJob.DoesNotExist:
            return Response(
                {"detail": "Export job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify ownership
        if export_job.project.owner != request.user:
            return Response(
                {"detail": "You don't have permission to access this export job."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ExportJobSerializer(export_job)
        return Response(serializer.data, status=status.HTTP_200_OK)


import hashlib
import time
from pathlib import Path
import pandas as pd

from rest_framework import status, viewsets
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import Project, UploadedFile, DataTable, ChartConfig, ExportJob
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    ProjectSerializer,
    UploadedFileSerializer,
    DataTableSerializer,
    ChartConfigSerializer,
    ExportJobSerializer,
)
from .export_views import ExportPDFView, ExportStatusView
from .parsers import parse_file, infer_type


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "ok"})


class UserRegistrationView(APIView):
    """
    User registration endpoint.
    POST /auth/users/
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User created successfully",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    Get current authenticated user.
    GET /auth/users/me
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# JWT Token views
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view.
    POST /auth/jwt/create
    Body: { "username": "...", "password": "..." }
    """
    pass


class CustomTokenRefreshView(TokenRefreshView):
    """
    JWT token refresh view.
    POST /auth/jwt/refresh
    Body: { "refresh": "..." }
    """
    pass


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations.
    
    list: GET /api/projects/ - List all projects for current user
    create: POST /api/projects/ - Create a new project
    retrieve: GET /api/projects/{id}/ - Get a specific project
    update: PUT /api/projects/{id}/ - Update a project (full)
    partial_update: PATCH /api/projects/{id}/ - Update a project (partial)
    destroy: DELETE /api/projects/{id}/ - Delete a project
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter projects to only show those owned by the current user.
        Optionally filter by status.
        """
        queryset = Project.objects.filter(owner=self.request.user)
        
        # Filter by status if provided
        status_param = self.request.query_params.get("status", None)
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset

    def get_serializer_context(self):
        """
        Add request to serializer context so owner can be set automatically.
        """
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        """
        Automatically set the owner to the current user when creating.
        """
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        """
        Ensure only the owner can update the project.
        """
        serializer.save()

    def perform_destroy(self, instance):
        """
        Ensure only the owner can delete the project.
        """
        instance.delete()


class FileUploadView(APIView):
    """
    File upload endpoint for projects.
    GET /api/projects/{project_id}/upload - List uploaded files
    POST /api/projects/{project_id}/upload - Upload a file
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        List all uploaded files for a project.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get all uploaded files for this project
        uploaded_files = UploadedFile.objects.filter(project=project).order_by("-created_at")
        serializer = UploadedFileSerializer(uploaded_files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_id):
        """
        Handle file upload with validation and storage.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if file is provided
        if "file" not in request.FILES:
            return Response(
                {"detail": "No file provided. Please include a file in the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded_file = request.FILES["file"]
        original_filename = uploaded_file.name
        file_size = uploaded_file.size

        # Validate file size
        if file_size > settings.MAX_FILE_SIZE:
            return Response(
                {
                    "detail": f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum allowed size ({settings.MAX_FILE_SIZE / (1024*1024):.0f} MB)."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file extension
        file_ext = Path(original_filename).suffix.lower()
        if file_ext not in settings.ALLOWED_FILE_EXTENSIONS:
            return Response(
                {
                    "detail": f"File type '{file_ext}' is not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_EXTENSIONS)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate MIME type
        content_type = uploaded_file.content_type or ""
        if content_type and content_type not in settings.ALLOWED_MIME_TYPES:
            # Some browsers might send different MIME types, so we check extension as primary
            # But log if there's a mismatch
            pass  # We'll rely on extension validation

        # Read file content for checksum computation
        uploaded_file.seek(0)  # Reset file pointer
        file_content = uploaded_file.read()
        uploaded_file.seek(0)  # Reset again for storage

        # Compute SHA-256 checksum
        checksum = hashlib.sha256(file_content).hexdigest()

        # Check if file with same checksum already exists (optional: prevent duplicates)
        # For now, we'll allow multiple uploads even with same checksum

        # Generate storage path: projects/{project_id}/files/{filename}_{timestamp}
        timestamp = int(time.time())
        safe_filename = "".join(c for c in original_filename if c.isalnum() or c in "._-")
        storage_filename = f"{timestamp}_{safe_filename}"
        storage_path = f"projects/{project_id}/files/{storage_filename}"

        # Save file to storage
        try:
            # Create directory if it doesn't exist
            file_path = default_storage.save(storage_path, ContentFile(file_content))
            storage_key = file_path  # Path in storage system

            # Create UploadedFile record
            uploaded_file_obj = UploadedFile.objects.create(
                project=project,
                filename=original_filename,
                content_type=content_type or f"application/{file_ext[1:]}",
                size_bytes=file_size,
                storage_key=storage_key,
                checksum=checksum,
            )

            serializer = UploadedFileSerializer(uploaded_file_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # If something goes wrong, try to clean up
            try:
                if default_storage.exists(storage_path):
                    default_storage.delete(storage_path)
            except:
                pass

            return Response(
                {"detail": f"Failed to save file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DataIngestionView(APIView):
    """
    Data ingestion endpoint for projects.
    POST /api/projects/{project_id}/ingest
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        """
        Parse an uploaded file and create a DataTable record.
        Body: { "uploaded_file_id": <id> } (optional - uses latest file if not provided)
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get uploaded file ID from request or use the latest one
        uploaded_file_id = request.data.get("uploaded_file_id")
        
        if uploaded_file_id:
            try:
                uploaded_file = UploadedFile.objects.get(
                    id=uploaded_file_id, project=project
                )
            except UploadedFile.DoesNotExist:
                return Response(
                    {"detail": "Uploaded file not found or doesn't belong to this project."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            # Use the most recently uploaded file for this project
            try:
                uploaded_file = UploadedFile.objects.filter(
                    project=project
                ).order_by("-created_at").first()
                
                if not uploaded_file:
                    return Response(
                        {"detail": "No uploaded files found for this project."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            except Exception as e:
                return Response(
                    {"detail": f"Failed to get uploaded file: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Check if DataTable already exists for this file
        existing_table = DataTable.objects.filter(
            project=project, source_file=uploaded_file
        ).first()
        
        if existing_table:
            # If full_data_json is missing, populate it now
            if existing_table.full_data_json is None and existing_table.num_rows <= 10000:
                try:
                    file_path = default_storage.path(uploaded_file.storage_key)
                    file_ext = Path(uploaded_file.filename).suffix.lower()

                    if file_ext == ".csv":
                        df = pd.read_csv(file_path, nrows=10000, encoding="utf-8", on_bad_lines="skip")
                    elif file_ext == ".xlsx":
                        df = pd.read_excel(file_path, nrows=10000)
                    else:
                        df = None

                    if df is not None:
                        df = df.where(pd.notnull(df), None)
                        full_data = df.to_dict(orient="records")
                        for record in full_data:
                            for key, value in record.items():
                                if pd.isna(value):
                                    record[key] = None
                                elif isinstance(value, pd.Timestamp):
                                    record[key] = value.isoformat()
                                elif hasattr(value, "item"):
                                    try:
                                        record[key] = value.item()
                                    except (ValueError, AttributeError):
                                        record[key] = None
                        existing_table.full_data_json = full_data
                        existing_table.save()
                except Exception as e:
                    print(f"Failed to populate full_data_json: {e}")
            
            serializer = DataTableSerializer(existing_table)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Parse the file
        try:
            parsed_data = parse_file(uploaded_file)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"detail": f"Failed to parse file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Store full data (for demo purposes - in production you'd check file size)
        # For files with reasonable size, store the full data
        full_data = None
        if parsed_data["num_rows"] <= 10000:  # Limit to 10k rows for demo
            try:
                # Re-parse to get full data (not just sample)
                file_path = default_storage.path(uploaded_file.storage_key)
                file_ext = Path(uploaded_file.filename).suffix.lower()

                if file_ext == ".csv":
                    df = pd.read_csv(file_path, nrows=10000, encoding="utf-8", on_bad_lines="skip")
                elif file_ext == ".xlsx":
                    df = pd.read_excel(file_path, nrows=10000)
                else:
                    df = None

                if df is not None:
                    # Convert to JSON-serializable format
                    df = df.where(pd.notnull(df), None)
                    full_data = df.to_dict(orient="records")

                    # Convert any remaining non-serializable types
                    for record in full_data:
                        for key, value in record.items():
                            if pd.isna(value):
                                record[key] = None
                            elif isinstance(value, pd.Timestamp):
                                record[key] = value.isoformat()
                            elif hasattr(value, "item"):  # NumPy scalar types
                                try:
                                    record[key] = value.item()
                                except (ValueError, AttributeError):
                                    record[key] = None
            except Exception as e:
                # If full data parsing fails, continue with sample only
                print(f"Failed to store full data: {e}")
                full_data = None

        # Create DataTable record
        try:
            data_table = DataTable.objects.create(
                project=project,
                source_file=uploaded_file,
                schema_json=parsed_data["schema"],
                num_rows=parsed_data["num_rows"],
                sample_json=parsed_data["sample_data"],
                full_data_json=full_data,
            )

            serializer = DataTableSerializer(data_table)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": f"Failed to create data table: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DataGridView(APIView):
    """
    Data grid endpoint for projects.
    GET /api/projects/{project_id}/data - Get paginated data
    PATCH /api/projects/{project_id}/data - Apply edits
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Get paginated data for the project.
        Query params: page (int), page_size (int, default=100)
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the data table
        data_table = DataTable.objects.filter(project=project).first()
        if not data_table:
            return Response(
                {"detail": "No data table found for this project. Please upload and parse a file first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get pagination parameters
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 100))

        # Get data with edits applied
        data = data_table.get_data_with_edits()
        if data is None:
            return Response(
                {"detail": "Full data not available. Only sample data was stored."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Calculate pagination
        total_rows = len(data)
        start_index = (page - 1) * page_size
        end_index = min(start_index + page_size, total_rows)

        if start_index >= total_rows:
            return Response(
                {"detail": "Page out of range."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get paginated data
        paginated_data = data[start_index:end_index]

        return Response({
            "data": paginated_data,
            "schema": data_table.get_schema(),
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_rows": total_rows,
                "total_pages": (total_rows + page_size - 1) // page_size,
                "has_next": end_index < total_rows,
                "has_previous": page > 1,
            }
        })

    def patch(self, request, project_id):
        """
        Apply edits to the data.
        Body: { "edits": { "row_index": { "column_name": "new_value" } } }
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the data table
        data_table = DataTable.objects.filter(project=project).first()
        if not data_table:
            return Response(
                {"detail": "No data table found for this project. Please upload and parse a file first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Validate request data
        edits = request.data.get("edits", {})
        if not isinstance(edits, dict):
            return Response(
                {"detail": "Edits must be an object with row indices as keys."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate edits against schema and data
        schema = data_table.get_schema()
        data = data_table.get_data_with_edits()
        validation_errors = []

        if data is None:
            return Response(
                {"detail": "Full data not available for editing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_edits = {}

        for row_index_str, row_edits in edits.items():
            try:
                row_index = int(row_index_str)
            except ValueError:
                validation_errors.append(f"Invalid row index: {row_index_str}")
                continue

            if not (0 <= row_index < len(data)):
                validation_errors.append(f"Row index {row_index} out of range.")
                continue

            if not isinstance(row_edits, dict):
                validation_errors.append(f"Row {row_index}: edits must be an object.")
                continue

            validated_row_edits = {}

            for column_name, new_value in row_edits.items():
                if column_name not in schema:
                    validation_errors.append(f"Row {row_index}: unknown column '{column_name}'.")
                    continue

                expected_type = schema[column_name]

                # Type validation
                if new_value is not None:
                    try:
                        # Convert and validate type
                        if expected_type == "number":
                            if isinstance(new_value, str):
                                new_value = float(new_value)
                            elif not isinstance(new_value, (int, float)):
                                raise ValueError
                        elif expected_type == "boolean":
                            if isinstance(new_value, str):
                                new_value = new_value.lower() in ["true", "1", "yes"]
                            elif not isinstance(new_value, bool):
                                raise ValueError
                        elif expected_type == "string":
                            new_value = str(new_value)
                        # For date, we'll accept string representation for now
                    except (ValueError, TypeError):
                        validation_errors.append(
                            f"Row {row_index}, column '{column_name}': invalid value '{new_value}' for type '{expected_type}'."
                        )
                        continue

                validated_row_edits[column_name] = new_value

            if validated_row_edits:
                validated_edits[str(row_index)] = validated_row_edits

        if validation_errors:
            return Response(
                {
                    "detail": "Validation failed.",
                    "errors": validation_errors
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Apply edits
        try:
            current_edits = data_table.get_edited_data()
            current_edits.update(validated_edits)
            data_table.edited_data_json = current_edits
            data_table.save()

            return Response({
                "detail": f"Successfully applied {len(validated_edits)} row edits.",
                "applied_edits": validated_edits
            })

        except Exception as e:
            return Response(
                {"detail": f"Failed to save edits: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DataPreviewView(APIView):
    """
    Data preview endpoint for projects.
    GET /api/projects/{project_id}/data/preview - Get sampled/preview data for chart rendering
    Query params: limit (int, default=1000) - Maximum number of rows to return
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Get preview data for chart rendering.
        Returns sampled data if the dataset is large.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the data table
        data_table = DataTable.objects.filter(project=project).first()
        if not data_table:
            return Response(
                {"detail": "No data table found for this project. Please upload and parse a file first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get limit from query params (default 1000 rows for preview)
        try:
            limit = int(request.query_params.get("limit", 1000))
            limit = max(1, min(limit, 10000))  # Clamp between 1 and 10000
        except (ValueError, TypeError):
            limit = 1000

        # Get data with edits applied
        data = data_table.get_data_with_edits()
        if data is None:
            return Response(
                {"detail": "Full data not available. Only sample data was stored."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Determine if we need to sample
        total_rows = len(data)
        is_sampled = total_rows > limit

        # Get preview data (either full data or sampled)
        if is_sampled:
            # Sample data: take evenly distributed rows
            step = total_rows / limit
            preview_data = []
            for i in range(limit):
                index = int(i * step)
                if index < total_rows:
                    preview_data.append(data[index])
        else:
            preview_data = data

        return Response({
            "data": preview_data,
            "schema": data_table.get_schema(),
            "total_rows": total_rows,
            "preview_rows": len(preview_data),
            "is_sampled": is_sampled,
            "sampling_message": f"Showing {len(preview_data)} of {total_rows} rows (sampled for preview)" if is_sampled else None,
        })


class ChartConfigView(APIView):
    """
    Chart configuration endpoint for projects.
    GET /api/projects/{project_id}/chart-config - Get chart configuration
    POST /api/projects/{project_id}/chart-config - Create chart configuration
    PUT /api/projects/{project_id}/chart-config - Update chart configuration (creates if doesn't exist)
    PATCH /api/projects/{project_id}/chart-config - Partially update chart configuration
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Get chart configuration for a project.
        Returns 404 if no configuration exists.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get chart config
        try:
            chart_config = ChartConfig.objects.get(project=project)
        except ChartConfig.DoesNotExist:
            return Response(
                {"detail": "No chart configuration found for this project."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ChartConfigSerializer(chart_config, context={"request": request, "project": project})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_id):
        """
        Create a new chart configuration for a project.
        Returns 400 if configuration already exists (use PUT → PUT to update).
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if config already exists
        if ChartConfig.objects.filter(project=project).exists():
            return Response(
                {"detail": "Chart configuration already exists for this project. Use PUT or PATCH to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Serialize and validate
        serializer = ChartConfigSerializer(
            data=request.data,
            context={"request": request, "project": project}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, project_id):
        """
        Update chart configuration for a project.
        Creates a new configuration if it doesn't exist.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get or create chart config
        try:
            chart_config = ChartConfig.objects.get(project=project)
            serializer = ChartConfigSerializer(
                chart_config,
                data=request.data,
                context={"request": request, "project": project},
                partial=False  # PUT requires all fields
            )
        except ChartConfig.DoesNotExist:
            # Create new config
            serializer = ChartConfigSerializer(
                data=request.data,
                context={"request": request, "project": project}
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, project_id):
        """
        Partially update chart configuration for a project.
        Creates a new configuration if it doesn't exist.
        """
        # Get the project and verify ownership
        try:
            project = Project.objects.get(id=project_id, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Project not found or you don't have permission to access it."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get or create chart config
        try:
            chart_config = ChartConfig.objects.get(project=project)
            serializer = ChartConfigSerializer(
                chart_config,
                data=request.data,
                context={"request": request, "project": project},
                partial=True  # PATCH allows partial updates
            )
        except ChartConfig.DoesNotExist:
            # Create new config with provided data
            serializer = ChartConfigSerializer(
                data=request.data,
                context={"request": request, "project": project}
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



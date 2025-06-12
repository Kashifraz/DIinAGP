from django.db import models
from django.contrib.auth.models import User
import json


class Project(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("archived", "Archived"),
    ]

    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="projects"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"


class UploadedFile(models.Model):
    """
    Model to store metadata about uploaded files (CSV, XLSX).
    The actual file is stored in Django's file storage system.
    """
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="uploaded_files"
    )
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    size_bytes = models.BigIntegerField()
    storage_key = models.CharField(max_length=500)  # Path in storage system
    checksum = models.CharField(max_length=64)  # SHA-256 hash
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "uploaded_files"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.filename} (Project: {self.project.name})"


class DataTable(models.Model):
    """
    Model to store parsed data table information and schema.
    Stores normalized tabular data representation.
    """
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="data_tables"
    )
    source_file = models.ForeignKey(
        UploadedFile, on_delete=models.CASCADE, related_name="data_tables"
    )
    schema_json = models.JSONField()  # Column schema: {column_name: type}
    num_rows = models.IntegerField()
    sample_json = models.JSONField()  # Sample rows for preview
    full_data_json = models.JSONField(null=True, blank=True)  # Full normalized data (optional for large files)
    edited_data_json = models.JSONField(null=True, blank=True)  # Edited rows as diffs: {row_index: {column: value}}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "data_tables"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "-created_at"]),
            models.Index(fields=["updated_at"]),
        ]

    def __str__(self):
        return f"DataTable for {self.source_file.filename} (Project: {self.project.name})"

    def get_schema(self):
        """Return schema as a Python dict."""
        if isinstance(self.schema_json, str):
            return json.loads(self.schema_json)
        return self.schema_json

    def get_sample(self):
        """Return sample data as a Python list."""
        if isinstance(self.sample_json, str):
            return json.loads(self.sample_json)
        return self.sample_json

    def get_full_data(self):
        """Return full data as a Python list."""
        if self.full_data_json is None:
            return None
        if isinstance(self.full_data_json, str):
            return json.loads(self.full_data_json)
        return self.full_data_json

    def get_edited_data(self):
        """Return edited data as a Python dict."""
        if self.edited_data_json is None:
            return {}
        if isinstance(self.edited_data_json, str):
            return json.loads(self.edited_data_json)
        return self.edited_data_json

    def get_data_with_edits(self):
        """Return full data with edits applied."""
        full_data = self.get_full_data()
        edited_data = self.get_edited_data()

        if full_data is None:
            return None

        # Apply edits to full data
        for row_index, row_edits in edited_data.items():
            row_idx = int(row_index)
            if 0 <= row_idx < len(full_data):
                full_data[row_idx].update(row_edits)

        return full_data


class ChartConfig(models.Model):
    """
    Model to store chart configuration for a project.
    Includes column selection, chart type, and styling options.
    """
    CHART_TYPE_CHOICES = [
        ("bar", "Bar"),
        ("line", "Line"),
        ("area", "Area"),
        ("pie", "Pie"),
        ("scatter", "Scatter"),
    ]

    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name="chart_config"
    )
    chart_type = models.CharField(
        max_length=20, choices=CHART_TYPE_CHOICES, default="bar"
    )
    selected_columns_json = models.JSONField(
        default=dict,
        help_text="Column selection: {x: str, y: [str], groupBy?: str, label?: str}"
    )
    style_json = models.JSONField(
        default=dict,
        null=True,
        blank=True,
        help_text="Styling options: title, colors, legend position, axes labels, etc."
    )
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chart_configs"
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["updated_at"]),
        ]

    def __str__(self):
        return f"ChartConfig for {self.project.name} (Type: {self.chart_type})"

    def get_selected_columns(self):
        """Return selected columns as a Python dict."""
        if isinstance(self.selected_columns_json, str):
            return json.loads(self.selected_columns_json)
        return self.selected_columns_json or {}

    def get_style(self):
        """Return style configuration as a Python dict."""
        if self.style_json is None:
            return {}
        if isinstance(self.style_json, str):
            return json.loads(self.style_json)
        return self.style_json


class ExportJob(models.Model):
    """
    Model to track PDF export jobs for charts.
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("done", "Done"),
        ("error", "Error"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="export_jobs"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    result_storage_key = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Storage path/key for the generated PDF file"
    )
    error = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if export failed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "export_jobs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"ExportJob {self.id} for {self.project.name} ({self.status})"


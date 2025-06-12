from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Project, UploadedFile, DataTable, ChartConfig, ExportJob


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "date_joined"]
        read_only_fields = ["id", "date_joined"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        # Handle empty email
        if not validated_data.get("email"):
            validated_data["email"] = ""
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProjectSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "owner",
            "owner_username",
            "name",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def create(self, validated_data):
        # Set the owner to the current user
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)


class UploadedFileSerializer(serializers.ModelSerializer):
    """
    Serializer for UploadedFile model.
    """

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "project",
            "filename",
            "content_type",
            "size_bytes",
            "storage_key",
            "checksum",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "storage_key",
            "checksum",
            "created_at",
        ]


class DataTableSerializer(serializers.ModelSerializer):
    """
    Serializer for DataTable model.
    """
    source_file_name = serializers.CharField(source="source_file.filename", read_only=True)

    class Meta:
        model = DataTable
        fields = [
            "id",
            "project",
            "source_file",
            "source_file_name",
            "schema_json",
            "num_rows",
            "sample_json",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "source_file",
            "created_at",
        ]


class ChartConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for ChartConfig model.
    Validates selected columns against the project's data schema.
    """
    selected_columns = serializers.JSONField(
        source="selected_columns_json",
        help_text="Column selection: {x: str, y: [str], groupBy?: str, label?: str}"
    )
    style = serializers.JSONField(
        source="style_json",
        required=False,
        allow_null=True,
        help_text="Styling options: title, colors, legend position, axes labels, etc."
    )

    class Meta:
        model = ChartConfig
        fields = [
            "id",
            "project",
            "chart_type",
            "selected_columns",
            "style",
            "version",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project", "version", "created_at", "updated_at"]

    def validate_style(self, value):
        """
        Validate style configuration.
        """
        if value is None:
            return {}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("style must be an object.")
        
        # Validate title
        if "title" in value and value["title"] is not None:
            if not isinstance(value["title"], str):
                raise serializers.ValidationError("'title' must be a string.")
            if len(value["title"]) > 200:
                raise serializers.ValidationError("'title' must be 200 characters or less.")
        
        # Validate subtitle
        if "subtitle" in value and value["subtitle"] is not None:
            if not isinstance(value["subtitle"], str):
                raise serializers.ValidationError("'subtitle' must be a string.")
            if len(value["subtitle"]) > 200:
                raise serializers.ValidationError("'subtitle' must be 200 characters or less.")
        
        # Validate axis labels
        if "xAxisLabel" in value and value["xAxisLabel"] is not None:
            if not isinstance(value["xAxisLabel"], str):
                raise serializers.ValidationError("'xAxisLabel' must be a string.")
            if len(value["xAxisLabel"]) > 100:
                raise serializers.ValidationError("'xAxisLabel' must be 100 characters or less.")
        
        if "yAxisLabel" in value and value["yAxisLabel"] is not None:
            if not isinstance(value["yAxisLabel"], str):
                raise serializers.ValidationError("'yAxisLabel' must be a string.")
            if len(value["yAxisLabel"]) > 100:
                raise serializers.ValidationError("'yAxisLabel' must be 100 characters or less.")
        
        # Validate colors
        if "colors" in value and value["colors"] is not None:
            if not isinstance(value["colors"], list):
                raise serializers.ValidationError("'colors' must be an array.")
            if len(value["colors"]) > 20:
                raise serializers.ValidationError("'colors' array must have 20 or fewer items.")
            # Validate each color is a valid hex color or named color
            import re
            hex_pattern = re.compile(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
            for color in value["colors"]:
                if not isinstance(color, str):
                    raise serializers.ValidationError("All colors must be strings.")
                if not (hex_pattern.match(color) or color in ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'grey']):
                    raise serializers.ValidationError(f"Invalid color format: '{color}'. Use hex (#RRGGBB) or named colors.")
        
        # Validate legend position
        if "legendPosition" in value and value["legendPosition"] is not None:
            valid_positions = ["top", "bottom", "left", "right"]
            if value["legendPosition"] not in valid_positions:
                raise serializers.ValidationError(f"'legendPosition' must be one of: {', '.join(valid_positions)}")
        
        # Validate boolean fields
        boolean_fields = ["gridlines", "tooltips", "dataLabels"]
        for field in boolean_fields:
            if field in value and value[field] is not None:
                if not isinstance(value[field], bool):
                    raise serializers.ValidationError(f"'{field}' must be a boolean.")
        
        return value

    def validate_selected_columns(self, value):
        """
        Validate that selected columns exist in the schema and are compatible.
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError("selected_columns must be an object.")

        # Check required fields
        if "x" not in value:
            raise serializers.ValidationError("selected_columns must include 'x' field.")
        if "y" not in value or not isinstance(value["y"], list) or len(value["y"]) == 0:
            raise serializers.ValidationError("selected_columns must include 'y' as a non-empty array.")

        # Validate x column
        x_column = value["x"]
        if not isinstance(x_column, str):
            raise serializers.ValidationError("'x' must be a string (column name).")

        # Validate y columns
        y_columns = value["y"]
        if not isinstance(y_columns, list):
            raise serializers.ValidationError("'y' must be an array of column names.")
        if not all(isinstance(col, str) for col in y_columns):
            raise serializers.ValidationError("All items in 'y' must be strings (column names).")

        # Validate optional fields
        if "groupBy" in value and value["groupBy"] is not None:
            if not isinstance(value["groupBy"], str):
                raise serializers.ValidationError("'groupBy' must be a string (column name) or null.")
        
        if "label" in value and value["label"] is not None:
            if not isinstance(value["label"], str):
                raise serializers.ValidationError("'label' must be a string (column name) or null.")

        return value

    def validate(self, attrs):
        """
        Validate selected columns against the project's data schema.
        """
        # Get the project (from context or instance)
        project = self.context.get("project")
        if not project:
            if self.instance:
                project = self.instance.project
            else:
                raise serializers.ValidationError("Project is required.")

        # Get the data table for this project
        data_table = DataTable.objects.filter(project=project).first()
        if not data_table:
            raise serializers.ValidationError(
                "No data table found for this project. Please upload and parse a file first."
            )

        schema = data_table.get_schema()
        if not schema:
            raise serializers.ValidationError("No schema available for validation.")

        # Validate selected columns against schema
        selected_columns = attrs.get("selected_columns_json", {})
        if not selected_columns:
            return attrs

        # Validate x column exists
        x_column = selected_columns.get("x")
        if x_column and x_column not in schema:
            raise serializers.ValidationError(
                f"Column '{x_column}' (x-axis) does not exist in the data schema."
            )

        # Validate y columns exist
        y_columns = selected_columns.get("y", [])
        for y_col in y_columns:
            if y_col not in schema:
                raise serializers.ValidationError(
                    f"Column '{y_col}' (y-axis) does not exist in the data schema."
                )

        # Validate groupBy column if provided
        group_by = selected_columns.get("groupBy")
        if group_by and group_by not in schema:
            raise serializers.ValidationError(
                f"Column '{group_by}' (groupBy) does not exist in the data schema."
            )

        # Validate label column if provided
        label = selected_columns.get("label")
        if label and label not in schema:
            raise serializers.ValidationError(
                f"Column '{label}' (label) does not exist in the data schema."
            )

        # Type compatibility checks (basic validation)
        chart_type = attrs.get("chart_type", self.instance.chart_type if self.instance else "bar")
        
        if chart_type == "pie":
            # Pie charts typically need one y value
            if len(y_columns) > 1:
                raise serializers.ValidationError(
                    "Pie charts support only one y-axis column."
                )
        elif chart_type == "scatter":
            # Scatter plots need exactly one y value
            if len(y_columns) != 1:
                raise serializers.ValidationError(
                    "Scatter plots require exactly one y-axis column."
                )

        return attrs

    def create(self, validated_data):
        """Create a new chart config, incrementing version."""
        project = self.context["project"]
        validated_data["project"] = project
        validated_data["version"] = 1
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Update chart config, incrementing version."""
        # Increment version if config changed
        if validated_data:
            instance.version += 1
        return super().update(instance, validated_data)


class ExportJobSerializer(serializers.ModelSerializer):
    """
    Serializer for ExportJob model.
    """
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = ExportJob
        fields = [
            "id",
            "project",
            "status",
            "result_storage_key",
            "error",
            "download_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "status",
            "result_storage_key",
            "error",
            "created_at",
            "updated_at",
        ]

    def get_download_url(self, obj):
        """Generate download URL for the exported PDF if available."""
        if obj.status == "done" and obj.result_storage_key:
            from django.conf import settings
            # result_storage_key already includes "exports/" prefix, so just prepend MEDIA_URL
            return f"{settings.MEDIA_URL}{obj.result_storage_key}"
        return None


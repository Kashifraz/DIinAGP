from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HealthView,
    UserRegistrationView,
    CurrentUserView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    ProjectViewSet,
    FileUploadView,
    DataIngestionView,
    DataGridView,
    DataPreviewView,
    ChartConfigView,
)
from .export_views import ExportPDFView, ExportStatusView

# Create router and register viewsets
router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("health", HealthView.as_view(), name="health"),
    # Auth endpoints
    path("auth/users/", UserRegistrationView.as_view(), name="user-register"),
    path("auth/users/me", CurrentUserView.as_view(), name="user-me"),
    path("auth/jwt/create", CustomTokenObtainPairView.as_view(), name="token-obtain-pair"),
    path("auth/jwt/refresh", CustomTokenRefreshView.as_view(), name="token-refresh"),
    # File upload endpoint
    path("projects/<int:project_id>/upload", FileUploadView.as_view(), name="file-upload"),
    # Data ingestion endpoint
    path("projects/<int:project_id>/ingest", DataIngestionView.as_view(), name="data-ingestion"),
    # Data grid endpoints
    path("projects/<int:project_id>/data", DataGridView.as_view(), name="data-grid"),
    # Data preview endpoint (for chart rendering)
    path("projects/<int:project_id>/data/preview", DataPreviewView.as_view(), name="data-preview"),
    # Chart configuration endpoints
    path("projects/<int:project_id>/chart-config", ChartConfigView.as_view(), name="chart-config"),
    # PDF Export endpoints
    path("projects/<int:project_id>/export/pdf", ExportPDFView.as_view(), name="export-pdf"),
    path("exports/<int:export_id>", ExportStatusView.as_view(), name="export-status"),
    # Include router URLs
    path("", include(router.urls)),
]



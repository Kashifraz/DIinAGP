from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            "detail": response.data.get("detail", "An error occurred"),
        }

        # Handle validation errors
        if "non_field_errors" in response.data:
            custom_response_data["detail"] = response.data["non_field_errors"][0]
        elif isinstance(response.data, dict) and len(response.data) > 1:
            # Multiple field errors
            custom_response_data["errors"] = response.data

        response.data = custom_response_data

    return response


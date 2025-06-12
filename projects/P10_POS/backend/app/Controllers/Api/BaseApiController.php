<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

/**
 * Base API Controller
 * 
 * Provides common functionality for all API controllers
 */
class BaseApiController extends ResourceController
{
    public function __construct()
    {
        helper('api_response');
    }

    /**
     * Format success response
     * 
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function success($data = null, string $message = 'Operation successful', int $statusCode = 200)
    {
        return api_success($data, $message, $statusCode);
    }

    /**
     * Format error response
     * 
     * @param string $message Error message
     * @param mixed $data Additional error data
     * @param int $statusCode HTTP status code
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function error(string $message = 'An error occurred', $data = null, int $statusCode = 400)
    {
        return api_error($message, $data, $statusCode);
    }

    /**
     * Format validation error response
     * 
     * @param array $errors Validation errors
     * @param string $message Error message
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function validationError(array $errors, string $message = 'Validation failed')
    {
        return api_error($message, ['errors' => $errors], 422);
    }

    /**
     * Format not found response
     * 
     * @param string $message Error message
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function notFound(string $message = 'Resource not found')
    {
        return api_error($message, null, 404);
    }

    /**
     * Format unauthorized response
     * 
     * @param string $message Error message
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function unauthorized(string $message = 'Unauthorized access')
    {
        return api_error($message, null, 401);
    }

    /**
     * Format forbidden response
     * 
     * @param string $message Error message
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    protected function forbidden(string $message = 'Forbidden')
    {
        return api_error($message, null, 403);
    }
}


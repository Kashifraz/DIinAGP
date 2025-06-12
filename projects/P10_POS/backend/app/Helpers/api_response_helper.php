<?php

if (!function_exists('api_response')) {
    /**
     * Standard API response formatter
     * 
     * @param mixed $data Response data
     * @param string $message Response message
     * @param bool $success Success status
     * @param int $statusCode HTTP status code
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    function api_response($data = null, string $message = '', bool $success = true, int $statusCode = 200)
    {
        $response = service('response');
        
        $responseData = [
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        return $response
            ->setStatusCode($statusCode)
            ->setContentType('application/json')
            ->setJSON($responseData);
    }
}

if (!function_exists('api_success')) {
    /**
     * Success API response
     * 
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    function api_success($data = null, string $message = 'Operation successful', int $statusCode = 200)
    {
        return api_response($data, $message, true, $statusCode);
    }
}

if (!function_exists('api_error')) {
    /**
     * Error API response
     * 
     * @param string $message Error message
     * @param mixed $data Additional error data
     * @param int $statusCode HTTP status code
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    function api_error(string $message = 'An error occurred', $data = null, int $statusCode = 400)
    {
        return api_response($data, $message, false, $statusCode);
    }
}


<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * CORS Filter
 * 
 * Handles Cross-Origin Resource Sharing headers
 */
class CorsFilter implements FilterInterface
{
    /**
     * Do whatever processing this filter needs to do.
     * By default it should not return anything during
     * normal execution. However, when an abnormal state
     * is found, it should return an instance of
     * CodeIgniter\HTTP\Response. If it does, script
     * execution will end and that Response will be
     * sent back to the client, allowing for error pages,
     * redirects, etc.
     *
     * @param RequestInterface $request
     * @param array|null       $arguments
     *
     * @return mixed
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Get the origin from the request
        $origin = $request->getHeaderLine('Origin');
        
        // Determine allowed origin
        $allowedOrigin = '*';
        $allowCredentials = 'false';
        
        if ($origin) {
            // Check if it's a localhost origin (development)
            if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/', $origin)) {
                $allowedOrigin = $origin;
                $allowCredentials = 'true';
            }
        }
        
        // Handle preflight OPTIONS requests
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            $response = service('response');
            $response->setHeader('Access-Control-Allow-Origin', $allowedOrigin);
            $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $response->setHeader('Access-Control-Max-Age', '3600');
            
            // Only set credentials if we're using a specific origin (not wildcard)
            if ($allowedOrigin !== '*') {
                $response->setHeader('Access-Control-Allow-Credentials', 'true');
            }
            
            $response->setStatusCode(200);
            $response->setBody('');
            return $response;
        }
    }

    /**
     * Allows After filters to inspect and modify the response
     * object as needed. This method does not allow any way
     * to stop execution of other after filters, short of
     * throwing an Exception or Error.
     *
     * @param RequestInterface  $request
     * @param ResponseInterface $response
     * @param array|null        $arguments
     *
     * @return mixed
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Get the origin from the request
        $origin = $request->getHeaderLine('Origin');
        
        // For development: Allow all localhost origins
        // For production: Specify exact origins
        $allowedOrigin = '*';
        $allowCredentials = 'false';
        
        if ($origin) {
            // Check if it's a localhost origin (development)
            if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/', $origin)) {
                $allowedOrigin = $origin;
                $allowCredentials = 'true';
            } else {
                // For production, you can add specific allowed origins here
                $allowedOrigins = [
                    // Add your production frontend URL here
                    // 'https://yourdomain.com',
                ];
                
                if (in_array($origin, $allowedOrigins)) {
                    $allowedOrigin = $origin;
                    $allowCredentials = 'true';
                }
            }
        }
        
        // Add CORS headers to all responses
        $response->setHeader('Access-Control-Allow-Origin', $allowedOrigin);
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        
        // Only set credentials if we're using a specific origin (not wildcard)
        if ($allowedOrigin !== '*') {
            $response->setHeader('Access-Control-Allow-Credentials', 'true');
        }
        
        $response->setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
        
        return $response;
    }
}


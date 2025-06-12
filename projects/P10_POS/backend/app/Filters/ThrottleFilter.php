<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class ThrottleFilter implements FilterInterface
{
    /**
     * Rate limiting for API endpoints
     * Limits requests per minute based on IP address
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        $maxRequests = $arguments[0] ?? 60; // Default: 60 requests per minute
        $window = 60; // 1 minute window

        $ip = $request->getIPAddress();
        $cache = \Config\Services::cache();
        $key = 'throttle_' . md5($ip . $request->getUri()->getPath());

        $requests = $cache->get($key);

        if ($requests === null) {
            $cache->save($key, 1, $window);
            return;
        }

        if ($requests >= $maxRequests) {
            $response = service('response');
            return $response->setStatusCode(429)
                ->setContentType('application/json')
                ->setHeader('Retry-After', $window)
                ->setJSON([
                    'success' => false,
                    'message' => 'Too many requests. Please try again later.',
                    'data' => null,
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
        }

        $cache->save($key, $requests + 1, $window);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Do nothing
    }
}


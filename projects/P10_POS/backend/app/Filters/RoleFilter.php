<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Libraries\JWTLibrary;

class RoleFilter implements FilterInterface
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
        $jwt = new JWTLibrary();
        $tokenData = $jwt->validateToken();

        if ($tokenData === null) {
            $response = service('response');
            return $response->setStatusCode(401)
                ->setContentType('application/json')
                ->setJSON([
                    'success' => false,
                    'message' => 'Unauthorized. Please provide a valid token.',
                    'data' => null,
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
        }

        // Check if user has required role
        $userRole = $tokenData['role'] ?? null;
        
        // $arguments is an array when filter is called with role:admin
        // It will be ['admin'] when specified as role:admin
        $allowedRoles = is_array($arguments) ? $arguments : ($arguments ? [$arguments] : []);

        if (!empty($allowedRoles) && !in_array($userRole, $allowedRoles)) {
            $response = service('response');
            return $response->setStatusCode(403)
                ->setContentType('application/json')
                ->setJSON([
                    'success' => false,
                    'message' => 'Forbidden. You do not have permission to access this resource.',
                    'data' => null,
                    'timestamp' => date('Y-m-d H:i:s')
                ]);
        }

        // Store user data in request for use in controllers
        $request->user = $tokenData;
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
        // Do nothing
    }
}


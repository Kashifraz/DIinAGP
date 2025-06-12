<?php

namespace App\Controllers\Api;

/**
 * Test Controller
 * 
 * Simple test endpoint to verify API setup
 */
class TestController extends BaseApiController
{
    /**
     * Test endpoint - returns API status
     * 
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    public function index()
    {
        $db = \Config\Database::connect();
        
        $data = [
            'api_status' => 'operational',
            'database_connected' => false,
            'database_info' => null,
            'server_info' => [
                'php_version' => PHP_VERSION,
                'codeigniter_version' => \CodeIgniter\CodeIgniter::CI_VERSION,
                'server_time' => date('Y-m-d H:i:s'),
            ]
        ];
        
        // Test database connection
        try {
            $db->initialize();
            $data['database_connected'] = true;
            $data['database_info'] = [
                'driver' => $db->getPlatform(),
                'database' => $db->getDatabase(),
            ];
        } catch (\Exception $e) {
            $data['database_error'] = $e->getMessage();
        }
        
        return $this->success($data, 'API is operational');
    }

    /**
     * Test database connection endpoint
     * 
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    public function database()
    {
        try {
            $db = \Config\Database::connect();
            $db->initialize();
            
            // Try a simple query
            $query = $db->query('SELECT 1 as test');
            $result = $query->getRow();
            
            return $this->success([
                'connected' => true,
                'driver' => $db->getPlatform(),
                'database' => $db->getDatabase(),
                'test_query' => $result ? 'success' : 'failed'
            ], 'Database connection successful');
        } catch (\Exception $e) {
            return $this->error('Database connection failed: ' . $e->getMessage(), [
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


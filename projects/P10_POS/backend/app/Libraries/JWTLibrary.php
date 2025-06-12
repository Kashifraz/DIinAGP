<?php

namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use CodeIgniter\Config\Services;

class JWTLibrary
{
    private string $secretKey;
    private int $expirationTime;

    public function __construct()
    {
        $this->secretKey = getenv('JWT_SECRET_KEY') ?: 'your-secret-key-change-this-in-production';
        $this->expirationTime = 3600 * 24; // 24 hours
    }

    /**
     * Generate JWT token
     */
    public function generateToken(array $payload): string
    {
        $issuedAt = time();
        $expirationTime = $issuedAt + $this->expirationTime;

        $token = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'data' => $payload,
        ];

        return JWT::encode($token, $this->secretKey, 'HS256');
    }

    /**
     * Decode and validate JWT token
     */
    public function decodeToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return (array) $decoded->data;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get token from request header
     */
    public function getTokenFromRequest(): ?string
    {
        $request = Services::request();
        $authHeader = $request->getHeaderLine('Authorization');

        if (empty($authHeader)) {
            return null;
        }

        // Extract token from "Bearer {token}"
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Validate token and return user data
     */
    public function validateToken(?string $token = null): ?array
    {
        if ($token === null) {
            $token = $this->getTokenFromRequest();
        }

        if ($token === null) {
            return null;
        }

        return $this->decodeToken($token);
    }
}


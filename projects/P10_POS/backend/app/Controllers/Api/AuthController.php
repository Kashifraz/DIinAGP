<?php

namespace App\Controllers\Api;

use App\Models\UserModel;
use App\Libraries\JWTLibrary;
use CodeIgniter\HTTP\ResponseInterface;

class AuthController extends BaseApiController
{
    protected $userModel;
    protected $jwt;

    public function __construct()
    {
        $this->userModel = new UserModel();
        $this->jwt = new JWTLibrary();
    }

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    public function login()
    {
        try {
            // Get JSON input if available, otherwise get POST data
            $json = $this->request->getJSON(true);
            $email = $json['email'] ?? $this->request->getPost('email');
            $password = $json['password'] ?? $this->request->getPost('password');

            $rules = [
                'email'    => 'required|valid_email',
                'password' => 'required|min_length[8]',
            ];

            // Set data for validation
            $data = [
                'email' => $email,
                'password' => $password
            ];

            if (!$this->validate($rules)) {
                return $this->validationError($this->validator->getErrors());
            }

            // Find user by email
            $user = $this->userModel->findByEmail($email);

            if (!$user) {
                return $this->error('Invalid email or password', null, 401);
            }

            // Check if user is active
            if ($user['status'] !== 'active') {
                return $this->error('Your account is inactive. Please contact administrator.', null, 403);
            }

            // Verify password
            if (!$this->userModel->verifyPassword($password, $user['password_hash'])) {
                return $this->error('Invalid email or password', null, 401);
            }

            // Generate JWT token
            $tokenPayload = [
                'user_id' => $user['id'],
                'email'   => $user['email'],
                'role'    => $user['role'],
            ];

            $token = $this->jwt->generateToken($tokenPayload);

            // Remove sensitive data
            unset($user['password_hash']);
            unset($user['remember_token']);

            return $this->success([
                'token' => $token,
                'user'  => $user,
            ], 'Login successful');
        } catch (\Exception $e) {
            log_message('error', 'Login error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            return $this->error('An error occurred during login: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    public function logout()
    {
        // With JWT, logout is handled client-side by removing the token
        // But we can add token blacklisting here if needed
        return $this->success(null, 'Logout successful');
    }

    /**
     * Get current user endpoint
     * GET /api/auth/me
     */
    public function me()
    {
        $userId = $this->request->user['user_id'] ?? null;

        if (!$userId) {
            return $this->unauthorized();
        }

        $user = $this->userModel->find($userId);

        if (!$user) {
            return $this->notFound('User not found');
        }

        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['remember_token']);

        return $this->success($user, 'User retrieved successfully');
    }

    /**
     * Refresh token endpoint
     * POST /api/auth/refresh
     */
    public function refresh()
    {
        $tokenData = $this->request->user ?? null;

        if (!$tokenData) {
            return $this->unauthorized();
        }

        // Get fresh user data
        $user = $this->userModel->find($tokenData['user_id']);

        if (!$user || $user['status'] !== 'active') {
            return $this->error('User not found or inactive', null, 401);
        }

        // Generate new token
        $tokenPayload = [
            'user_id' => $user['id'],
            'email'   => $user['email'],
            'role'    => $user['role'],
        ];

        $token = $this->jwt->generateToken($tokenPayload);

        return $this->success([
            'token' => $token,
        ], 'Token refreshed successfully');
    }

    /**
     * Request password reset
     * POST /api/auth/password/reset-request
     */
    public function passwordResetRequest()
    {
        $json = $this->request->getJSON(true);
        $email = $json['email'] ?? $this->request->getPost('email');

        $rules = [
            'email' => 'required|valid_email',
        ];

        $data = ['email' => $email];

        if (!$this->validate($rules)) {
            return $this->validationError($this->validator->getErrors());
        }
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            // Don't reveal if email exists for security
            return $this->success(null, 'If the email exists, a password reset link has been sent.');
        }

        // Generate reset token
        $resetToken = bin2hex(random_bytes(32));
        $db = \Config\Database::connect();

        // Store reset token
        $db->table('password_resets')->insert([
            'email'      => $email,
            'token'      => $resetToken,
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        // TODO: Send email with reset link
        // For now, return token (remove in production)
        return $this->success([
            'reset_token' => $resetToken, // Remove this in production
        ], 'Password reset link sent to your email');
    }

    /**
     * Reset password
     * POST /api/auth/password/reset
     */
    public function passwordReset()
    {
        $json = $this->request->getJSON(true);
        $token = $json['token'] ?? $this->request->getPost('token');
        $email = $json['email'] ?? $this->request->getPost('email');
        $password = $json['password'] ?? $this->request->getPost('password');

        $rules = [
            'token'    => 'required',
            'email'    => 'required|valid_email',
            'password' => 'required|min_length[8]',
        ];

        $data = [
            'token' => $token,
            'email' => $email,
            'password' => $password
        ];

        if (!$this->validate($rules)) {
            return $this->validationError($this->validator->getErrors());
        }

        $db = \Config\Database::connect();
        $resetRecord = $db->table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->orderBy('created_at', 'DESC')
            ->get()
            ->getRowArray();

        if (!$resetRecord) {
            return $this->error('Invalid or expired reset token', null, 400);
        }

        // Check if token is not older than 1 hour
        $createdAt = strtotime($resetRecord['created_at']);
        if (time() - $createdAt > 3600) {
            return $this->error('Reset token has expired', null, 400);
        }

        // Update password
        $this->userModel->update(
            $this->userModel->findByEmail($email)['id'],
            ['password_hash' => $password]
        );

        // Delete used reset token
        $db->table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->delete();

        return $this->success(null, 'Password reset successfully');
    }
}


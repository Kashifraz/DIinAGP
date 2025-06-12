<?php
/**
 * Security and spam protection class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Security and spam protection class
 */
class Form_Plugin_Security {
    
    /**
     * Generate math captcha question
     *
     * @return array Captcha data
     */
    public function generate_captcha() {
        $num1 = rand(1, 10);
        $num2 = rand(1, 10);
        $operation = rand(0, 1); // 0 = addition, 1 = subtraction
        
        if ($operation === 0) {
            $question = sprintf(__('What is %d + %d?', 'form-plugin'), $num1, $num2);
            $answer = $num1 + $num2;
        } else {
            // Ensure positive result for subtraction
            if ($num1 < $num2) {
                $temp = $num1;
                $num1 = $num2;
                $num2 = $temp;
            }
            $question = sprintf(__('What is %d - %d?', 'form-plugin'), $num1, $num2);
            $answer = $num1 - $num2;
        }
        
        // Store answer in session
        if (!session_id()) {
            session_start();
        }
        
        $_SESSION['form_plugin_captcha'] = $answer;
        
        return array(
            'question' => $question,
            'answer' => $answer
        );
    }
    
    /**
     * Verify captcha answer
     *
     * @param int $user_answer User's answer
     * @return bool True if correct, false otherwise
     */
    public function verify_captcha($user_answer) {
        if (!session_id()) {
            session_start();
        }
        
        if (!isset($_SESSION['form_plugin_captcha'])) {
            return false;
        }
        
        $correct_answer = intval($_SESSION['form_plugin_captcha']);
        $user_answer = intval($user_answer);
        
        $is_correct = ($correct_answer === $user_answer);
        
        // Clear captcha from session after verification
        unset($_SESSION['form_plugin_captcha']);
        
        return $is_correct;
    }
    
    /**
     * Generate WordPress nonce for form
     *
     * @param string $action Nonce action
     * @return string Nonce value
     */
    public function generate_nonce($action = 'form_submission') {
        return wp_create_nonce('form_plugin_' . $action);
    }
    
    /**
     * Verify WordPress nonce
     *
     * @param string $nonce Nonce value
     * @param string $action Nonce action
     * @return bool True if valid, false otherwise
     */
    public function verify_nonce($nonce, $action = 'form_submission') {
        return wp_verify_nonce($nonce, 'form_plugin_' . $action);
    }
    
    /**
     * Sanitize form data
     *
     * @param array $data Form data
     * @return array Sanitized data
     */
    public function sanitize_form_data($data) {
        $sanitized = array();
        
        foreach ($data as $key => $value) {
            $key = sanitize_key($key);
            
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize_form_data($value);
            } else {
                // Sanitize based on field type if available
                $sanitized[$key] = $this->sanitize_field_value($value, $key);
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize individual field value
     *
     * @param mixed $value Field value
     * @param string $field_name Field name
     * @return mixed Sanitized value
     */
    private function sanitize_field_value($value, $field_name) {
        // Check if it's an email field
        if (strpos($field_name, 'email') !== false) {
            return sanitize_email($value);
        }
        
        // Check if it's a URL field
        if (strpos($field_name, 'url') !== false || strpos($field_name, 'website') !== false) {
            return esc_url_raw($value);
        }
        
        // Check if it's a number field
        if (strpos($field_name, 'number') !== false || strpos($field_name, 'age') !== false) {
            return intval($value);
        }
        
        // Default to text sanitization
        return sanitize_text_field($value);
    }
    
    /**
     * Validate form submission
     *
     * @param array $data Form data
     * @param array $form_config Form configuration
     * @return array Validation results
     */
    public function validate_form_submission($data, $form_config) {
        $errors = array();
        
        // Check nonce
        if (!isset($data['_wpnonce']) || !$this->verify_nonce($data['_wpnonce'])) {
            $errors['nonce'] = __('Security check failed. Please try again.', 'form-plugin');
        }
        
        // Check captcha if enabled
        if (isset($form_config['enable_captcha']) && $form_config['enable_captcha']) {
            if (!isset($data['captcha_answer']) || !$this->verify_captcha($data['captcha_answer'])) {
                $errors['captcha'] = __('Please solve the math problem correctly.', 'form-plugin');
            }
        }
        
        // Validate required fields
        if (isset($form_config['fields']) && is_array($form_config['fields'])) {
            foreach ($form_config['fields'] as $field) {
                if (isset($field['required']) && $field['required']) {
                    $field_name = $field['name'] ?? $field['id'] ?? '';
                    if (empty($data[$field_name])) {
                        $field_label = $field['label'] ?? $field_name;
                        $errors[$field_name] = sprintf(__('%s is required.', 'form-plugin'), $field_label);
                    }
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Check if user can submit form
     *
     * @param int $form_id Form ID
     * @return bool True if user can submit, false otherwise
     */
    public function can_submit_form($form_id) {
        // Check if form exists and is active
        $database = new Form_Plugin_Database();
        $form = $database->get_form($form_id);
        
        if (!$form || $form->status !== 'active') {
            return false;
        }
        
        // Check user capabilities (if needed)
        // For now, allow all users to submit forms
        
        return true;
    }
    
    /**
     * Rate limiting check
     *
     * @param string $ip User IP address
     * @param int $form_id Form ID
     * @return bool True if within limits, false if rate limited
     */
    public function check_rate_limit($ip, $form_id) {
        global $wpdb;
        
        $submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        
        // Check submissions in the last hour from this IP
        $recent_submissions = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$submissions_table} 
                WHERE user_ip = %s AND form_id = %d 
                AND submitted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)",
                $ip,
                $form_id
            )
        );
        
        // Allow maximum 5 submissions per hour per IP per form
        return intval($recent_submissions) < 5;
    }
    
    /**
     * Log security event
     *
     * @param string $event Event type
     * @param array $data Event data
     */
    public function log_security_event($event, $data = array()) {
        // Log to WordPress debug log if enabled
        if (defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
            error_log('Form Plugin Security Event: ' . $event . ' - ' . wp_json_encode($data));
        }
    }
}

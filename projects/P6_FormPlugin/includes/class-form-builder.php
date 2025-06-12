<?php
/**
 * Form Builder class for managing form operations
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Form Builder class
 */
class Form_Plugin_Form_Builder {
    
    /**
     * Database instance
     *
     * @var Form_Plugin_Database
     */
    private $database;
    
    /**
     * Field manager instance
     *
     * @var Form_Plugin_Field_Manager
     */
    private $field_manager;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->database = new Form_Plugin_Database();
        $this->field_manager = new Form_Plugin_Field_Manager();
    }
    
    /**
     * Create a new form
     *
     * @param array $form_data Form data
     * @return array Result array with success status and form ID
     */
    public function create_form($form_data) {
        // Validate form data
        $validation_result = $this->validate_form_data($form_data);
        if (!$validation_result['valid']) {
            return array(
                'success' => false,
                'message' => 'Form validation failed',
                'errors' => $validation_result['errors']
            );
        }
        
        // Sanitize form data
        $sanitized_data = $this->sanitize_form_data($form_data);
        
        // Create form in database
        $form_id = $this->database->create_form($sanitized_data);
        
        if ($form_id) {
            return array(
                'success' => true,
                'message' => 'Form created successfully',
                'form_id' => $form_id
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to create form',
                'errors' => array('database' => 'Database error occurred')
            );
        }
    }
    
    /**
     * Update an existing form
     *
     * @param int $form_id Form ID
     * @param array $form_data Form data
     * @return array Result array with success status
     */
    public function update_form($form_id, $form_data) {
        // Check if form exists
        $existing_form = $this->database->get_form($form_id);
        if (!$existing_form) {
            return array(
                'success' => false,
                'message' => 'Form not found',
                'errors' => array('form_id' => 'Form does not exist')
            );
        }
        
        // Validate form data
        $validation_result = $this->validate_form_data($form_data);
        if (!$validation_result['valid']) {
            return array(
                'success' => false,
                'message' => 'Form validation failed',
                'errors' => $validation_result['errors']
            );
        }
        
        // Sanitize form data
        $sanitized_data = $this->sanitize_form_data($form_data);
        
        // Update form in database
        $result = $this->database->update_form($form_id, $sanitized_data);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Form updated successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to update form',
                'errors' => array('database' => 'Database error occurred')
            );
        }
    }
    
    /**
     * Delete a form
     *
     * @param int $form_id Form ID
     * @return array Result array with success status
     */
    public function delete_form($form_id) {
        // Check if form exists
        $existing_form = $this->database->get_form($form_id);
        if (!$existing_form) {
            return array(
                'success' => false,
                'message' => 'Form not found',
                'errors' => array('form_id' => 'Form does not exist')
            );
        }
        
        // Delete form from database (cascade will handle submissions)
        $result = $this->database->delete_form($form_id);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Form deleted successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to delete form',
                'errors' => array('database' => 'Database error occurred')
            );
        }
    }
    
    /**
     * Duplicate a form
     *
     * @param int $form_id Form ID to duplicate
     * @return array Result array with success status and new form ID
     */
    public function duplicate_form($form_id) {
        // Get original form
        $original_form = $this->database->get_form($form_id);
        if (!$original_form) {
            return array(
                'success' => false,
                'message' => 'Form not found',
                'errors' => array('form_id' => 'Form does not exist')
            );
        }
        
        // Prepare duplicate data
        $duplicate_data = array(
            'title' => $original_form->title . ' (Copy)',
            'description' => $original_form->description,
            'form_data' => $original_form->form_data,
            'settings' => $original_form->settings,
            'status' => 'inactive' // Start as inactive
        );
        
        // Create duplicate
        $new_form_id = $this->database->create_form($duplicate_data);
        
        if ($new_form_id) {
            return array(
                'success' => true,
                'message' => 'Form duplicated successfully',
                'new_form_id' => $new_form_id
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to duplicate form',
                'errors' => array('database' => 'Database error occurred')
            );
        }
    }
    
    /**
     * Get form with full data
     *
     * @param int $form_id Form ID
     * @return array Result array with form data
     */
    public function get_form($form_id) {
        $form = $this->database->get_form($form_id);
        
        if ($form) {
            return array(
                'success' => true,
                'form' => $form
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Form not found'
            );
        }
    }
    
    /**
     * Get forms list with pagination
     *
     * @param array $args Query arguments
     * @return array Result array with forms and pagination info
     */
    public function get_forms($args = array()) {
        $defaults = array(
            'status' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $forms = $this->database->get_forms($args);
        $total_forms = $this->database->get_forms_count($args['status']);
        
        return array(
            'success' => true,
            'forms' => $forms,
            'pagination' => array(
                'total' => $total_forms,
                'limit' => $args['limit'],
                'offset' => $args['offset'],
                'pages' => ceil($total_forms / $args['limit'])
            )
        );
    }
    
    /**
     * Update form status
     *
     * @param int $form_id Form ID
     * @param string $status New status
     * @return array Result array with success status
     */
    public function update_form_status($form_id, $status) {
        if (!in_array($status, array('active', 'inactive'))) {
            return array(
                'success' => false,
                'message' => 'Invalid status',
                'errors' => array('status' => 'Status must be active or inactive')
            );
        }
        
        $result = $this->database->update_form($form_id, array('status' => $status));
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Form status updated successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to update form status'
            );
        }
    }
    
    /**
     * Validate form data
     *
     * @param array $form_data Form data to validate
     * @return array Validation result
     */
    private function validate_form_data($form_data) {
        $errors = array();
        
        // Validate title
        if (empty($form_data['title'])) {
            $errors['title'] = 'Form title is required';
        } elseif (strlen($form_data['title']) > 255) {
            $errors['title'] = 'Form title must be less than 255 characters';
        }
        
        // Validate status
        if (isset($form_data['status']) && !in_array($form_data['status'], array('active', 'inactive'))) {
            $errors['status'] = 'Status must be active or inactive';
        }
        
        // Validate form_data structure
        if (isset($form_data['form_data']) && !is_array($form_data['form_data'])) {
            $errors['form_data'] = 'Form data must be an array';
        }
        
        // Validate settings structure
        if (isset($form_data['settings']) && !is_array($form_data['settings'])) {
            $errors['settings'] = 'Settings must be an array';
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Sanitize form data
     *
     * @param array $form_data Form data to sanitize
     * @return array Sanitized form data
     */
    private function sanitize_form_data($form_data) {
        $sanitized = array();
        
        if (isset($form_data['title'])) {
            $sanitized['title'] = sanitize_text_field($form_data['title']);
        }
        
        if (isset($form_data['description'])) {
            $sanitized['description'] = sanitize_textarea_field($form_data['description']);
        }
        
        if (isset($form_data['form_data'])) {
            $sanitized['form_data'] = $form_data['form_data']; // Will be JSON encoded
        }
        
        if (isset($form_data['settings'])) {
            $sanitized['settings'] = $form_data['settings']; // Will be JSON encoded
        }
        
        if (isset($form_data['status'])) {
            $sanitized['status'] = sanitize_text_field($form_data['status']);
        }
        
        return $sanitized;
    }
    
    /**
     * Serialize form data for storage
     *
     * @param array $form_data Form data
     * @return string Serialized form data
     */
    public function serialize_form_data($form_data) {
        return wp_json_encode($form_data);
    }
    
    /**
     * Deserialize form data from storage
     *
     * @param string $serialized_data Serialized form data
     * @return array Form data array
     */
    public function deserialize_form_data($serialized_data) {
        return json_decode($serialized_data, true);
    }
    
    /**
     * Get form statistics
     *
     * @param int $form_id Form ID
     * @return array Form statistics
     */
    public function get_form_statistics($form_id) {
        global $wpdb;
        
        $submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        
        // Get submission count
        $submission_count = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$submissions_table} WHERE form_id = %d",
                $form_id
            )
        );
        
        // Get recent submissions (last 7 days)
        $recent_submissions = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM {$submissions_table} 
                WHERE form_id = %d AND submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
                $form_id
            )
        );
        
        return array(
            'total_submissions' => intval($submission_count),
            'recent_submissions' => intval($recent_submissions),
            'form_id' => $form_id
        );
    }
    
    /**
     * Get field manager instance
     *
     * @return Form_Plugin_Field_Manager
     */
    public function get_field_manager() {
        return $this->field_manager;
    }
    
    /**
     * Get available field types
     *
     * @return array Field types
     */
    public function get_field_types() {
        return $this->field_manager->get_all_field_info();
    }
    
    /**
     * Add field to form
     *
     * @param int $form_id Form ID
     * @param string $field_type Field type
     * @param array $field_config Field configuration
     * @return array Result array
     */
    public function add_field_to_form($form_id, $field_type, $field_config) {
        // Validate field configuration
        $validation_result = $this->field_manager->validate_field_config($field_type, $field_config);
        if (!$validation_result['valid']) {
            return array(
                'success' => false,
                'message' => 'Field validation failed',
                'errors' => $validation_result['errors']
            );
        }
        
        // Sanitize field configuration
        $sanitized_config = $this->field_manager->sanitize_field_config($field_type, $field_config);
        
        // Get current form
        $form = $this->get_form($form_id);
        if (!$form) {
            return array(
                'success' => false,
                'message' => 'Form not found'
            );
        }
        
        // Get current field configuration
        $field_config_data = $form->field_config ?: array();
        
        // Generate unique field ID if not provided
        if (empty($sanitized_config['id'])) {
            $sanitized_config['id'] = 'field_' . uniqid();
        }
        
        // Add field to configuration
        $field_config_data[] = $sanitized_config;
        
        // Update form
        $update_data = array(
            'field_config' => $field_config_data
        );
        
        $result = $this->database->update_form($form_id, $update_data);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Field added successfully',
                'field_id' => $sanitized_config['id']
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to add field'
            );
        }
    }
    
    /**
     * Update field in form
     *
     * @param int $form_id Form ID
     * @param string $field_id Field ID
     * @param array $field_config Field configuration
     * @return array Result array
     */
    public function update_field_in_form($form_id, $field_id, $field_config) {
        // Get current form
        $form = $this->get_form($form_id);
        if (!$form) {
            return array(
                'success' => false,
                'message' => 'Form not found'
            );
        }
        
        // Get current field configuration
        $field_config_data = $form->field_config ?: array();
        
        // Find and update field
        $field_found = false;
        foreach ($field_config_data as $index => $field) {
            if ($field['id'] === $field_id) {
                // Validate field configuration
                $validation_result = $this->field_manager->validate_field_config($field['type'], $field_config);
                if (!$validation_result['valid']) {
                    return array(
                        'success' => false,
                        'message' => 'Field validation failed',
                        'errors' => $validation_result['errors']
                    );
                }
                
                // Sanitize field configuration
                $sanitized_config = $this->field_manager->sanitize_field_config($field['type'], $field_config);
                $sanitized_config['id'] = $field_id; // Preserve field ID
                $sanitized_config['type'] = $field['type']; // Preserve field type
                
                $field_config_data[$index] = $sanitized_config;
                $field_found = true;
                break;
            }
        }
        
        if (!$field_found) {
            return array(
                'success' => false,
                'message' => 'Field not found'
            );
        }
        
        // Update form
        $update_data = array(
            'field_config' => $field_config_data
        );
        
        $result = $this->database->update_form($form_id, $update_data);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Field updated successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to update field'
            );
        }
    }
    
    /**
     * Remove field from form
     *
     * @param int $form_id Form ID
     * @param string $field_id Field ID
     * @return array Result array
     */
    public function remove_field_from_form($form_id, $field_id) {
        // Get current form
        $form = $this->get_form($form_id);
        if (!$form) {
            return array(
                'success' => false,
                'message' => 'Form not found'
            );
        }
        
        // Get current field configuration
        $field_config_data = $form->field_config ?: array();
        
        // Find and remove field
        $field_found = false;
        foreach ($field_config_data as $index => $field) {
            if ($field['id'] === $field_id) {
                unset($field_config_data[$index]);
                $field_config_data = array_values($field_config_data); // Re-index array
                $field_found = true;
                break;
            }
        }
        
        if (!$field_found) {
            return array(
                'success' => false,
                'message' => 'Field not found'
            );
        }
        
        // Update form
        $update_data = array(
            'field_config' => $field_config_data
        );
        
        $result = $this->database->update_form($form_id, $update_data);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Field removed successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to remove field'
            );
        }
    }
    
    /**
     * Reorder fields in form
     *
     * @param int $form_id Form ID
     * @param array $field_order Array of field IDs in new order
     * @return array Result array
     */
    public function reorder_fields_in_form($form_id, $field_order) {
        // Get current form
        $form = $this->get_form($form_id);
        if (!$form) {
            return array(
                'success' => false,
                'message' => 'Form not found'
            );
        }
        
        // Get current field configuration
        $field_config_data = $form->field_config ?: array();
        
        // Create new ordered array
        $ordered_fields = array();
        foreach ($field_order as $field_id) {
            foreach ($field_config_data as $field) {
                if ($field['id'] === $field_id) {
                    $ordered_fields[] = $field;
                    break;
                }
            }
        }
        
        // Update form
        $update_data = array(
            'field_config' => $ordered_fields
        );
        
        $result = $this->database->update_form($form_id, $update_data);
        
        if ($result) {
            return array(
                'success' => true,
                'message' => 'Fields reordered successfully'
            );
        } else {
            return array(
                'success' => false,
                'message' => 'Failed to reorder fields'
            );
        }
    }
}

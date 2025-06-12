<?php
/**
 * Field manager class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Field manager class
 */
class Form_Plugin_Field_Manager {
    
    /**
     * Available field types
     *
     * @var array
     */
    private $field_types = array();
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->load_field_types();
    }
    
    /**
     * Load all field type classes
     */
    private function load_field_types() {
        $field_types_dir = FORM_PLUGIN_PLUGIN_DIR . 'includes/field-types/';
        
        // Load base field class first
        require_once $field_types_dir . 'class-base-field.php';
        
        // Load all field type classes
        $field_files = glob($field_types_dir . 'class-*-field.php');
        
        foreach ($field_files as $file) {
            require_once $file;
        }
        
        // Register field types
        $this->register_field_types();
    }
    
    /**
     * Register all field types
     */
    private function register_field_types() {
        $this->field_types = array(
            'text' => 'Form_Plugin_Text_Field',
            'email' => 'Form_Plugin_Email_Field',
            'textarea' => 'Form_Plugin_Textarea_Field',
            'number' => 'Form_Plugin_Number_Field',
            'date' => 'Form_Plugin_Date_Field',
            'dropdown' => 'Form_Plugin_Dropdown_Field',
            'radio' => 'Form_Plugin_Radio_Field',
            'checkbox' => 'Form_Plugin_Checkbox_Field'
        );
    }
    
    /**
     * Get all available field types
     *
     * @return array Field types
     */
    public function get_field_types() {
        return $this->field_types;
    }
    
    /**
     * Get field type class name
     *
     * @param string $type Field type
     * @return string|false Class name or false if not found
     */
    public function get_field_class($type) {
        return isset($this->field_types[$type]) ? $this->field_types[$type] : false;
    }
    
    /**
     * Create field instance
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @return Form_Plugin_Base_Field|false Field instance or false on failure
     */
    public function create_field($type, $config = array()) {
        $class_name = $this->get_field_class($type);
        
        if (!$class_name || !class_exists($class_name)) {
            return false;
        }
        
        return new $class_name($config);
    }
    
    /**
     * Get field type info
     *
     * @param string $type Field type
     * @return array|false Field info or false if not found
     */
    public function get_field_info($type) {
        $field = $this->create_field($type);
        
        if (!$field) {
            return false;
        }
        
        return array(
            'type' => $field->get_type(),
            'label' => $field->get_label(),
            'icon' => $field->get_icon()
        );
    }
    
    /**
     * Get all field types info
     *
     * @return array All field types info
     */
    public function get_all_field_info() {
        $field_info = array();
        
        foreach ($this->field_types as $type => $class_name) {
            $field_info[$type] = $this->get_field_info($type);
        }
        
        return $field_info;
    }
    
    /**
     * Validate field configuration
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @return array Validation result
     */
    public function validate_field_config($type, $config) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return array(
                'valid' => false,
                'errors' => array(__('Invalid field type.', 'form-plugin'))
            );
        }
        
        // Basic validation
        $errors = array();
        
        if (empty($config['label'])) {
            $errors[] = __('Field label is required.', 'form-plugin');
        }
        
        if (empty($config['id'])) {
            $errors[] = __('Field ID is required.', 'form-plugin');
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Sanitize field configuration
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @return array Sanitized configuration
     */
    public function sanitize_field_config($type, $config) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return $config;
        }
        
        $sanitized = array();
        
        // Sanitize basic fields
        $sanitized['id'] = sanitize_text_field($config['id']);
        $sanitized['type'] = sanitize_text_field($config['type']);
        $sanitized['label'] = sanitize_text_field($config['label']);
        $sanitized['placeholder'] = sanitize_text_field($config['placeholder']);
        $sanitized['help_text'] = sanitize_textarea_field($config['help_text']);
        $sanitized['required'] = !empty($config['required']);
        $sanitized['css_class'] = sanitize_text_field($config['css_class']);
        
        // Sanitize type-specific fields
        switch ($type) {
            case 'text':
            case 'email':
                $sanitized['max_length'] = intval($config['max_length']);
                $sanitized['min_length'] = intval($config['min_length']);
                $sanitized['pattern'] = sanitize_text_field($config['pattern']);
                break;
                
            case 'textarea':
                $sanitized['rows'] = intval($config['rows']);
                $sanitized['max_length'] = intval($config['max_length']);
                $sanitized['min_length'] = intval($config['min_length']);
                break;
                
            case 'number':
                $sanitized['min'] = is_numeric($config['min']) ? floatval($config['min']) : '';
                $sanitized['max'] = is_numeric($config['max']) ? floatval($config['max']) : '';
                $sanitized['step'] = is_numeric($config['step']) ? floatval($config['step']) : '1';
                break;
                
            case 'date':
                $sanitized['min_date'] = sanitize_text_field($config['min_date']);
                $sanitized['max_date'] = sanitize_text_field($config['max_date']);
                break;
                
            case 'dropdown':
            case 'radio':
            case 'checkbox':
                $sanitized['options'] = array();
                if (isset($config['options']) && is_array($config['options'])) {
                    foreach ($config['options'] as $option) {
                        $sanitized['options'][] = array(
                            'label' => sanitize_text_field($option['label']),
                            'value' => sanitize_text_field($option['value'])
                        );
                    }
                }
                $sanitized['layout'] = sanitize_text_field($config['layout']);
                
                if ($type === 'dropdown') {
                    $sanitized['multiple'] = !empty($config['multiple']);
                    $sanitized['placeholder_text'] = sanitize_text_field($config['placeholder_text']);
                }
                
                if ($type === 'checkbox') {
                    $sanitized['min_selections'] = intval($config['min_selections']);
                    $sanitized['max_selections'] = intval($config['max_selections']);
                }
                break;
        }
        
        return $sanitized;
    }
    
    /**
     * Render field
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @param array $args Additional arguments
     * @return string Field HTML
     */
    public function render_field($type, $config, $args = array()) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return '';
        }
        
        return $field->render($args);
    }
    
    /**
     * Render field configuration form
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @return string Configuration form HTML
     */
    public function render_field_config_form($type, $config = array()) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return '';
        }
        
        $html = '<div class="field-config-form">';
        $html .= $field->render_config_form();
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Validate field value
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @param mixed $value Field value
     * @return array Validation result
     */
    public function validate_field_value($type, $config, $value) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return array(
                'valid' => false,
                'errors' => array(__('Invalid field type.', 'form-plugin'))
            );
        }
        
        return $field->validate($value);
    }
    
    /**
     * Sanitize field value
     *
     * @param string $type Field type
     * @param array $config Field configuration
     * @param mixed $value Field value
     * @return mixed Sanitized value
     */
    public function sanitize_field_value($type, $config, $value) {
        $field = $this->create_field($type, $config);
        
        if (!$field) {
            return $value;
        }
        
        return $field->sanitize($value);
    }
}

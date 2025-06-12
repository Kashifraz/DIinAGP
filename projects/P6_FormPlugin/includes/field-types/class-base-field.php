<?php
/**
 * Base field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Base field class
 */
abstract class Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type;
    
    /**
     * Field configuration
     *
     * @var array
     */
    protected $config;
    
    /**
     * Constructor
     *
     * @param array $config Field configuration
     */
    public function __construct($config = array()) {
        $this->config = wp_parse_args($config, $this->get_default_config());
    }
    
    /**
     * Get field type
     *
     * @return string
     */
    public function get_type() {
        return $this->type;
    }
    
    /**
     * Get field configuration
     *
     * @return array
     */
    public function get_config() {
        return $this->config;
    }
    
    /**
     * Get field value
     *
     * @param string $key Configuration key
     * @param mixed $default Default value
     * @return mixed
     */
    public function get_value($key, $default = '') {
        return isset($this->config[$key]) ? $this->config[$key] : $default;
    }
    
    /**
     * Set field value
     *
     * @param string $key Configuration key
     * @param mixed $value Value to set
     */
    public function set_value($key, $value) {
        $this->config[$key] = $value;
    }
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array(
            'id' => '',
            'type' => $this->type,
            'label' => '',
            'placeholder' => '',
            'required' => false,
            'help_text' => '',
            'css_class' => '',
            'validation' => array()
        );
    }
    
    /**
     * Validate field value
     *
     * @param mixed $value Field value
     * @return array Validation result
     */
    public function validate($value) {
        $errors = array();
        
        // Required validation
        if ($this->get_value('required') && empty($value)) {
            $errors[] = sprintf(__('%s is required.', 'form-plugin'), $this->get_value('label'));
        }
        
        // Custom validation
        $validation_rules = $this->get_value('validation', array());
        foreach ($validation_rules as $rule => $rule_value) {
            $validation_result = $this->validate_rule($rule, $value, $rule_value);
            if (!$validation_result['valid']) {
                $errors[] = $validation_result['message'];
            }
        }
        
        return array(
            'valid' => empty($errors),
            'errors' => $errors
        );
    }
    
    /**
     * Validate specific rule
     *
     * @param string $rule Rule name
     * @param mixed $value Field value
     * @param mixed $rule_value Rule value
     * @return array Validation result
     */
    protected function validate_rule($rule, $value, $rule_value) {
        switch ($rule) {
            case 'min_length':
                if (strlen($value) < $rule_value) {
                    return array(
                        'valid' => false,
                        'message' => sprintf(__('%s must be at least %d characters long.', 'form-plugin'), $this->get_value('label'), $rule_value)
                    );
                }
                break;
                
            case 'max_length':
                if (strlen($value) > $rule_value) {
                    return array(
                        'valid' => false,
                        'message' => sprintf(__('%s must not exceed %d characters.', 'form-plugin'), $this->get_value('label'), $rule_value)
                    );
                }
                break;
                
            case 'pattern':
                if (!preg_match($rule_value, $value)) {
                    return array(
                        'valid' => false,
                        'message' => sprintf(__('%s format is invalid.', 'form-plugin'), $this->get_value('label'))
                    );
                }
                break;
        }
        
        return array('valid' => true, 'message' => '');
    }
    
    /**
     * Render field HTML
     *
     * @param array $args Additional arguments
     * @return string Field HTML
     */
    abstract public function render($args = array());
    
    /**
     * Render field configuration form
     *
     * @return string Configuration form HTML
     */
    abstract public function render_config_form();
    
    /**
     * Get field icon
     *
     * @return string Field icon class
     */
    abstract public function get_icon();
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    abstract public function get_label();
    
    /**
     * Sanitize field value
     *
     * @param mixed $value Field value
     * @return mixed Sanitized value
     */
    public function sanitize($value) {
        return sanitize_text_field($value);
    }
    
    /**
     * Get field attributes
     *
     * @param array $additional_attrs Additional attributes
     * @return string Field attributes
     */
    protected function get_field_attributes($additional_attrs = array()) {
        $attrs = array(
            'id' => $this->get_value('id'),
            'name' => $this->get_value('id'),
            'class' => $this->get_field_classes(),
            'placeholder' => $this->get_value('placeholder')
        );
        
        if ($this->get_value('required')) {
            $attrs['required'] = 'required';
        }
        
        $attrs = array_merge($attrs, $additional_attrs);
        
        $attributes = array();
        foreach ($attrs as $key => $value) {
            if (!empty($value)) {
                $attributes[] = sprintf('%s="%s"', esc_attr($key), esc_attr($value));
            }
        }
        
        return implode(' ', $attributes);
    }
    
    /**
     * Get field CSS classes
     *
     * @return string CSS classes
     */
    protected function get_field_classes() {
        $classes = array('form-control');
        
        if ($this->get_value('css_class')) {
            $classes[] = $this->get_value('css_class');
        }
        
        return implode(' ', $classes);
    }
}

<?php
/**
 * Text field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Text field class
 */
class Form_Plugin_Text_Field extends Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type = 'text';
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array_merge(parent::get_default_config(), array(
            'max_length' => '',
            'min_length' => '',
            'pattern' => ''
        ));
    }
    
    /**
     * Render field HTML
     *
     * @param array $args Additional arguments
     * @return string Field HTML
     */
    public function render($args = array()) {
        $value = isset($args['value']) ? $args['value'] : '';
        $field_id = $this->get_value('id');
        $label = $this->get_value('label');
        $help_text = $this->get_value('help_text');
        $required = $this->get_value('required');
        
        $attributes = $this->get_field_attributes(array(
            'type' => 'text',
            'value' => esc_attr($value),
            'maxlength' => $this->get_value('max_length')
        ));
        
        $html = '<div class="form-group">';
        
        if (!empty($label)) {
            $html .= sprintf(
                '<label for="%s" class="form-label">%s%s</label>',
                esc_attr($field_id),
                esc_html($label),
                $required ? ' <span class="required">*</span>' : ''
            );
        }
        
        $html .= sprintf('<input %s>', $attributes);
        
        if (!empty($help_text)) {
            $html .= sprintf('<div class="form-text">%s</div>', esc_html($help_text));
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render field configuration form
     *
     * @return string Configuration form HTML
     */
    public function render_config_form() {
        $html = '';
        
        // Label
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-label" class="form-label">' . __('Label', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-label" name="label" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('label')),
            __('Enter field label', 'form-plugin')
        );
        $html .= '</div>';
        
        // Placeholder
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-placeholder" class="form-label">' . __('Placeholder', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-placeholder" name="placeholder" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('placeholder')),
            __('Enter placeholder text', 'form-plugin')
        );
        $html .= '</div>';
        
        // Required
        $html .= '<div class="mb-3">';
        $html .= '<div class="form-check">';
        $html .= sprintf(
            '<input type="checkbox" id="field-required" name="required" class="form-check-input" value="1" %s>',
            $this->get_value('required') ? 'checked' : ''
        );
        $html .= '<label for="field-required" class="form-check-label">' . __('Required field', 'form-plugin') . '</label>';
        $html .= '</div>';
        $html .= '</div>';
        
        // Help text
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-help-text" class="form-label">' . __('Help Text', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<textarea id="field-help-text" name="help_text" class="form-control" rows="2" placeholder="%s">%s</textarea>',
            __('Enter help text for users', 'form-plugin'),
            esc_textarea($this->get_value('help_text'))
        );
        $html .= '</div>';
        
        // Max length
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-max-length" class="form-label">' . __('Maximum Length', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-max-length" name="max_length" class="form-control" value="%s" min="1" placeholder="%s">',
            esc_attr($this->get_value('max_length')),
            __('No limit', 'form-plugin')
        );
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Get field icon
     *
     * @return string Field icon class
     */
    public function get_icon() {
        return 'dashicons-editor-textcolor';
    }
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    public function get_label() {
        return __('Text Field', 'form-plugin');
    }
    
    /**
     * Validate field value
     *
     * @param mixed $value Field value
     * @return array Validation result
     */
    public function validate($value) {
        $result = parent::validate($value);
        
        if (!$result['valid']) {
            return $result;
        }
        
        // Max length validation
        $max_length = $this->get_value('max_length');
        if (!empty($max_length) && strlen($value) > $max_length) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s must not exceed %d characters.', 'form-plugin'), $this->get_value('label'), $max_length))
            );
        }
        
        // Min length validation
        $min_length = $this->get_value('min_length');
        if (!empty($min_length) && strlen($value) < $min_length) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s must be at least %d characters long.', 'form-plugin'), $this->get_value('label'), $min_length))
            );
        }
        
        // Pattern validation
        $pattern = $this->get_value('pattern');
        if (!empty($pattern) && !preg_match($pattern, $value)) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s format is invalid.', 'form-plugin'), $this->get_value('label')))
            );
        }
        
        return $result;
    }
}

<?php
/**
 * Number field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Number field class
 */
class Form_Plugin_Number_Field extends Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type = 'number';
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array_merge(parent::get_default_config(), array(
            'min' => '',
            'max' => '',
            'step' => '1',
            'decimal_places' => ''
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
            'type' => 'number',
            'value' => esc_attr($value),
            'min' => $this->get_value('min'),
            'max' => $this->get_value('max'),
            'step' => $this->get_value('step')
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
        $html = '<div class="field-config-form">';
        
        // Label
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-label" class="form-label">' . __('Label', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-label" name="label" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('label')),
            __('Enter field label', 'form-plugin')
        );
        $html .= '</div>';
        
        // Placeholder
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-placeholder" class="form-label">' . __('Placeholder', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-placeholder" name="placeholder" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('placeholder')),
            __('Enter placeholder text', 'form-plugin')
        );
        $html .= '</div>';
        
        // Required
        $html .= '<div class="form-group mb-3">';
        $html .= '<div class="form-check">';
        $html .= sprintf(
            '<input type="checkbox" id="field-required" name="required" class="form-check-input" value="1" %s>',
            $this->get_value('required') ? 'checked' : ''
        );
        $html .= '<label for="field-required" class="form-check-label">' . __('Required field', 'form-plugin') . '</label>';
        $html .= '</div>';
        $html .= '</div>';
        
        // Help text
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-help-text" class="form-label">' . __('Help Text', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<textarea id="field-help-text" name="help_text" class="form-control" rows="2" placeholder="%s">%s</textarea>',
            __('Enter help text for users', 'form-plugin'),
            esc_textarea($this->get_value('help_text'))
        );
        $html .= '</div>';
        
        // Min value
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-min" class="form-label">' . __('Minimum Value', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-min" name="min" class="form-control" value="%s" step="any" placeholder="%s">',
            esc_attr($this->get_value('min')),
            __('No minimum', 'form-plugin')
        );
        $html .= '</div>';
        
        // Max value
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-max" class="form-label">' . __('Maximum Value', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-max" name="max" class="form-control" value="%s" step="any" placeholder="%s">',
            esc_attr($this->get_value('max')),
            __('No maximum', 'form-plugin')
        );
        $html .= '</div>';
        
        // Step
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-step" class="form-label">' . __('Step', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-step" name="step" class="form-control" value="%s" step="any" min="0.01">',
            esc_attr($this->get_value('step'))
        );
        $html .= '<div class="form-text">' . __('Increment step for the number input', 'form-plugin') . '</div>';
        $html .= '</div>';
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Get field icon
     *
     * @return string Field icon class
     */
    public function get_icon() {
        return 'dashicons-calculator';
    }
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    public function get_label() {
        return __('Number Field', 'form-plugin');
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
        
        // Check if value is numeric
        if (!empty($value) && !is_numeric($value)) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s must be a valid number.', 'form-plugin'), $this->get_value('label')))
            );
        }
        
        // Min value validation
        $min = $this->get_value('min');
        if (!empty($min) && $value < $min) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s must be at least %s.', 'form-plugin'), $this->get_value('label'), $min))
            );
        }
        
        // Max value validation
        $max = $this->get_value('max');
        if (!empty($max) && $value > $max) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s must not exceed %s.', 'form-plugin'), $this->get_value('label'), $max))
            );
        }
        
        return $result;
    }
    
    /**
     * Sanitize field value
     *
     * @param mixed $value Field value
     * @return mixed Sanitized value
     */
    public function sanitize($value) {
        return is_numeric($value) ? floatval($value) : 0;
    }
}

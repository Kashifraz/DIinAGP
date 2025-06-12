<?php
/**
 * Dropdown field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Dropdown field class
 */
class Form_Plugin_Dropdown_Field extends Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type = 'dropdown';
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array_merge(parent::get_default_config(), array(
            'options' => array(),
            'multiple' => false,
            'placeholder_text' => __('Select an option', 'form-plugin')
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
        $options = $this->get_value('options', array());
        $multiple = $this->get_value('multiple');
        $placeholder_text = $this->get_value('placeholder_text');
        
        $attributes = $this->get_field_attributes(array(
            'multiple' => $multiple ? 'multiple' : ''
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
        
        $html .= sprintf('<select %s>', $attributes);
        
        // Add placeholder option
        if (!$multiple) {
            $html .= sprintf(
                '<option value="" %s>%s</option>',
                empty($value) ? 'selected' : '',
                esc_html($placeholder_text)
            );
        }
        
        // Add options
        foreach ($options as $option) {
            $option_value = isset($option['value']) ? $option['value'] : $option['label'];
            $option_label = isset($option['label']) ? $option['label'] : $option_value;
            $selected = '';
            
            if ($multiple) {
                if (is_array($value) && in_array($option_value, $value)) {
                    $selected = 'selected';
                }
            } else {
                if ($value === $option_value) {
                    $selected = 'selected';
                }
            }
            
            $html .= sprintf(
                '<option value="%s" %s>%s</option>',
                esc_attr($option_value),
                $selected,
                esc_html($option_label)
            );
        }
        
        $html .= '</select>';
        
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
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-label" class="form-label">' . __('Label', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-label" name="label" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('label')),
            __('Enter field label', 'form-plugin')
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
        
        // Placeholder text
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-placeholder-text" class="form-label">' . __('Placeholder Text', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-placeholder-text" name="placeholder_text" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('placeholder_text')),
            __('Select an option', 'form-plugin')
        );
        $html .= '</div>';
        
        // Multiple selection
        $html .= '<div class="form-group mb-3">';
        $html .= '<div class="form-check">';
        $html .= sprintf(
            '<input type="checkbox" id="field-multiple" name="multiple" class="form-check-input" value="1" %s>',
            $this->get_value('multiple') ? 'checked' : ''
        );
        $html .= '<label for="field-multiple" class="form-check-label">' . __('Allow multiple selections', 'form-plugin') . '</label>';
        $html .= '</div>';
        $html .= '</div>';
        
        // Options - Simple textarea approach
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-options" class="form-label">' . __('Options', 'form-plugin') . '</label>';
        $html .= '<textarea id="field-options" name="options_text" class="form-control" rows="4" placeholder="' . __('Enter one option per line', 'form-plugin') . '">';
        
        $options = $this->get_value('options', array());
        if (!empty($options)) {
            $option_lines = array();
            foreach ($options as $option) {
                if (!empty($option['label'])) {
                    $option_lines[] = $option['label'];
                }
            }
            $html .= esc_textarea(implode("\n", $option_lines));
        }
        
        $html .= '</textarea>';
        $html .= '<small class="form-text text-muted">' . __('Enter one option per line. Each line will be used as both label and value.', 'form-plugin') . '</small>';
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
        return 'dashicons-arrow-down-alt2';
    }
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    public function get_label() {
        return __('Dropdown Field', 'form-plugin');
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
        
        $options = $this->get_value('options', array());
        $option_values = array();
        
        foreach ($options as $option) {
            $option_values[] = isset($option['value']) ? $option['value'] : $option['label'];
        }
        
        if (!empty($value)) {
            if ($this->get_value('multiple')) {
                if (!is_array($value)) {
                    $value = array($value);
                }
                
                foreach ($value as $val) {
                    if (!in_array($val, $option_values)) {
                        return array(
                            'valid' => false,
                            'errors' => array(sprintf(__('%s contains invalid option.', 'form-plugin'), $this->get_value('label')))
                        );
                    }
                }
            } else {
                if (!in_array($value, $option_values)) {
                    return array(
                        'valid' => false,
                        'errors' => array(sprintf(__('%s contains invalid option.', 'form-plugin'), $this->get_value('label')))
                    );
                }
            }
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
        if ($this->get_value('multiple') && is_array($value)) {
            return array_map('sanitize_text_field', $value);
        }
        
        return sanitize_text_field($value);
    }
}

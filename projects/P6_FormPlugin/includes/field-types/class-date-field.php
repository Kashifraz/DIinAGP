<?php
/**
 * Date field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Date field class
 */
class Form_Plugin_Date_Field extends Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type = 'date';
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array_merge(parent::get_default_config(), array(
            'min_date' => '',
            'max_date' => '',
            'date_format' => 'Y-m-d'
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
            'type' => 'date',
            'value' => esc_attr($value),
            'min' => $this->get_value('min_date'),
            'max' => $this->get_value('max_date')
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
        
        // Min date
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-min-date" class="form-label">' . __('Minimum Date', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="date" id="field-min-date" name="min_date" class="form-control" value="%s">',
            esc_attr($this->get_value('min_date'))
        );
        $html .= '</div>';
        
        // Max date
        $html .= '<div class="form-group mb-3">';
        $html .= '<label for="field-max-date" class="form-label">' . __('Maximum Date', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="date" id="field-max-date" name="max_date" class="form-control" value="%s">',
            esc_attr($this->get_value('max_date'))
        );
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
        return 'dashicons-calendar-alt';
    }
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    public function get_label() {
        return __('Date Field', 'form-plugin');
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
        
        // Date format validation
        if (!empty($value)) {
            $date = DateTime::createFromFormat('Y-m-d', $value);
            if (!$date || $date->format('Y-m-d') !== $value) {
                return array(
                    'valid' => false,
                    'errors' => array(sprintf(__('%s must be a valid date.', 'form-plugin'), $this->get_value('label')))
                );
            }
            
            // Min date validation
            $min_date = $this->get_value('min_date');
            if (!empty($min_date) && $value < $min_date) {
                return array(
                    'valid' => false,
                    'errors' => array(sprintf(__('%s must be on or after %s.', 'form-plugin'), $this->get_value('label'), $min_date))
                );
            }
            
            // Max date validation
            $max_date = $this->get_value('max_date');
            if (!empty($max_date) && $value > $max_date) {
                return array(
                    'valid' => false,
                    'errors' => array(sprintf(__('%s must be on or before %s.', 'form-plugin'), $this->get_value('label'), $max_date))
                );
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
        return sanitize_text_field($value);
    }
}

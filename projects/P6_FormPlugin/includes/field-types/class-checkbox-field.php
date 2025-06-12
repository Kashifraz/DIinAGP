<?php
/**
 * Checkbox field class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Checkbox field class
 */
class Form_Plugin_Checkbox_Field extends Form_Plugin_Base_Field {
    
    /**
     * Field type
     *
     * @var string
     */
    protected $type = 'checkbox';
    
    /**
     * Get default configuration
     *
     * @return array
     */
    protected function get_default_config() {
        return array_merge(parent::get_default_config(), array(
            'options' => array(),
            'layout' => 'vertical', // vertical or horizontal
            'min_selections' => 0,
            'max_selections' => 0
        ));
    }
    
    /**
     * Render field HTML
     *
     * @param array $args Additional arguments
     * @return string Field HTML
     */
    public function render($args = array()) {
        $value = isset($args['value']) ? $args['value'] : array();
        $field_id = $this->get_value('id');
        $label = $this->get_value('label');
        $help_text = $this->get_value('help_text');
        $required = $this->get_value('required');
        $options = $this->get_value('options', array());
        $layout = $this->get_value('layout');
        $min_selections = $this->get_value('min_selections');
        $max_selections = $this->get_value('max_selections');
        
        if (!is_array($value)) {
            $value = array();
        }
        
        $html = '<div class="form-group">';
        
        if (!empty($label)) {
            $html .= sprintf(
                '<label class="form-label">%s%s</label>',
                esc_html($label),
                $required ? ' <span class="required">*</span>' : ''
            );
        }
        
        $container_class = $layout === 'horizontal' ? 'd-flex flex-wrap gap-3' : '';
        $html .= sprintf('<div class="checkbox-options %s">', $container_class);
        
        foreach ($options as $index => $option) {
            $option_value = isset($option['value']) ? $option['value'] : $option['label'];
            $option_label = isset($option['label']) ? $option['label'] : $option_value;
            $option_id = $field_id . '_' . $index;
            $checked = in_array($option_value, $value) ? 'checked' : '';
            
            $html .= '<div class="form-check">';
            $html .= sprintf(
                '<input type="checkbox" id="%s" name="%s[]" value="%s" class="form-check-input" %s %s>',
                esc_attr($option_id),
                esc_attr($field_id),
                esc_attr($option_value),
                $checked,
                $required ? 'required' : ''
            );
            $html .= sprintf(
                '<label for="%s" class="form-check-label">%s</label>',
                esc_attr($option_id),
                esc_html($option_label)
            );
            $html .= '</div>';
        }
        
        $html .= '</div>';
        
        // Add validation attributes
        if ($min_selections > 0 || $max_selections > 0) {
            $html .= sprintf(
                '<input type="hidden" name="%s_min_selections" value="%d">',
                esc_attr($field_id),
                $min_selections
            );
            $html .= sprintf(
                '<input type="hidden" name="%s_max_selections" value="%d">',
                esc_attr($field_id),
                $max_selections
            );
        }
        
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
        
        // Basic Settings Section
        $html .= '<div class="field-config-section">';
        $html .= '<h4>' . __('Basic Settings', 'form-plugin') . '</h4>';
        
        // Label
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-label" class="form-label">' . __('Label', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="text" id="field-label" name="label" class="form-control" value="%s" placeholder="%s">',
            esc_attr($this->get_value('label')),
            __('Enter field label', 'form-plugin')
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
        
        // Layout
        $html .= '<div class="mb-3">';
        $html .= '<label class="form-label">' . __('Layout', 'form-plugin') . '</label>';
        $html .= '<div class="form-check">';
        $html .= sprintf(
            '<input type="radio" id="layout-vertical" name="layout" class="form-check-input" value="vertical" %s>',
            $this->get_value('layout') === 'vertical' ? 'checked' : ''
        );
        $html .= '<label for="layout-vertical" class="form-check-label">' . __('Vertical', 'form-plugin') . '</label>';
        $html .= '</div>';
        $html .= '<div class="form-check">';
        $html .= sprintf(
            '<input type="radio" id="layout-horizontal" name="layout" class="form-check-input" value="horizontal" %s>',
            $this->get_value('layout') === 'horizontal' ? 'checked' : ''
        );
        $html .= '<label for="layout-horizontal" class="form-check-label">' . __('Horizontal', 'form-plugin') . '</label>';
        $html .= '</div>';
        $html .= '</div>';
        
        // Min selections
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-min-selections" class="form-label">' . __('Minimum Selections', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-min-selections" name="min_selections" class="form-control" value="%s" min="0" placeholder="%s">',
            esc_attr($this->get_value('min_selections')),
            __('No minimum', 'form-plugin')
        );
        $html .= '</div>';
        
        // Max selections
        $html .= '<div class="mb-3">';
        $html .= '<label for="field-max-selections" class="form-label">' . __('Maximum Selections', 'form-plugin') . '</label>';
        $html .= sprintf(
            '<input type="number" id="field-max-selections" name="max_selections" class="form-control" value="%s" min="0" placeholder="%s">',
            esc_attr($this->get_value('max_selections')),
            __('No maximum', 'form-plugin')
        );
        $html .= '</div>';
        
        $html .= '</div>'; // End Basic Settings
        
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
        
        return $html;
    }
    
    /**
     * Get field icon
     *
     * @return string Field icon class
     */
    public function get_icon() {
        return 'dashicons-yes';
    }
    
    /**
     * Get field label
     *
     * @return string Field label
     */
    public function get_label() {
        return __('Checkbox Field', 'form-plugin');
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
        
        if (!is_array($value)) {
            $value = array();
        }
        
        $options = $this->get_value('options', array());
        $option_values = array();
        
        foreach ($options as $option) {
            $option_values[] = isset($option['value']) ? $option['value'] : $option['label'];
        }
        
        // Check for invalid options
        foreach ($value as $val) {
            if (!in_array($val, $option_values)) {
                return array(
                    'valid' => false,
                    'errors' => array(sprintf(__('%s contains invalid option.', 'form-plugin'), $this->get_value('label')))
                );
            }
        }
        
        // Min selections validation
        $min_selections = $this->get_value('min_selections');
        if ($min_selections > 0 && count($value) < $min_selections) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s requires at least %d selections.', 'form-plugin'), $this->get_value('label'), $min_selections))
            );
        }
        
        // Max selections validation
        $max_selections = $this->get_value('max_selections');
        if ($max_selections > 0 && count($value) > $max_selections) {
            return array(
                'valid' => false,
                'errors' => array(sprintf(__('%s allows maximum %d selections.', 'form-plugin'), $this->get_value('label'), $max_selections))
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
        if (is_array($value)) {
            return array_map('sanitize_text_field', $value);
        }
        
        return sanitize_text_field($value);
    }
}

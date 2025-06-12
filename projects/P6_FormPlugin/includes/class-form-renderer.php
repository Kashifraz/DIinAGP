<?php
/**
 * Form Renderer Class
 *
 * Handles frontend form display, shortcode registration, and form rendering
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class Form_Plugin_Form_Renderer {
    
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
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Register shortcode
        add_shortcode('form_plugin', array($this, 'render_form_shortcode'));
        
        // Enqueue frontend scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        
        // Handle form submissions
        add_action('wp_ajax_form_plugin_submit', array($this, 'handle_form_submission'));
        add_action('wp_ajax_nopriv_form_plugin_submit', array($this, 'handle_form_submission'));
        
        // Test AJAX handler
        add_action('wp_ajax_form_plugin_test', array($this, 'test_ajax_handler'));
        add_action('wp_ajax_nopriv_form_plugin_test', array($this, 'test_ajax_handler'));
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        // Only enqueue on pages with forms
        if (!$this->has_form_shortcode()) {
            return;
        }
        
        // Enqueue CSS
        wp_enqueue_style(
            'form-plugin-frontend',
            FORM_PLUGIN_PLUGIN_URL . 'public/css/frontend.css',
            array(),
            FORM_PLUGIN_VERSION
        );
        
        // Enqueue template CSS
        wp_enqueue_style(
            'form-plugin-templates',
            FORM_PLUGIN_PLUGIN_URL . 'public/css/templates.css',
            array('form-plugin-frontend'),
            FORM_PLUGIN_VERSION
        );
        
        // Enqueue JavaScript
        wp_enqueue_script(
            'form-plugin-frontend',
            FORM_PLUGIN_PLUGIN_URL . 'public/js/frontend.js',
            array('jquery'),
            FORM_PLUGIN_VERSION,
            true
        );
        
        // Localize script
        wp_localize_script('form-plugin-frontend', 'formPluginFrontend', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('form_plugin_frontend_nonce'),
            'messages' => array(
                'required' => __('This field is required.', 'form-plugin'),
                'email' => __('Please enter a valid email address.', 'form-plugin'),
                'captcha' => __('Please solve the math problem.', 'form-plugin'),
                'success' => __('Form submitted successfully!', 'form-plugin'),
                'error' => __('There was an error submitting the form.', 'form-plugin')
            )
        ));
    }
    
    /**
     * Check if current page has form shortcode
     *
     * @return bool
     */
    private function has_form_shortcode() {
        global $post;
        
        if (!$post) {
            return false;
        }
        
        return has_shortcode($post->post_content, 'form_plugin');
    }
    
    /**
     * Render form shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string Form HTML
     */
    public function render_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'title' => '',
            'description' => ''
        ), $atts);
        
        if (empty($atts['id'])) {
            return '<p>' . __('Form ID is required.', 'form-plugin') . '</p>';
        }
        
        // Get form data
        $form = $this->database->get_form_by_shortcode($atts['id']);
        
        if (!$form) {
            return '<p>' . __('Form not found.', 'form-plugin') . '</p>';
        }
        
        if ($form->status !== 'active') {
            return '<p>' . __('This form is currently inactive.', 'form-plugin') . '</p>';
        }
        
        // Generate form HTML
        return $this->generate_form_html($form, $atts);
    }
    
    /**
     * Generate form HTML
     *
     * @param object $form Form data
     * @param array $atts Shortcode attributes
     * @return string Form HTML
     */
    private function generate_form_html($form, $atts = array()) {
        $form_id = 'form-plugin-' . $form->id;
        $form_title = !empty($atts['title']) ? $atts['title'] : $form->title;
        $form_description = !empty($atts['description']) ? $atts['description'] : $form->description;
        
        // Get field configuration
        $fields = array();
        if (!empty($form->form_data) && is_array($form->form_data)) {
            if (isset($form->form_data['fields']) && is_array($form->form_data['fields'])) {
                $fields = $form->form_data['fields'];
            }
        }
        
        if (empty($fields)) {
            return '<p>' . __('No fields configured for this form.', 'form-plugin') . '</p>';
        }
        
        // Generate math captcha
        $captcha = $this->generate_math_captcha_data();
        
        // Get template data
        $template_data = $this->database->get_form_template($form->id);
        $template_id = $template_data['template_id'];
        $customization = $template_data['customization'];
        
        // Build template classes
        $template_class = 'template-' . $template_id;
        
        // Build custom styles
        $custom_styles = '';
        if (!empty($customization)) {
            $styles = array();
            if (isset($customization['background_color'])) {
                $styles[] = 'background-color: ' . esc_attr($customization['background_color']);
            }
            if (isset($customization['text_color'])) {
                $styles[] = 'color: ' . esc_attr($customization['text_color']);
            }
            if (isset($customization['border_color'])) {
                $styles[] = 'border-color: ' . esc_attr($customization['border_color']);
            }
            if (!empty($styles)) {
                $custom_styles = ' style="' . implode('; ', $styles) . '"';
            }
        }
        
        // Start form HTML
        $html = '<div class="form-plugin-container">';
        
        // Form title
        if ($form_title) {
            $html .= '<h3 class="form-plugin-title">' . esc_html($form_title) . '</h3>';
        }
        
        // Form description
        if ($form_description) {
            $html .= '<div class="form-plugin-description">' . wp_kses_post($form_description) . '</div>';
        }
        
        // Form element with template class and custom styles
        $html .= '<form id="' . esc_attr($form_id) . '" class="form-plugin-form ' . esc_attr($template_class) . '" method="post" action=""' . $custom_styles . '>';
        $html .= wp_nonce_field('form_plugin_submit_' . $form->id, 'form_plugin_nonce', true, false);
        $html .= '<input type="hidden" name="form_id" value="' . esc_attr($form->id) . '">';
        $html .= '<input type="hidden" name="captcha_answer" value="' . esc_attr($captcha['answer']) . '">';
        
        // Render fields
        foreach ($fields as $field) {
            if (is_array($field)) {
                $html .= $this->render_field($field);
            }
        }
        
        // Math captcha
        $html .= '<div class="form-group form-plugin-captcha">';
        $html .= '<label for="captcha_input" class="form-label">';
        $html .= sprintf(__('What is %d + %d?', 'form-plugin'), $captcha['num1'], $captcha['num2']);
        $html .= ' <span class="required">*</span>';
        $html .= '</label>';
        $html .= '<input type="number" id="captcha_input" name="captcha_input" class="form-control" required>';
        $html .= '<button type="button" class="btn btn-link btn-sm form-plugin-refresh-captcha">';
        $html .= __('Refresh', 'form-plugin');
        $html .= '</button>';
        $html .= '</div>';
        
        // Submit button with custom color
        $button_style = '';
        if (isset($customization['button_color'])) {
            $button_style = ' style="background-color: ' . esc_attr($customization['button_color']) . '; border-color: ' . esc_attr($customization['button_color']) . ';"';
        }
        
        $html .= '<div class="form-group form-plugin-submit">';
        $html .= '<button type="submit" class="btn btn-primary form-plugin-submit-btn"' . $button_style . '>';
        $html .= __('Submit Form', 'form-plugin');
        $html .= '</button>';
        $html .= '</div>';
        
        // Success/Error messages
        $html .= '<div class="form-plugin-messages" style="display: none;"></div>';
        
        $html .= '</form>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render individual field
     *
     * @param array $field Field configuration
     * @return string Field HTML
     */
    private function render_field($field) {
        $field_type = $field['type'];
        $field_id = 'field_' . $field['id'];
        $field_name = $field['id'];
        $field_label = $field['label'];
        $field_required = $field['required'] ? 'required' : '';
        $field_help = !empty($field['help_text']) ? $field['help_text'] : '';
        
        $html = '<div class="form-group form-plugin-field form-plugin-field-' . esc_attr($field_type) . '">';
        
        // Field label
        if ($field_label) {
            $required_mark = $field_required ? ' <span class="required">*</span>' : '';
            $html .= '<label for="' . esc_attr($field_id) . '" class="form-label">';
            $html .= esc_html($field_label) . $required_mark;
            $html .= '</label>';
        }
        
        // Field input
        $html .= $this->render_field_input($field, $field_id, $field_name, $field_required);
        
        // Help text
        if ($field_help) {
            $html .= '<small class="form-text text-muted">' . esc_html($field_help) . '</small>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render field input based on type
     *
     * @param array $field Field configuration
     * @param string $field_id Field ID
     * @param string $field_name Field name
     * @param string $required Required attribute
     * @return string Field input HTML
     */
    private function render_field_input($field, $field_id, $field_name, $required) {
        $field_type = $field['type'];
        $placeholder = !empty($field['placeholder']) ? $field['placeholder'] : '';
        
        switch ($field_type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return sprintf(
                    '<input type="%s" id="%s" name="%s" class="form-control" placeholder="%s" %s>',
                    esc_attr($field_type),
                    esc_attr($field_id),
                    esc_attr($field_name),
                    esc_attr($placeholder),
                    $required
                );
                
            case 'textarea':
                $rows = !empty($field['rows']) ? $field['rows'] : 4;
                return sprintf(
                    '<textarea id="%s" name="%s" class="form-control" rows="%d" placeholder="%s" %s></textarea>',
                    esc_attr($field_id),
                    esc_attr($field_name),
                    intval($rows),
                    esc_attr($placeholder),
                    $required
                );
                
            case 'dropdown':
                $html = '<select id="' . esc_attr($field_id) . '" name="' . esc_attr($field_name) . '" class="form-control" ' . $required . '>';
                $html .= '<option value="">' . __('Select an option', 'form-plugin') . '</option>';
                
                if (!empty($field['options'])) {
                    foreach ($field['options'] as $option) {
                        $html .= sprintf(
                            '<option value="%s">%s</option>',
                            esc_attr($option['value']),
                            esc_html($option['label'])
                        );
                    }
                }
                
                $html .= '</select>';
                return $html;
                
            case 'radio':
                $html = '<div class="form-plugin-radio-group">';
                
                if (!empty($field['options'])) {
                    foreach ($field['options'] as $index => $option) {
                        $option_id = $field_id . '_' . $index;
                        $html .= '<div class="form-check">';
                        $html .= sprintf(
                            '<input type="radio" id="%s" name="%s" value="%s" class="form-check-input" %s>',
                            esc_attr($option_id),
                            esc_attr($field_name),
                            esc_attr($option['value']),
                            $required
                        );
                        $html .= sprintf(
                            '<label for="%s" class="form-check-label">%s</label>',
                            esc_attr($option_id),
                            esc_html($option['label'])
                        );
                        $html .= '</div>';
                    }
                }
                
                $html .= '</div>';
                return $html;
                
            case 'checkbox':
                $html = '<div class="form-plugin-checkbox-group">';
                
                if (!empty($field['options'])) {
                    foreach ($field['options'] as $index => $option) {
                        $option_id = $field_id . '_' . $index;
                        $html .= '<div class="form-check">';
                        $html .= sprintf(
                            '<input type="checkbox" id="%s" name="%s[]" value="%s" class="form-check-input">',
                            esc_attr($option_id),
                            esc_attr($field_name),
                            esc_attr($option['value'])
                        );
                        $html .= sprintf(
                            '<label for="%s" class="form-check-label">%s</label>',
                            esc_attr($option_id),
                            esc_html($option['label'])
                        );
                        $html .= '</div>';
                    }
                }
                
                $html .= '</div>';
                return $html;
                
            default:
                return sprintf(
                    '<input type="text" id="%s" name="%s" class="form-control" placeholder="%s" %s>',
                    esc_attr($field_id),
                    esc_attr($field_name),
                    esc_attr($placeholder),
                    $required
                );
        }
    }
    
    /**
     * Generate math captcha data
     *
     * @return array Captcha data
     */
    private function generate_math_captcha_data() {
        $num1 = rand(1, 10);
        $num2 = rand(1, 10);
        $answer = $num1 + $num2;
        
        return array(
            'num1' => $num1,
            'num2' => $num2,
            'answer' => $answer
        );
    }
    
    /**
     * Test AJAX handler
     */
    public function test_ajax_handler() {
        wp_send_json_success(array('message' => 'AJAX handler is working!'));
    }
    
    /**
     * Handle form submission
     */
    public function handle_form_submission() {
        // Get form ID
        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        
        if ($form_id === 0) {
            wp_send_json_error(array('message' => __('Invalid form ID.', 'form-plugin')));
        }
        
        // Verify nonce
        $nonce = isset($_POST['form_plugin_nonce']) ? $_POST['form_plugin_nonce'] : '';
        $nonce_action = 'form_plugin_submit_' . $form_id;
        
        if (!wp_verify_nonce($nonce, $nonce_action)) {
            wp_send_json_error(array('message' => __('Security check failed.', 'form-plugin')));
        }
        
        // Get form data
        $form = $this->database->get_form($form_id);
        
        if (!$form) {
            wp_send_json_error(array('message' => __('Form not found.', 'form-plugin')));
        }
        
        // Validate captcha
        $captcha_answer = intval($_POST['captcha_answer']);
        $captcha_input = intval($_POST['captcha_input']);
        
        if ($captcha_input !== $captcha_answer) {
            wp_send_json_error(array('message' => __('Incorrect answer to the math problem.', 'form-plugin')));
        }
        
        // Get field configuration
        $fields = array();
        if (!empty($form->form_data) && is_array($form->form_data)) {
            if (isset($form->form_data['fields']) && is_array($form->form_data['fields'])) {
                $fields = $form->form_data['fields'];
            }
        }
        
        // Collect and validate form data
        $submission_data = array();
        $errors = array();
        
        foreach ($fields as $field) {
            if (!is_array($field)) continue;
            
            $field_name = $field['id'];
            $field_value = isset($_POST[$field_name]) ? $_POST[$field_name] : '';
            
            // Validate required fields
            if ($field['required'] && empty($field_value)) {
                $errors[] = sprintf(__('%s is required.', 'form-plugin'), $field['label']);
                continue;
            }
            
            // Validate email fields
            if ($field['type'] === 'email' && !empty($field_value) && !is_email($field_value)) {
                $errors[] = sprintf(__('%s must be a valid email address.', 'form-plugin'), $field['label']);
                continue;
            }
            
            $submission_data[$field_name] = array(
                'label' => $field['label'],
                'value' => sanitize_text_field($field_value),
                'type' => $field['type']
            );
        }
        
        // Return errors if any
        if (!empty($errors)) {
            wp_send_json_error(array('message' => implode('<br>', $errors)));
        }
        
        // Save submission
        $submission_id = $this->database->save_submission($form_id, $submission_data);
        
        if ($submission_id) {
            wp_send_json_success(array('message' => __('Form submitted successfully!', 'form-plugin')));
        } else {
            wp_send_json_error(array('message' => __('Failed to save submission.', 'form-plugin')));
        }
    }
}
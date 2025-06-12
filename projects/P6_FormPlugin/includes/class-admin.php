<?php
/**
 * Admin interface class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin interface class
 */
class Form_Plugin_Admin {
    
    /**
     * Database instance
     *
     * @var Form_Plugin_Database
     */
    private $database;
    
    /**
     * Form Builder instance
     *
     * @var Form_Plugin_Form_Builder
     */
    private $form_builder;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->database = new Form_Plugin_Database();
        $this->form_builder = new Form_Plugin_Form_Builder();
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Enqueue scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // AJAX handlers
        add_action('wp_ajax_form_plugin_save_form', array($this, 'ajax_save_form'));
        add_action('wp_ajax_form_plugin_delete_form', array($this, 'ajax_delete_form'));
        add_action('wp_ajax_form_plugin_duplicate_form', array($this, 'ajax_duplicate_form'));
        add_action('wp_ajax_form_plugin_update_status', array($this, 'ajax_update_status'));
        add_action('wp_ajax_form_plugin_get_form', array($this, 'ajax_get_form'));
        add_action('wp_ajax_form_plugin_get_field_config_form', array($this, 'ajax_get_field_config_form'));
        add_action('wp_ajax_form_plugin_add_field', array($this, 'ajax_add_field'));
        add_action('wp_ajax_form_plugin_update_field', array($this, 'ajax_update_field'));
        add_action('wp_ajax_form_plugin_remove_field', array($this, 'ajax_remove_field'));
        add_action('wp_ajax_form_plugin_reorder_fields', array($this, 'ajax_reorder_fields'));
        
        // Submissions AJAX handlers
        add_action('wp_ajax_form_plugin_get_submission', array($this, 'ajax_get_submission'));
        add_action('wp_ajax_form_plugin_delete_submission', array($this, 'ajax_delete_submission'));
        add_action('wp_ajax_form_plugin_export_submissions', array($this, 'ajax_export_submissions'));
        add_action('wp_ajax_form_plugin_search_submissions', array($this, 'ajax_search_submissions'));
        add_action('wp_ajax_form_plugin_update_submission_status', array($this, 'ajax_update_submission_status'));
        add_action('wp_ajax_form_plugin_bulk_update_submissions', array($this, 'ajax_bulk_update_submissions'));
        add_action('wp_ajax_form_plugin_add_submission_notes', array($this, 'ajax_add_submission_notes'));
        add_action('wp_ajax_form_plugin_get_templates', array($this, 'ajax_get_templates'));
        add_action('wp_ajax_form_plugin_get_template', array($this, 'ajax_get_template'));
        add_action('wp_ajax_form_plugin_update_template', array($this, 'ajax_update_template'));
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our plugin pages
        if (strpos($hook, 'form-plugin') === false) {
            return;
        }
        
        // Enqueue Bootstrap CSS
        wp_enqueue_style(
            'bootstrap',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
            array(),
            '5.3.0'
        );
        
        // Enqueue Font Awesome
        wp_enqueue_style(
            'font-awesome',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            array(),
            '6.4.0'
        );
        
        // Enqueue admin CSS with cache busting
        wp_enqueue_style(
            'form-plugin-admin',
            FORM_PLUGIN_PLUGIN_URL . 'admin/css/admin.css',
            array('bootstrap'),
            time() // Use timestamp for cache busting
        );
        
        // Enqueue frontend CSS for preview
        wp_enqueue_style(
            'form-plugin-frontend',
            FORM_PLUGIN_PLUGIN_URL . 'public/css/frontend.css',
            array(),
            time()
        );
        
        // Enqueue templates CSS for preview
        wp_enqueue_style(
            'form-plugin-templates',
            FORM_PLUGIN_PLUGIN_URL . 'public/css/templates.css',
            array('form-plugin-frontend'),
            time()
        );
        
        // DEBUG: Add admin notice for cache busting
        add_action('admin_notices', function() {
            echo '<div class="notice notice-info"><p>Form Plugin: CSS/JS cache busting enabled - version ' . time() . '</p></div>';
        });
        
        // Enqueue jQuery UI for drag and drop (in correct order)
        wp_enqueue_script('jquery-ui-core');
        wp_enqueue_script('jquery-ui-widget');
        wp_enqueue_script('jquery-ui-mouse');
        wp_enqueue_script('jquery-ui-draggable');
        wp_enqueue_script('jquery-ui-droppable');
        wp_enqueue_script('jquery-ui-sortable');
        
        // Enqueue Bootstrap JS
        wp_enqueue_script(
            'bootstrap',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
            array('jquery'),
            '5.3.0',
            true
        );
        
        // Enqueue admin JS with cache busting
        wp_enqueue_script(
            'form-plugin-admin',
            FORM_PLUGIN_PLUGIN_URL . 'admin/js/admin.js',
            array('jquery', 'jquery-ui-core', 'jquery-ui-widget', 'jquery-ui-mouse', 'jquery-ui-draggable', 'jquery-ui-droppable', 'jquery-ui-sortable', 'bootstrap'),
            time(), // Use timestamp for cache busting
            true
        );
        
        // Enqueue submissions JavaScript and CSS on submissions page
        if (strpos($hook, 'form-plugin-submissions') !== false) {
            wp_enqueue_script(
                'form-plugin-submissions',
                FORM_PLUGIN_PLUGIN_URL . 'admin/js/submissions.js',
                array('jquery'),
                time(),
                true
            );
            
            wp_enqueue_style(
                'form-plugin-submissions',
                FORM_PLUGIN_PLUGIN_URL . 'admin/css/submissions.css',
                array(),
                time()
            );
        }
        
        // Localize script for AJAX
        wp_localize_script('form-plugin-admin', 'formPlugin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('form_plugin_nonce')
        ));
        
        // Also localize as formPluginAdmin for template functionality
        wp_localize_script('form-plugin-admin', 'formPluginAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('form_plugin_nonce')
        ));
        
        // Localize script for submissions page
        if (strpos($hook, 'form-plugin-submissions') !== false) {
            wp_localize_script('form-plugin-submissions', 'formPluginAdmin', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('form_plugin_nonce')
            ));
        }
        
        // Disable Gravatar loading on our pages to prevent timeout errors
        add_filter('get_avatar_url', array($this, 'disable_gravatar_on_plugin_pages'), 10, 3);
    }
    
    /**
     * Forms list page
     */
    public function forms_page() {
        // Handle form actions
        $this->handle_form_actions();
        
        // Get forms
        $forms = $this->database->get_forms(array('limit' => 50));
        $total_forms = $this->database->get_forms_count();
        
        include FORM_PLUGIN_PLUGIN_DIR . 'admin/views/forms-list.php';
    }
    
    /**
     * New form page
     */
    public function new_form_page() {
        $form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;
        $form = null;
        
        if ($form_id > 0) {
            $form = $this->database->get_form($form_id);
        }
        
        include FORM_PLUGIN_PLUGIN_DIR . 'admin/views/form-builder.php';
    }
    
    /**
     * Submissions page
     */
    public function submissions_page() {
        $form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;
        
        // Get submissions for specific form or all forms
        $submissions = $this->get_submissions($form_id);
        
        // Pass database instance to the view
        $database = $this->database;
        
        include FORM_PLUGIN_PLUGIN_DIR . 'admin/views/submissions.php';
    }
    
    /**
     * Handle form actions
     */
    private function handle_form_actions() {
        if (!isset($_GET['action']) || !isset($_GET['form_id'])) {
            return;
        }
        
        $action = sanitize_text_field($_GET['action']);
        $form_id = intval($_GET['form_id']);
        
        if (!wp_verify_nonce($_GET['_wpnonce'], 'form_action_' . $form_id)) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        switch ($action) {
            case 'delete':
                if ($this->database->delete_form($form_id)) {
                    add_action('admin_notices', function() {
                        echo '<div class="notice notice-success"><p>' . __('Form deleted successfully.', 'form-plugin') . '</p></div>';
                    });
                } else {
                    add_action('admin_notices', function() {
                        echo '<div class="notice notice-error"><p>' . __('Error deleting form.', 'form-plugin') . '</p></div>';
                    });
                }
                break;
                
            case 'duplicate':
                $form = $this->database->get_form($form_id);
                if ($form) {
                    $new_form_data = array(
                        'title' => $form->title . ' (Copy)',
                        'description' => $form->description,
                        'form_data' => $form->form_data,
                        'settings' => $form->settings,
                        'status' => 'inactive'
                    );
                    
                    if ($this->database->create_form($new_form_data)) {
                        add_action('admin_notices', function() {
                            echo '<div class="notice notice-success"><p>' . __('Form duplicated successfully.', 'form-plugin') . '</p></div>';
                        });
                    } else {
                        add_action('admin_notices', function() {
                            echo '<div class="notice notice-error"><p>' . __('Error duplicating form.', 'form-plugin') . '</p></div>';
                        });
                    }
                }
                break;
        }
    }
    
    /**
     * Get submissions
     *
     * @param int $form_id Form ID (0 for all forms)
     * @return array Submissions array
     */
    private function get_submissions($form_id = 0) {
        global $wpdb;
        
        $submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        
        $where = '';
        if ($form_id > 0) {
            $where = $wpdb->prepare("WHERE s.form_id = %d", $form_id);
        }
        
        $sql = "SELECT s.*, f.title as form_title 
                FROM {$submissions_table} s 
                LEFT JOIN {$forms_table} f ON s.form_id = f.id 
                {$where} 
                ORDER BY s.submitted_at DESC 
                LIMIT 100";
        
        return $wpdb->get_results($sql);
    }
    
    /**
     * AJAX: Save form
     */
    public function ajax_save_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'form-plugin'));
        }
        
        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        $form_data = array(
            'title' => sanitize_text_field($_POST['title']),
            'description' => sanitize_textarea_field($_POST['description']),
            'form_data' => json_decode(stripslashes($_POST['form_data']), true),
            'settings' => json_decode(stripslashes($_POST['settings']), true),
            'template_id' => isset($_POST['template_id']) ? sanitize_text_field($_POST['template_id']) : 'classic',
            'template_customization' => isset($_POST['template_customization']) ? $_POST['template_customization'] : array(),
            'status' => sanitize_text_field($_POST['status'])
        );
        
        if ($form_id > 0) {
            // Update existing form
            $result = $this->form_builder->update_form($form_id, $form_data);
        } else {
            // Create new form
            $result = $this->form_builder->create_form($form_data);
        }
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => $result['message'],
                'form_id' => $form_id > 0 ? $form_id : $result['form_id']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $result['message'],
                'errors' => isset($result['errors']) ? $result['errors'] : array()
            ));
        }
    }
    
    /**
     * AJAX: Delete form
     */
    public function ajax_delete_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'form-plugin'));
        }
        
        $form_id = intval($_POST['form_id']);
        $result = $this->form_builder->delete_form($form_id);
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => $result['message']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $result['message']
            ));
        }
    }
    
    /**
     * AJAX: Duplicate form
     */
    public function ajax_duplicate_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'form-plugin'));
        }
        
        $form_id = intval($_POST['form_id']);
        $result = $this->form_builder->duplicate_form($form_id);
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => $result['message'],
                'new_form_id' => $result['new_form_id']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $result['message']
            ));
        }
    }
    
    /**
     * AJAX: Update form status
     */
    public function ajax_update_status() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'form-plugin'));
        }
        
        $form_id = intval($_POST['form_id']);
        $status = sanitize_text_field($_POST['status']);
        
        $result = $this->form_builder->update_form_status($form_id, $status);
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => $result['message']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $result['message']
            ));
        }
    }
    
    /**
     * AJAX: Get form data
     */
    public function ajax_get_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die(__('Security check failed.', 'form-plugin'));
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', 'form-plugin'));
        }
        
        $form_id = intval($_POST['form_id']);
        $result = $this->form_builder->get_form($form_id);
        
        if ($result['success']) {
            wp_send_json_success(array(
                'form' => $result['form']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $result['message']
            ));
        }
    }
    
    /**
     * Disable Gravatar on plugin pages to prevent timeout errors
     */
    public function disable_gravatar_on_plugin_pages($url, $id_or_email, $args) {
        // Check if we're on a plugin page
        if (isset($_GET['page']) && strpos($_GET['page'], 'form-plugin') !== false) {
            // Return a local default avatar instead of Gravatar
            return admin_url('images/wordpress-logo.png');
        }
        return $url;
    }
    
    /**
     * AJAX handler for getting field configuration form
     */
    public function ajax_get_field_config_form() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $field_type = sanitize_text_field($_POST['field_type']);
        $field_config = isset($_POST['field_config']) ? $_POST['field_config'] : array();
        
        // Get form builder instance
        $form_builder = new Form_Plugin_Form_Builder();
        $field_manager = $form_builder->get_field_manager();
        
        // Get field configuration form
        $config_form = $field_manager->render_field_config_form($field_type, $field_config);
        
        wp_send_json_success($config_form);
    }
    
    /**
     * AJAX handler for adding field to form
     */
    public function ajax_add_field() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $form_id = intval($_POST['form_id']);
        $field_type = sanitize_text_field($_POST['field_type']);
        $field_config = $_POST['field_config'];
        
        // For new forms (form_id = 0), just return success
        if ($form_id === 0) {
            wp_send_json(array(
                'success' => true,
                'message' => 'Field added (will be saved when form is saved)'
            ));
        }
        
        // Get form builder instance
        $form_builder = new Form_Plugin_Form_Builder();
        
        // Add field to form
        $result = $form_builder->add_field_to_form($form_id, $field_type, $field_config);
        
        wp_send_json($result);
    }
    
    /**
     * AJAX handler for updating field in form
     */
    public function ajax_update_field() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $form_id = intval($_POST['form_id']);
        $field_id = sanitize_text_field($_POST['field_id']);
        $field_config = $_POST['field_config'];
        
        // For new forms (form_id = 0), just return success
        if ($form_id === 0) {
            wp_send_json(array(
                'success' => true,
                'message' => 'Field configuration updated (will be saved when form is saved)'
            ));
        }
        
        // Get form builder instance
        $form_builder = new Form_Plugin_Form_Builder();
        
        // Update field in form
        $result = $form_builder->update_field_in_form($form_id, $field_id, $field_config);
        
        wp_send_json($result);
    }
    
    /**
     * AJAX handler for removing field from form
     */
    public function ajax_remove_field() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $form_id = intval($_POST['form_id']);
        $field_id = sanitize_text_field($_POST['field_id']);
        
        // For new forms (form_id = 0), just return success
        if ($form_id === 0) {
            wp_send_json(array(
                'success' => true,
                'message' => 'Field removed (will be saved when form is saved)'
            ));
        }
        
        // Get form builder instance
        $form_builder = new Form_Plugin_Form_Builder();
        
        // Remove field from form
        $result = $form_builder->remove_field_from_form($form_id, $field_id);
        
        wp_send_json($result);
    }
    
    /**
     * AJAX handler for reordering fields in form
     */
    public function ajax_reorder_fields() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $form_id = intval($_POST['form_id']);
        $field_order = $_POST['field_order'];
        
        // Get form builder instance
        $form_builder = new Form_Plugin_Form_Builder();
        
        // Reorder fields in form
        $result = $form_builder->reorder_fields_in_form($form_id, $field_order);
        
        wp_send_json($result);
    }
    
    /**
     * AJAX handler to get submission details
     */
    public function ajax_get_submission() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_admin_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'form-plugin')));
        }
        
        // Check capability
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $submission_id = intval($_POST['submission_id']);
        $database = new Form_Plugin_Database();
        
        // Get submission
        $submission = $database->get_submission($submission_id);
        
        if (!$submission) {
            wp_send_json_error(array('message' => __('Submission not found.', 'form-plugin')));
        }
        
        // Get form data
        $form = $database->get_form($submission->form_id);
        
        // Parse submission data
        $submission_data = json_decode($submission->submission_data, true);
        
        // Generate HTML
        $html = '<div class="submission-details">';
        $html .= '<h4>' . esc_html($form->title) . '</h4>';
        $html .= '<p><strong>' . __('Submitted:', 'form-plugin') . '</strong> ' . date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($submission->submitted_at)) . '</p>';
        $html .= '<p><strong>' . __('Status:', 'form-plugin') . '</strong> ' . ucfirst($submission->status) . '</p>';
        
        if ($submission_data && is_array($submission_data)) {
            $html .= '<h5>' . __('Form Data:', 'form-plugin') . '</h5>';
            $html .= '<table class="table table-striped">';
            foreach ($submission_data as $field_id => $field_data) {
                $html .= '<tr>';
                $html .= '<td><strong>' . esc_html($field_data['label']) . '</strong></td>';
                $html .= '<td>' . esc_html($field_data['value']) . '</td>';
                $html .= '</tr>';
            }
            $html .= '</table>';
        }
        
        $html .= '</div>';
        
        wp_send_json_success(array('html' => $html));
    }
    
    /**
     * AJAX handler to delete submission
     */
    public function ajax_delete_submission() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_admin_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'form-plugin')));
        }
        
        // Check capability
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $submission_id = intval($_POST['submission_id']);
        $database = new Form_Plugin_Database();
        
        // Delete submission
        $result = $database->delete_submission($submission_id);
        
        if ($result) {
            wp_send_json_success(array('message' => __('Submission deleted successfully.', 'form-plugin')));
        } else {
            wp_send_json_error(array('message' => __('Failed to delete submission.', 'form-plugin')));
        }
    }
    
    /**
     * AJAX handler to export submissions
     */
    public function ajax_export_submissions() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'form-plugin')));
        }
        
        // Check capability
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        // Get export parameters from current filter state
        $export_args = array(
            'form_id' => isset($_POST['form_id']) ? intval($_POST['form_id']) : 0,
            'status' => isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '',
            'search' => isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '',
            'date_from' => isset($_POST['date_from']) ? sanitize_text_field($_POST['date_from']) : '',
            'date_to' => isset($_POST['date_to']) ? sanitize_text_field($_POST['date_to']) : ''
        );
        
        // Get CSV data using the new database method
        $csv_data = $this->database->export_submissions_csv($export_args);
        
        if ($csv_data === false) {
            wp_send_json_error(array('message' => __('No submissions found to export.', 'form-plugin')));
        }
        
        // Generate CSV content
        $csv_content = '';
        foreach ($csv_data as $row) {
            $csv_content .= $this->array_to_csv_row($row) . "\n";
        }
        
        // Generate filename
        $filename = 'form-submissions-' . date('Y-m-d-H-i-s') . '.csv';
        if ($export_args['form_id'] > 0) {
            $form = $this->database->get_form($export_args['form_id']);
            if ($form) {
                $filename = sanitize_file_name($form->title) . '-submissions-' . date('Y-m-d-H-i-s') . '.csv';
            }
        }
        
        // Set headers for CSV download
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Output CSV content
        echo "\xEF\xBB\xBF"; // UTF-8 BOM for Excel compatibility
        echo $csv_content;
        exit;
    }
    
    /**
     * Generate CSV export data
     *
     * @param array $submissions Submissions data
     * @return string CSV data
     */
    private function generate_csv_export($submissions) {
        $csv_data = '';
        
        // Get all unique field names
        $all_fields = array();
        foreach ($submissions as $submission) {
            $submission_data = json_decode($submission->submission_data, true);
            if ($submission_data && is_array($submission_data)) {
                foreach ($submission_data as $field_id => $field_data) {
                    if (!in_array($field_data['label'], $all_fields)) {
                        $all_fields[] = $field_data['label'];
                    }
                }
            }
        }
        
        // Add headers
        $headers = array('Submission ID', 'Form Title', 'Submitted Date', 'Status');
        $headers = array_merge($headers, $all_fields);
        $csv_data .= implode(',', array_map(array($this, 'escape_csv'), $headers)) . "\n";
        
        // Add data rows
        foreach ($submissions as $submission) {
            $row = array(
                $submission->id,
                $submission->form_title,
                $submission->submitted_at,
                $submission->status
            );
            
            $submission_data = json_decode($submission->submission_data, true);
            $field_values = array();
            
            if ($submission_data && is_array($submission_data)) {
                foreach ($submission_data as $field_id => $field_data) {
                    $field_values[$field_data['label']] = $field_data['value'];
                }
            }
            
            // Add field values in the same order as headers
            foreach ($all_fields as $field_label) {
                $row[] = isset($field_values[$field_label]) ? $field_values[$field_label] : '';
            }
            
            $csv_data .= implode(',', array_map(array($this, 'escape_csv'), $row)) . "\n";
        }
        
        return $csv_data;
    }
    
    /**
     * Escape CSV field
     *
     * @param string $field Field value
     * @return string Escaped field value
     */
    private function escape_csv($field) {
        $field = str_replace('"', '""', $field);
        return '"' . $field . '"';
    }
    
    /**
     * AJAX handler for searching submissions
     */
    public function ajax_search_submissions() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $args = array(
            'form_id' => isset($_POST['form_id']) ? intval($_POST['form_id']) : 0,
            'status' => isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '',
            'search' => isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '',
            'date_from' => isset($_POST['date_from']) ? sanitize_text_field($_POST['date_from']) : '',
            'date_to' => isset($_POST['date_to']) ? sanitize_text_field($_POST['date_to']) : '',
            'limit' => isset($_POST['limit']) ? intval($_POST['limit']) : 20,
            'offset' => isset($_POST['offset']) ? intval($_POST['offset']) : 0,
            'orderby' => isset($_POST['orderby']) ? sanitize_text_field($_POST['orderby']) : 'submitted_at',
            'order' => isset($_POST['order']) ? sanitize_text_field($_POST['order']) : 'DESC'
        );
        
        $submissions = $this->database->search_submissions($args);
        $total_count = $this->database->search_submissions(array_merge($args, array('count' => true)));
        
        wp_send_json_success(array(
            'submissions' => $submissions,
            'total_count' => $total_count,
            'page' => floor($args['offset'] / $args['limit']) + 1,
            'total_pages' => ceil($total_count / $args['limit'])
        ));
    }
    
    /**
     * AJAX handler for updating submission status
     */
    public function ajax_update_submission_status() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $submission_id = isset($_POST['submission_id']) ? intval($_POST['submission_id']) : 0;
        $status = isset($_POST['status']) ? sanitize_text_field($_POST['status']) : '';
        
        if ($submission_id === 0 || empty($status)) {
            wp_send_json_error(array('message' => __('Invalid parameters.', 'form-plugin')));
        }
        
        $result = $this->database->update_submission_status($submission_id, $status);
        
        if ($result) {
            wp_send_json_success(array('message' => __('Status updated successfully.', 'form-plugin')));
        } else {
            wp_send_json_error(array('message' => __('Failed to update status.', 'form-plugin')));
        }
    }
    
    /**
     * AJAX handler for bulk updating submissions
     */
    public function ajax_bulk_update_submissions() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $submission_ids = isset($_POST['submission_ids']) ? array_map('intval', $_POST['submission_ids']) : array();
        $bulk_action = isset($_POST['bulk_action']) ? sanitize_text_field($_POST['bulk_action']) : '';
        
        if (empty($submission_ids) || empty($bulk_action)) {
            wp_send_json_error(array('message' => __('Invalid parameters.', 'form-plugin')));
        }
        
        $updated_count = 0;
        
        switch ($bulk_action) {
            case 'mark_read':
                $updated_count = $this->database->bulk_update_submission_status($submission_ids, 'read');
                break;
                
            case 'mark_archived':
                $updated_count = $this->database->bulk_update_submission_status($submission_ids, 'archived');
                break;
                
            case 'mark_spam':
                $updated_count = $this->database->bulk_update_submission_status($submission_ids, 'spam');
                break;
                
            case 'mark_trash':
                $updated_count = $this->database->bulk_update_submission_status($submission_ids, 'trash');
                break;
                
            case 'delete':
                foreach ($submission_ids as $submission_id) {
                    if ($this->database->delete_submission($submission_id)) {
                        $updated_count++;
                    }
                }
                break;
                
            default:
                wp_send_json_error(array('message' => __('Invalid action.', 'form-plugin')));
        }
        
        wp_send_json_success(array(
            'message' => sprintf(__('%d submissions updated successfully.', 'form-plugin'), $updated_count),
            'updated_count' => $updated_count
        ));
    }
    
    /**
     * AJAX handler for adding submission notes
     */
    public function ajax_add_submission_notes() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $submission_id = isset($_POST['submission_id']) ? intval($_POST['submission_id']) : 0;
        $notes = isset($_POST['notes']) ? sanitize_textarea_field($_POST['notes']) : '';
        
        if ($submission_id === 0) {
            wp_send_json_error(array('message' => __('Invalid submission ID.', 'form-plugin')));
        }
        
        $result = $this->database->add_submission_notes($submission_id, $notes);
        
        if ($result) {
            wp_send_json_success(array('message' => __('Notes updated successfully.', 'form-plugin')));
        } else {
            wp_send_json_error(array('message' => __('Failed to update notes.', 'form-plugin')));
        }
    }
    
    /**
     * Convert array to CSV row
     */
    private function array_to_csv_row($array) {
        $csv_row = '';
        $first = true;
        
        foreach ($array as $value) {
            if (!$first) {
                $csv_row .= ',';
            }
            
            // Escape value if it contains comma, quote, or newline
            $value = str_replace('"', '""', $value);
            if (strpos($value, ',') !== false || strpos($value, '"') !== false || strpos($value, "\n") !== false) {
                $value = '"' . $value . '"';
            }
            
            $csv_row .= $value;
            $first = false;
        }
        
        return $csv_row;
    }
    
    /**
     * AJAX handler for getting form templates
     */
    public function ajax_get_templates() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $templates = $this->database->get_form_templates();
        wp_send_json_success($templates);
    }
    
    /**
     * AJAX handler for getting current form template
     */
    public function ajax_get_template() {
        check_ajax_referer('form_plugin_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions.', 'form-plugin')));
        }
        
        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        
        if ($form_id === 0) {
            wp_send_json_error(array('message' => __('Invalid form ID.', 'form-plugin')));
        }
        
        $template_data = $this->database->get_form_template($form_id);
        wp_send_json_success($template_data);
    }
    
    /**
     * AJAX handler for updating form template - Simplified
     */
    public function ajax_update_template() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'form_plugin_nonce')) {
            wp_send_json_error(array('message' => 'Security check failed.'));
        }
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Insufficient permissions.'));
        }
        
        // Get and validate form ID
        $form_id = isset($_POST['form_id']) ? intval($_POST['form_id']) : 0;
        if ($form_id === 0) {
            wp_send_json_error(array('message' => 'Invalid form ID.'));
        }
        
        // Get template ID
        $template_id = isset($_POST['template_id']) ? sanitize_text_field($_POST['template_id']) : 'classic';
        
        // Get and sanitize customization data
        $customization = isset($_POST['customization']) ? $_POST['customization'] : array();
        
        // Ensure it's an array
        if (is_object($customization)) {
            $customization = (array) $customization;
        }
        
        // Sanitize color values
        $sanitized_customization = array();
        $color_fields = array('background_color', 'text_color', 'button_color', 'border_color');
        
        foreach ($color_fields as $field) {
            if (isset($customization[$field]) && !empty($customization[$field])) {
                $sanitized_customization[$field] = sanitize_hex_color($customization[$field]);
            }
        }
        
        // Check if template columns exist
        global $wpdb;
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        $columns = $wpdb->get_results("SHOW COLUMNS FROM {$forms_table} LIKE 'template%'");

        // If template columns don't exist, try to add them manually
        if (empty($columns)) {
            // Add template_id column
            $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN template_id varchar(50) DEFAULT 'classic' AFTER form_cache");

            // Add template_customization column
            $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN template_customization longtext AFTER template_id");
        }

        // Update template in database
        $result = $this->database->update_form_template($form_id, $template_id, $sanitized_customization);

        if ($result) {
            wp_send_json_success(array('message' => 'Template updated successfully.'));
        } else {
            wp_send_json_error(array('message' => 'Failed to update template.'));
        }
    }
    
}

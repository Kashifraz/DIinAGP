<?php
/**
 * Database operations class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Database operations class
 */
class Form_Plugin_Database {
    
    /**
     * WordPress database instance
     *
     * @var wpdb
     */
    private $wpdb;
    
    /**
     * Forms table name
     *
     * @var string
     */
    private $forms_table;
    
    /**
     * Submissions table name
     *
     * @var string
     */
    private $submissions_table;
    
    /**
     * Submission metadata table name
     *
     * @var string
     */
    private $submission_metadata_table;
    
    /**
     * Submission tags table name
     *
     * @var string
     */
    private $submission_tags_table;
    
    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->forms_table = $wpdb->prefix . 'form_plugin_forms';
        $this->submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        $this->submission_metadata_table = $wpdb->prefix . 'form_plugin_submission_metadata';
        $this->submission_tags_table = $wpdb->prefix . 'form_plugin_submission_tags';
    }
    
    /**
     * Create a new form
     *
     * @param array $data Form data
     * @return int|false Form ID on success, false on failure
     */
    public function create_form($data) {
        $defaults = array(
            'title' => '',
            'description' => '',
            'form_data' => '',
            'settings' => '',
            'field_config' => array(),
            'validation_rules' => array(),
            'field_options' => array(),
            'template_id' => 'classic',
            'template_customization' => array(),
            'status' => 'active'
        );
        
        $data = wp_parse_args($data, $defaults);
        
        // Generate unique shortcode
        $shortcode = $this->generate_shortcode();
        
        $result = $this->wpdb->insert(
            $this->forms_table,
            array(
                'title' => sanitize_text_field($data['title']),
                'description' => sanitize_textarea_field($data['description']),
                'form_data' => wp_json_encode($data['form_data']),
                'settings' => wp_json_encode($data['settings']),
                'field_config' => wp_json_encode($data['field_config']),
                'validation_rules' => wp_json_encode($data['validation_rules']),
                'field_options' => wp_json_encode($data['field_options']),
                'template_id' => sanitize_text_field($data['template_id']),
                'template_customization' => wp_json_encode($data['template_customization']),
                'shortcode' => $shortcode,
                'status' => sanitize_text_field($data['status'])
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result === false) {
            return false;
        }
        
        return $this->wpdb->insert_id;
    }
    
    /**
     * Get form by ID
     *
     * @param int $form_id Form ID
     * @return object|null Form object or null if not found
     */
    public function get_form($form_id) {
        $form = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->forms_table} WHERE id = %d",
                $form_id
            )
        );
        
        if ($form) {
            $form->form_data = json_decode($form->form_data, true);
            $form->settings = json_decode($form->settings, true);
            $form->field_config = json_decode($form->field_config, true);
            $form->validation_rules = json_decode($form->validation_rules, true);
            $form->field_options = json_decode($form->field_options, true);
        }
        
        return $form;
    }
    
    /**
     * Get all forms
     *
     * @param array $args Query arguments
     * @return array Array of form objects
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
        
        $where = '';
        if (!empty($args['status'])) {
            $where = $this->wpdb->prepare("WHERE status = %s", $args['status']);
        }
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        
        $sql = "SELECT * FROM {$this->forms_table} {$where} ORDER BY {$orderby} LIMIT %d OFFSET %d";
        
        $forms = $this->wpdb->get_results(
            $this->wpdb->prepare($sql, $args['limit'], $args['offset'])
        );
        
        // Decode JSON fields
        foreach ($forms as $form) {
            $form->form_data = json_decode($form->form_data, true);
            $form->settings = json_decode($form->settings, true);
            $form->field_config = json_decode($form->field_config, true);
            $form->validation_rules = json_decode($form->validation_rules, true);
            $form->field_options = json_decode($form->field_options, true);
        }
        
        return $forms;
    }
    
    /**
     * Update form
     *
     * @param int $form_id Form ID
     * @param array $data Form data
     * @return bool True on success, false on failure
     */
    public function update_form($form_id, $data) {
        $update_data = array();
        $update_format = array();
        
        if (isset($data['title'])) {
            $update_data['title'] = sanitize_text_field($data['title']);
            $update_format[] = '%s';
        }
        
        if (isset($data['description'])) {
            $update_data['description'] = sanitize_textarea_field($data['description']);
            $update_format[] = '%s';
        }
        
        if (isset($data['form_data'])) {
            $update_data['form_data'] = wp_json_encode($data['form_data']);
            $update_format[] = '%s';
        }
        
        if (isset($data['settings'])) {
            $update_data['settings'] = wp_json_encode($data['settings']);
            $update_format[] = '%s';
        }
        
        if (isset($data['status'])) {
            $update_data['status'] = sanitize_text_field($data['status']);
            $update_format[] = '%s';
        }
        
        if (isset($data['template_id'])) {
            $update_data['template_id'] = sanitize_text_field($data['template_id']);
            $update_format[] = '%s';
        }
        
        if (isset($data['template_customization'])) {
            $update_data['template_customization'] = wp_json_encode($data['template_customization']);
            $update_format[] = '%s';
        }
        
        if (empty($update_data)) {
            return false;
        }
        
        $result = $this->wpdb->update(
            $this->forms_table,
            $update_data,
            array('id' => $form_id),
            $update_format,
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Delete form
     *
     * @param int $form_id Form ID
     * @return bool True on success, false on failure
     */
    public function delete_form($form_id) {
        // Delete associated submissions first
        $this->wpdb->delete(
            $this->submissions_table,
            array('form_id' => $form_id),
            array('%d')
        );
        
        // Delete the form
        $result = $this->wpdb->delete(
            $this->forms_table,
            array('id' => $form_id),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Get form by shortcode
     *
     * @param string $shortcode Form shortcode
     * @return object|null Form object or null if not found
     */
    public function get_form_by_shortcode($shortcode) {
        $form = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT * FROM {$this->forms_table} WHERE shortcode = %s AND status = 'active'",
                $shortcode
            )
        );
        
        if ($form) {
            $form->form_data = json_decode($form->form_data, true);
            $form->settings = json_decode($form->settings, true);
            $form->field_config = json_decode($form->field_config, true);
            $form->validation_rules = json_decode($form->validation_rules, true);
            $form->field_options = json_decode($form->field_options, true);
        }
        
        return $form;
    }
    
    /**
     * Generate unique shortcode
     *
     * @return string Unique shortcode
     */
    private function generate_shortcode() {
        $shortcode = 'form_' . wp_generate_password(8, false);
        
        // Check if shortcode already exists
        $existing = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT id FROM {$this->forms_table} WHERE shortcode = %s",
                $shortcode
            )
        );
        
        if ($existing) {
            return $this->generate_shortcode(); // Recursive call to generate new one
        }
        
        return $shortcode;
    }
    
    /**
     * Get forms count
     *
     * @param string $status Form status
     * @return int Forms count
     */
    public function get_forms_count($status = '') {
        if (empty($status)) {
            return $this->wpdb->get_var("SELECT COUNT(*) FROM {$this->forms_table}");
        }
        
        return $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->forms_table} WHERE status = %s",
                $status
            )
        );
    }
    
    /**
     * Check if database tables exist
     *
     * @return bool True if tables exist, false otherwise
     */
    public function tables_exist() {
        $forms_exists = $this->wpdb->get_var(
            "SHOW TABLES LIKE '{$this->forms_table}'"
        );
        
        $submissions_exists = $this->wpdb->get_var(
            "SHOW TABLES LIKE '{$this->submissions_table}'"
        );
        
        return $forms_exists && $submissions_exists;
    }
    
    /**
     * Save form submission
     *
     * @param int $form_id Form ID
     * @param array $submission_data Submission data
     * @return int|false Submission ID or false on failure
     */
    public function save_submission($form_id, $submission_data) {
        $user_ip = $this->get_user_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        
        $result = $this->wpdb->insert(
            $this->submissions_table,
            array(
                'form_id' => $form_id,
                'submission_data' => json_encode($submission_data),
                'user_ip' => $user_ip,
                'user_agent' => $user_agent,
                'submitted_at' => current_time('mysql'),
                'status' => 'new'
            ),
            array(
                '%d',
                '%s',
                '%s',
                '%s',
                '%s',
                '%s'
            )
        );
        
        if ($result) {
            return $this->wpdb->insert_id;
        }
        
        return false;
    }
    
    /**
     * Get user IP address
     *
     * @return string User IP address
     */
    private function get_user_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }
    
    /**
     * Get submission by ID
     *
     * @param int $submission_id Submission ID
     * @return object|null Submission object or null if not found
     */
    public function get_submission($submission_id) {
        $submission = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT s.*, f.title as form_title 
                 FROM {$this->submissions_table} s 
                 LEFT JOIN {$this->forms_table} f ON s.form_id = f.id 
                 WHERE s.id = %d",
                $submission_id
            )
        );
        
        return $submission;
    }
    
    /**
     * Get submissions
     *
     * @param int $form_id Optional form ID to filter by
     * @param array $args Query arguments
     * @return array Array of submission objects
     */
    public function get_submissions($form_id = 0, $args = array()) {
        $defaults = array(
            'status' => '',
            'limit' => 50,
            'offset' => 0,
            'orderby' => 'submitted_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $where_conditions = array();
        $where_values = array();
        
        if ($form_id > 0) {
            $where_conditions[] = 's.form_id = %d';
            $where_values[] = $form_id;
        }
        
        if (!empty($args['status'])) {
            $where_conditions[] = 's.status = %s';
            $where_values[] = $args['status'];
        }
        
        $where_clause = '';
        if (!empty($where_conditions)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        $order_clause = sprintf(
            'ORDER BY s.%s %s',
            sanitize_sql_orderby($args['orderby']),
            strtoupper($args['order']) === 'ASC' ? 'ASC' : 'DESC'
        );
        
        $limit_clause = sprintf('LIMIT %d OFFSET %d', $args['limit'], $args['offset']);
        
        $sql = "SELECT s.*, f.title as form_title 
                FROM {$this->submissions_table} s 
                LEFT JOIN {$this->forms_table} f ON s.form_id = f.id 
                {$where_clause} 
                {$order_clause} 
                {$limit_clause}";
        
        if (!empty($where_values)) {
            $submissions = $this->wpdb->get_results(
                $this->wpdb->prepare($sql, $where_values)
            );
        } else {
            $submissions = $this->wpdb->get_results($sql);
        }
        
        return $submissions;
    }
    
    /**
     * Delete submission
     *
     * @param int $submission_id Submission ID
     * @return bool True on success, false on failure
     */
    public function delete_submission($submission_id) {
        $result = $this->wpdb->delete(
            $this->submissions_table,
            array('id' => $submission_id),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Get submissions count
     *
     * @param int $form_id Optional form ID to filter by
     * @param string $status Optional status to filter by
     * @return int Submissions count
     */
    public function get_submissions_count($form_id = 0, $status = '') {
        $where_conditions = array();
        $where_values = array();
        
        if ($form_id > 0) {
            $where_conditions[] = 'form_id = %d';
            $where_values[] = $form_id;
        }
        
        if (!empty($status)) {
            $where_conditions[] = 'status = %s';
            $where_values[] = $status;
        }
        
        $where_clause = '';
        if (!empty($where_conditions)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        $sql = "SELECT COUNT(*) FROM {$this->submissions_table} {$where_clause}";
        
        if (!empty($where_values)) {
            return $this->wpdb->get_var(
                $this->wpdb->prepare($sql, $where_values)
            );
        } else {
            return $this->wpdb->get_var($sql);
        }
    }
    
    /**
     * Update submission status
     *
     * @param int $submission_id Submission ID
     * @param string $status New status
     * @return bool True on success, false on failure
     */
    public function update_submission_status($submission_id, $status) {
        $valid_statuses = array('new', 'read', 'archived', 'spam', 'trash');
        
        if (!in_array($status, $valid_statuses)) {
            return false;
        }
        
        $result = $this->wpdb->update(
            $this->submissions_table,
            array('status' => $status),
            array('id' => $submission_id),
            array('%s'),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Add notes to submission
     *
     * @param int $submission_id Submission ID
     * @param string $notes Notes to add
     * @return bool True on success, false on failure
     */
    public function add_submission_notes($submission_id, $notes) {
        $result = $this->wpdb->update(
            $this->submissions_table,
            array('notes' => $notes),
            array('id' => $submission_id),
            array('%s'),
            array('%d')
        );
        
        return $result !== false;
    }
    
    /**
     * Search submissions
     *
     * @param array $args Search arguments
     * @return array|int Search results or count
     */
    public function search_submissions($args = array()) {
        $defaults = array(
            'form_id' => 0,
            'status' => '',
            'search' => '',
            'date_from' => '',
            'date_to' => '',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'submitted_at',
            'order' => 'DESC',
            'count' => false
        );
        
        $args = wp_parse_args($args, $defaults);
        
        $where_conditions = array();
        $where_values = array();
        
        if (!empty($args['form_id'])) {
            $where_conditions[] = 's.form_id = %d';
            $where_values[] = $args['form_id'];
        }
        
        if (!empty($args['status'])) {
            $where_conditions[] = 's.status = %s';
            $where_values[] = $args['status'];
        }
        
        if (!empty($args['search'])) {
            $where_conditions[] = 'MATCH(s.submission_data) AGAINST(%s IN BOOLEAN MODE)';
            $where_values[] = $args['search'];
        }
        
        if (!empty($args['date_from'])) {
            $where_conditions[] = 's.submitted_at >= %s';
            $where_values[] = $args['date_from'];
        }
        
        if (!empty($args['date_to'])) {
            $where_conditions[] = 's.submitted_at <= %s';
            $where_values[] = $args['date_to'];
        }
        
        $where_clause = '';
        if (!empty($where_conditions)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        $order_clause = sprintf('ORDER BY s.%s %s', $args['orderby'], $args['order']);
        
        $limit_clause = '';
        if (!$args['count']) {
            $limit_clause = sprintf('LIMIT %d OFFSET %d', $args['limit'], $args['offset']);
        }
        
        if ($args['count']) {
            $sql = "SELECT COUNT(*) 
                    FROM {$this->submissions_table} s 
                    LEFT JOIN {$this->forms_table} f ON s.form_id = f.id 
                    {$where_clause}";
            
            if (!empty($where_values)) {
                return $this->wpdb->get_var($this->wpdb->prepare($sql, $where_values));
            } else {
                return $this->wpdb->get_var($sql);
            }
        } else {
            $sql = "SELECT s.*, f.title as form_title 
                    FROM {$this->submissions_table} s 
                    LEFT JOIN {$this->forms_table} f ON s.form_id = f.id 
                    {$where_clause} 
                    {$order_clause} 
                    {$limit_clause}";
            
            if (!empty($where_values)) {
                return $this->wpdb->get_results($this->wpdb->prepare($sql, $where_values));
            } else {
                return $this->wpdb->get_results($sql);
            }
        }
    }
    
    /**
     * Bulk update submission status
     *
     * @param array $submission_ids Array of submission IDs
     * @param string $status New status
     * @return int Number of updated submissions
     */
    public function bulk_update_submission_status($submission_ids, $status) {
        if (empty($submission_ids) || !is_array($submission_ids)) {
            return 0;
        }
        
        $valid_statuses = array('new', 'read', 'archived', 'spam', 'trash');
        if (!in_array($status, $valid_statuses)) {
            return 0;
        }
        
        $placeholders = implode(',', array_fill(0, count($submission_ids), '%d'));
        $submission_ids = array_map('intval', $submission_ids);
        
        $sql = "UPDATE {$this->submissions_table} 
                SET status = %s 
                WHERE id IN ({$placeholders})";
        
        $values = array_merge(array($status), $submission_ids);
        
        $result = $this->wpdb->query($this->wpdb->prepare($sql, $values));
        
        return $result;
    }
    
    /**
     * Add submission metadata
     *
     * @param int $submission_id Submission ID
     * @param string $meta_key Metadata key
     * @param mixed $meta_value Metadata value
     * @return bool True on success, false on failure
     */
    public function add_submission_metadata($submission_id, $meta_key, $meta_value) {
        $result = $this->wpdb->replace(
            $this->submission_metadata_table,
            array(
                'submission_id' => $submission_id,
                'meta_key' => $meta_key,
                'meta_value' => maybe_serialize($meta_value)
            ),
            array('%d', '%s', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * Get submission metadata
     *
     * @param int $submission_id Submission ID
     * @param string $meta_key Optional metadata key
     * @return mixed Metadata value(s)
     */
    public function get_submission_metadata($submission_id, $meta_key = '') {
        if (!empty($meta_key)) {
            $meta_value = $this->wpdb->get_var(
                $this->wpdb->prepare(
                    "SELECT meta_value FROM {$this->submission_metadata_table} 
                     WHERE submission_id = %d AND meta_key = %s",
                    $submission_id,
                    $meta_key
                )
            );
            
            return maybe_unserialize($meta_value);
        } else {
            $results = $this->wpdb->get_results(
                $this->wpdb->prepare(
                    "SELECT meta_key, meta_value FROM {$this->submission_metadata_table} 
                     WHERE submission_id = %d",
                    $submission_id
                )
            );
            
            $metadata = array();
            foreach ($results as $result) {
                $metadata[$result->meta_key] = maybe_unserialize($result->meta_value);
            }
            
            return $metadata;
        }
    }
    
    /**
     * Add submission tag
     *
     * @param int $submission_id Submission ID
     * @param string $tag_name Tag name
     * @return bool True on success, false on failure
     */
    public function add_submission_tag($submission_id, $tag_name) {
        $result = $this->wpdb->replace(
            $this->submission_tags_table,
            array(
                'submission_id' => $submission_id,
                'tag_name' => sanitize_text_field($tag_name)
            ),
            array('%d', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * Remove submission tag
     *
     * @param int $submission_id Submission ID
     * @param string $tag_name Tag name
     * @return bool True on success, false on failure
     */
    public function remove_submission_tag($submission_id, $tag_name) {
        $result = $this->wpdb->delete(
            $this->submission_tags_table,
            array(
                'submission_id' => $submission_id,
                'tag_name' => $tag_name
            ),
            array('%d', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * Get submission tags
     *
     * @param int $submission_id Submission ID
     * @return array Array of tag names
     */
    public function get_submission_tags($submission_id) {
        $results = $this->wpdb->get_col(
            $this->wpdb->prepare(
                "SELECT tag_name FROM {$this->submission_tags_table} 
                 WHERE submission_id = %d",
                $submission_id
            )
        );
        
        return $results;
    }
    
    /**
     * Get all unique tags
     *
     * @return array Array of unique tag names
     */
    public function get_all_tags() {
        $results = $this->wpdb->get_col(
            "SELECT DISTINCT tag_name FROM {$this->submission_tags_table} ORDER BY tag_name"
        );
        
        return $results;
    }
    
    /**
     * Export submissions to CSV
     *
     * @param array $args Export arguments
     * @return array|false CSV data array or false on failure
     */
    public function export_submissions_csv($args = array()) {
        $defaults = array(
            'form_id' => 0,
            'status' => '',
            'search' => '',
            'date_from' => '',
            'date_to' => '',
            'limit' => 0,
            'offset' => 0
        );
        
        $args = wp_parse_args($args, $defaults);
        
        // Build the query
        $where_conditions = array();
        $where_values = array();
        
        if ($args['form_id'] > 0) {
            $where_conditions[] = "s.form_id = %d";
            $where_values[] = $args['form_id'];
        }
        
        if (!empty($args['status'])) {
            $where_conditions[] = "s.status = %s";
            $where_values[] = $args['status'];
        }
        
        if (!empty($args['search'])) {
            $where_conditions[] = "s.submission_data LIKE %s";
            $where_values[] = '%' . $this->wpdb->esc_like($args['search']) . '%';
        }
        
        if (!empty($args['date_from'])) {
            $where_conditions[] = "DATE(s.submitted_at) >= %s";
            $where_values[] = $args['date_from'];
        }
        
        if (!empty($args['date_to'])) {
            $where_conditions[] = "DATE(s.submitted_at) <= %s";
            $where_values[] = $args['date_to'];
        }
        
        $where_clause = '';
        if (!empty($where_conditions)) {
            $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        }
        
        $limit_clause = '';
        if ($args['limit'] > 0) {
            $limit_clause = $this->wpdb->prepare("LIMIT %d OFFSET %d", $args['limit'], $args['offset']);
        }
        
        $query = "
            SELECT s.*, f.title as form_title 
            FROM {$this->submissions_table} s 
            LEFT JOIN {$this->forms_table} f ON s.form_id = f.id 
            {$where_clause} 
            ORDER BY s.submitted_at DESC 
            {$limit_clause}
        ";
        
        if (!empty($where_values)) {
            $query = $this->wpdb->prepare($query, $where_values);
        }
        
        $submissions = $this->wpdb->get_results($query);
        
        if (empty($submissions)) {
            return false;
        }
        
        // Generate CSV content
        $csv_data = array();
        
        // Get all unique field names from all submissions
        $all_fields = array();
        foreach ($submissions as $submission) {
            $submission_data = json_decode($submission->submission_data, true);
            if ($submission_data && is_array($submission_data)) {
                foreach ($submission_data as $key => $value) {
                    if (is_array($value) && isset($value['label'])) {
                        $all_fields[$value['label']] = $value['label'];
                    }
                }
            }
        }
        
        // Create header row
        $header = array(
            'ID',
            'Form',
            'Status',
            'Submitted At',
            'User IP',
            'User Agent'
        );
        
        // Add dynamic field headers
        foreach ($all_fields as $field_label) {
            $header[] = $field_label;
        }
        
        $csv_data[] = $header;
        
        // Create data rows
        foreach ($submissions as $submission) {
            $row = array(
                $submission->id,
                $submission->form_title,
                $submission->status,
                $submission->submitted_at,
                $submission->user_ip,
                $submission->user_agent
            );
            
            // Add field values
            $submission_data = json_decode($submission->submission_data, true);
            $field_values = array();
            
            if ($submission_data && is_array($submission_data)) {
                foreach ($submission_data as $key => $value) {
                    if (is_array($value) && isset($value['label']) && isset($value['value'])) {
                        $field_values[$value['label']] = $value['value'];
                    }
                }
            }
            
            // Add field values in the same order as headers
            foreach ($all_fields as $field_label) {
                $row[] = isset($field_values[$field_label]) ? $field_values[$field_label] : '';
            }
            
            $csv_data[] = $row;
        }
        
        return $csv_data;
    }
    
    /**
     * Get available form templates
     */
    public function get_form_templates() {
        return array(
            'classic' => array(
                'name' => 'Classic',
                'description' => 'Traditional form layout with standard styling',
                'preview' => 'classic-preview.png'
            ),
            'modern' => array(
                'name' => 'Modern',
                'description' => 'Contemporary design with rounded corners and shadows',
                'preview' => 'modern-preview.png'
            ),
            'minimal' => array(
                'name' => 'Minimal',
                'description' => 'Clean, simple design with minimal styling',
                'preview' => 'minimal-preview.png'
            ),
            'professional' => array(
                'name' => 'Professional',
                'description' => 'Business-focused design with structured layout',
                'preview' => 'professional-preview.png'
            )
        );
    }
    
    /**
     * Update form template - Simplified
     */
    public function update_form_template($form_id, $template_id, $customization = array()) {
        // Check if form exists
        $form_exists = $this->wpdb->get_var($this->wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->forms_table} WHERE id = %d",
            $form_id
        ));
        
        if (!$form_exists) {
            return false;
        }
        
        // Prepare data
        $update_data = array(
            'template_id' => $template_id,
            'template_customization' => json_encode($customization)
        );
        
        // Update the form
        $result = $this->wpdb->update(
            $this->forms_table,
            $update_data,
            array('id' => $form_id),
            array('%s', '%s'),
            array('%d')
        );
        
        if ($result === false) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get form template
     */
    public function get_form_template($form_id) {
        $result = $this->wpdb->get_row(
            $this->wpdb->prepare(
                "SELECT template_id, template_customization FROM {$this->forms_table} WHERE id = %d",
                $form_id
            )
        );
        
        if ($result) {
            $customization = $result->template_customization ? json_decode($result->template_customization, true) : array();
            
            return array(
                'template_id' => $result->template_id ?: 'classic',
                'customization' => $customization
            );
        }
        
        return array(
            'template_id' => 'classic',
            'customization' => array()
        );
    }
}

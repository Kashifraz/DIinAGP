<?php
/**
 * Main plugin class
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Form Plugin class
 */
class Form_Plugin {
    
    /**
     * Plugin instance
     *
     * @var Form_Plugin
     */
    private static $instance = null;
    
    /**
     * Database instance
     *
     * @var Form_Plugin_Database
     */
    public $database;
    
    /**
     * Admin instance
     *
     * @var Form_Plugin_Admin
     */
    public $admin;
    
    /**
     * Get plugin instance
     *
     * @return Form_Plugin
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->load_dependencies();
        $this->init_hooks();
        $this->migrate_database();
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        // Load core classes
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-database.php';
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-field-manager.php';
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-form-builder.php';
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-admin.php';
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-security.php';
        require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-form-renderer.php';
        
        // Initialize core components
        $this->database = new Form_Plugin_Database();
        $this->admin = new Form_Plugin_Admin();
        
        // Initialize frontend components
        add_action('init', array($this, 'init_frontend'));
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        }
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('init', array($this, 'init'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('form-plugin', false, dirname(FORM_PLUGIN_PLUGIN_BASENAME) . '/languages');
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Main menu page
        add_menu_page(
            __('Form Builder', 'form-plugin'),
            __('Form Builder', 'form-plugin'),
            'manage_options',
            'form-plugin',
            array($this->admin, 'forms_page'),
            'dashicons-feedback',
            30
        );
        
        // Forms submenu
        add_submenu_page(
            'form-plugin',
            __('All Forms', 'form-plugin'),
            __('All Forms', 'form-plugin'),
            'manage_options',
            'form-plugin',
            array($this->admin, 'forms_page')
        );
        
        // Add New Form submenu
        add_submenu_page(
            'form-plugin',
            __('Add New Form', 'form-plugin'),
            __('Add New Form', 'form-plugin'),
            'manage_options',
            'form-plugin-new',
            array($this->admin, 'new_form_page')
        );
        
        // Submissions submenu
        add_submenu_page(
            'form-plugin',
            __('Submissions', 'form-plugin'),
            __('Submissions', 'form-plugin'),
            'manage_options',
            'form-plugin-submissions',
            array($this->admin, 'submissions_page')
        );
        
    }
    
    /**
     * Enqueue admin scripts and styles
     *
     * @param string $hook Current admin page hook
     */
    public function admin_enqueue_scripts($hook) {
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
        
        // Enqueue jQuery UI for drag and drop
        wp_enqueue_script('jquery-ui-sortable');
        
        // Enqueue admin CSS
        wp_enqueue_style(
            'form-plugin-admin',
            FORM_PLUGIN_PLUGIN_URL . 'admin/css/admin.css',
            array('bootstrap'),
            FORM_PLUGIN_VERSION
        );
        
        // Enqueue admin JS
        wp_enqueue_script(
            'form-plugin-admin',
            FORM_PLUGIN_PLUGIN_URL . 'admin/js/admin.js',
            array('jquery', 'jquery-ui-sortable'),
            FORM_PLUGIN_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('form-plugin-admin', 'formPlugin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('form_plugin_nonce'),
            'strings' => array(
                'confirmDelete' => __('Are you sure you want to delete this form?', 'form-plugin'),
                'formSaved' => __('Form saved successfully!', 'form-plugin'),
                'errorOccurred' => __('An error occurred. Please try again.', 'form-plugin')
            )
        ));
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function frontend_enqueue_scripts() {
        // Enqueue Bootstrap CSS
        wp_enqueue_style(
            'bootstrap',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
            array(),
            '5.3.0'
        );
        
        // Enqueue frontend CSS
        wp_enqueue_style(
            'form-plugin-frontend',
            FORM_PLUGIN_PLUGIN_URL . 'public/css/frontend.css',
            array('bootstrap'),
            FORM_PLUGIN_VERSION
        );
        
        // Enqueue frontend JS
        wp_enqueue_script(
            'form-plugin-frontend',
            FORM_PLUGIN_PLUGIN_URL . 'public/js/frontend.js',
            array('jquery'),
            FORM_PLUGIN_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('form-plugin-frontend', 'formPlugin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('form_plugin_nonce')
        ));
    }
    
    /**
     * Create database tables
     */
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Forms table
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        $forms_sql = "CREATE TABLE $forms_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            form_data longtext,
            settings longtext,
            field_config longtext,
            validation_rules longtext,
            field_options longtext,
            shortcode varchar(50) UNIQUE,
            form_cache longtext,
            template_id varchar(50) DEFAULT 'classic',
            template_customization longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            status enum('active', 'inactive') DEFAULT 'active',
            PRIMARY KEY (id),
            KEY status (status),
            KEY created_at (created_at),
            KEY title (title)
        ) $charset_collate;";
        
        // Submissions table
        $submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        $submissions_sql = "CREATE TABLE $submissions_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            form_id int(11) NOT NULL,
            submission_data longtext,
            user_ip varchar(45),
            user_agent text,
            submitted_at datetime DEFAULT CURRENT_TIMESTAMP,
            status enum('new', 'read', 'archived', 'spam', 'trash') DEFAULT 'new',
            notes text,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY form_id (form_id),
            KEY submitted_at (submitted_at),
            KEY status (status),
            KEY user_ip (user_ip),
            FULLTEXT KEY search_data (submission_data)
        ) $charset_collate;";
        
        // Form cache table for performance optimization
        $form_cache_table = $wpdb->prefix . 'form_plugin_form_cache';
        $form_cache_sql = "CREATE TABLE $form_cache_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            form_id int(11) NOT NULL,
            cache_key varchar(255) NOT NULL,
            cache_data longtext,
            expires_at datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY form_cache_key (form_id, cache_key),
            KEY expires_at (expires_at),
            KEY form_id (form_id)
        ) $charset_collate;";
        
        // Submission metadata table
        $submission_metadata_table = $wpdb->prefix . 'form_plugin_submission_metadata';
        $submission_metadata_sql = "CREATE TABLE $submission_metadata_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            submission_id int(11) NOT NULL,
            meta_key varchar(255) NOT NULL,
            meta_value longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY submission_id (submission_id),
            KEY meta_key (meta_key),
            UNIQUE KEY submission_meta (submission_id, meta_key)
        ) $charset_collate;";
        
        // Submission tags table
        $submission_tags_table = $wpdb->prefix . 'form_plugin_submission_tags';
        $submission_tags_sql = "CREATE TABLE $submission_tags_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            submission_id int(11) NOT NULL,
            tag_name varchar(100) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY submission_id (submission_id),
            KEY tag_name (tag_name),
            UNIQUE KEY submission_tag (submission_id, tag_name)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($forms_sql);
        dbDelta($submissions_sql);
        dbDelta($form_cache_sql);
        dbDelta($submission_metadata_sql);
        dbDelta($submission_tags_sql);
        
        // Set database version
        update_option('form_plugin_db_version', '1.4.0');
    }
    
    /**
     * Migrate database if needed
     */
    public static function migrate_database() {
        $current_version = get_option('form_plugin_db_version', '1.0.0');
        
        if (version_compare($current_version, '1.1.0', '<')) {
            self::migrate_to_1_1_0();
        }
        
        if (version_compare($current_version, '1.2.0', '<')) {
            self::migrate_to_1_2_0();
        }
        
        if (version_compare($current_version, '1.3.0', '<')) {
            self::migrate_to_1_3_0();
        }
        
        if (version_compare($current_version, '1.4.0', '<')) {
            self::migrate_to_1_4_0();
        }
    }
    
    /**
     * Migrate to version 1.1.0 - Add field configuration columns
     */
    private static function migrate_to_1_1_0() {
        global $wpdb;
        
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        
        // Add new columns if they don't exist
        $columns_to_add = array(
            'field_config' => 'longtext',
            'validation_rules' => 'longtext',
            'field_options' => 'longtext'
        );
        
        foreach ($columns_to_add as $column => $type) {
            $column_exists = $wpdb->get_results(
                $wpdb->prepare(
                    "SHOW COLUMNS FROM {$forms_table} LIKE %s",
                    $column
                )
            );
            
            if (empty($column_exists)) {
                $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN {$column} {$type}");
            }
        }
        
        // Update database version
        update_option('form_plugin_db_version', '1.1.0');
    }
    
    /**
     * Migrate to version 1.2.0 - Add form cache column and table
     */
    private static function migrate_to_1_2_0() {
        global $wpdb;
        
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        
        // Add form_cache column to forms table
        $column_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SHOW COLUMNS FROM {$forms_table} LIKE %s",
                'form_cache'
            )
        );
        
        if (empty($column_exists)) {
            $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN form_cache longtext AFTER shortcode");
        }
        
        // Create form_cache table
        $form_cache_table = $wpdb->prefix . 'form_plugin_form_cache';
        $form_cache_sql = "CREATE TABLE IF NOT EXISTS $form_cache_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            form_id int(11) NOT NULL,
            cache_key varchar(255) NOT NULL,
            cache_data longtext,
            expires_at datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY form_cache_key (form_id, cache_key),
            KEY expires_at (expires_at),
            KEY form_id (form_id)
        ) " . $wpdb->get_charset_collate() . ";";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($form_cache_sql);
        
        // Update database version
        update_option('form_plugin_db_version', '1.2.0');
    }
    
    /**
     * Migrate to version 1.3.0 - Add submission management features
     */
    private static function migrate_to_1_3_0() {
        global $wpdb;
        
        $submissions_table = $wpdb->prefix . 'form_plugin_submissions';
        
        // Add new columns to submissions table
        $columns_to_add = array(
            'notes' => 'text',
            'updated_at' => 'datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        );
        
        foreach ($columns_to_add as $column => $definition) {
            $column_exists = $wpdb->get_results(
                $wpdb->prepare(
                    "SHOW COLUMNS FROM {$submissions_table} LIKE %s",
                    $column
                )
            );
            
            if (empty($column_exists)) {
                $wpdb->query("ALTER TABLE {$submissions_table} ADD COLUMN {$column} {$definition}");
            }
        }
        
        // Update status enum to include new values
        $wpdb->query("ALTER TABLE {$submissions_table} MODIFY COLUMN status enum('new', 'read', 'archived', 'spam', 'trash') DEFAULT 'new'");
        
        // Add new indexes
        $wpdb->query("ALTER TABLE {$submissions_table} ADD KEY user_ip (user_ip)");
        $wpdb->query("ALTER TABLE {$submissions_table} ADD FULLTEXT KEY search_data (submission_data)");
        
        // Create submission metadata table
        $submission_metadata_table = $wpdb->prefix . 'form_plugin_submission_metadata';
        $submission_metadata_sql = "CREATE TABLE IF NOT EXISTS $submission_metadata_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            submission_id int(11) NOT NULL,
            meta_key varchar(255) NOT NULL,
            meta_value longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY submission_id (submission_id),
            KEY meta_key (meta_key),
            UNIQUE KEY submission_meta (submission_id, meta_key)
        ) " . $wpdb->get_charset_collate() . ";";
        
        // Create submission tags table
        $submission_tags_table = $wpdb->prefix . 'form_plugin_submission_tags';
        $submission_tags_sql = "CREATE TABLE IF NOT EXISTS $submission_tags_table (
            id int(11) NOT NULL AUTO_INCREMENT,
            submission_id int(11) NOT NULL,
            tag_name varchar(100) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY submission_id (submission_id),
            KEY tag_name (tag_name),
            UNIQUE KEY submission_tag (submission_id, tag_name)
        ) " . $wpdb->get_charset_collate() . ";";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($submission_metadata_sql);
        dbDelta($submission_tags_sql);
        
        update_option('form_plugin_db_version', '1.3.0');
    }
    
    /**
     * Migrate to version 1.4.0 - Add template support
     */
    private static function migrate_to_1_4_0() {
        global $wpdb;
        
        $forms_table = $wpdb->prefix . 'form_plugin_forms';
        
        // Add template_id column
        $template_id_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SHOW COLUMNS FROM {$forms_table} LIKE %s",
                'template_id'
            )
        );
        
        if (empty($template_id_exists)) {
            $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN template_id varchar(50) DEFAULT 'classic' AFTER form_cache");
        }
        
        // Add template_customization column
        $template_customization_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SHOW COLUMNS FROM {$forms_table} LIKE %s",
                'template_customization'
            )
        );
        
        if (empty($template_customization_exists)) {
            $wpdb->query("ALTER TABLE {$forms_table} ADD COLUMN template_customization longtext AFTER template_id");
        }
        
        // Update existing forms to use classic template
        $wpdb->query("UPDATE {$forms_table} SET template_id = 'classic' WHERE template_id IS NULL OR template_id = ''");
        
        // Update database version
        update_option('form_plugin_db_version', '1.4.0');
    }
    
    /**
     * Initialize frontend components
     */
    public function init_frontend() {
        // Always initialize form renderer for AJAX handlers
        new Form_Plugin_Form_Renderer();
    }
}

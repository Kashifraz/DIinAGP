<?php
/**
 * Plugin Name: Form Builder Plugin
 * Plugin URI: https://example.com/form-builder-plugin
 * Description: A custom WordPress Form Builder Plugin with drag-and-drop interface for creating and managing forms.
 * Version: 1.0.1
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: form-plugin
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('FORM_PLUGIN_VERSION', '1.0.2');
define('FORM_PLUGIN_PLUGIN_FILE', __FILE__);
define('FORM_PLUGIN_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FORM_PLUGIN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FORM_PLUGIN_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include the main plugin class
require_once FORM_PLUGIN_PLUGIN_DIR . 'includes/class-form-plugin.php';

// Initialize the plugin
function form_plugin_init() {
    Form_Plugin::get_instance();
}
add_action('plugins_loaded', 'form_plugin_init');

// Plugin activation hook
register_activation_hook(__FILE__, 'form_plugin_activate');
function form_plugin_activate() {
    // Check WordPress version
    if (version_compare(get_bloginfo('version'), '5.0', '<')) {
        wp_die(__('This plugin requires WordPress 5.0 or higher.', 'form-plugin'));
    }
    
    // Check PHP version
    if (version_compare(PHP_VERSION, '7.4', '<')) {
        wp_die(__('This plugin requires PHP 7.4 or higher.', 'form-plugin'));
    }
    
    // Create database tables
    Form_Plugin::create_tables();
    
    // Set plugin version
    update_option('form_plugin_version', FORM_PLUGIN_VERSION);
    
    // Flush rewrite rules
    flush_rewrite_rules();
}

// Plugin deactivation hook
register_deactivation_hook(__FILE__, 'form_plugin_deactivate');
function form_plugin_deactivate() {
    // Flush rewrite rules
    flush_rewrite_rules();
}

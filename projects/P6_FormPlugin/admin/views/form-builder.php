<?php
/**
 * Form builder page template
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;
$is_edit = $form_id > 0;
$form = null;

if ($is_edit) {
    $database = new Form_Plugin_Database();
    $form = $database->get_form($form_id);
}
?>

<div class="wrap">
    <h1>
        <?php echo $is_edit ? __('Edit Form', 'form-plugin') : __('Add New Form', 'form-plugin'); ?>
    </h1>
    
    <div class="form-builder-container">
        <!-- Form Metadata Section -->
        <div class="form-metadata-section">
            <div class="metadata-section">
                <div class="section-header">
                    <h4>
                        <i class="dashicons dashicons-admin-generic"></i>
                        <?php _e('Form Settings', 'form-plugin'); ?>
                    </h4>
                </div>
                <div class="metadata-content">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="form-title" class="form-label">
                                    <i class="dashicons dashicons-edit"></i>
                                    <?php _e('Form Title', 'form-plugin'); ?>
                                </label>
                                <input type="text" id="form-title" class="form-control" 
                                       value="<?php echo $form ? esc_attr($form->title) : ''; ?>" 
                                       placeholder="<?php _e('Enter form title', 'form-plugin'); ?>">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="form-status" class="form-label">
                                    <i class="dashicons dashicons-visibility"></i>
                                    <?php _e('Status', 'form-plugin'); ?>
                                </label>
                                <select id="form-status" class="form-control">
                                    <option value="active" <?php echo ($form && $form->status === 'active') ? 'selected' : ''; ?>>
                                        <?php _e('Active', 'form-plugin'); ?>
                                    </option>
                                    <option value="inactive" <?php echo ($form && $form->status === 'inactive') ? 'selected' : ''; ?>>
                                        <?php _e('Inactive', 'form-plugin'); ?>
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="form-shortcode" class="form-label">
                                    <i class="dashicons dashicons-shortcode"></i>
                                    <?php _e('Shortcode', 'form-plugin'); ?>
                                </label>
                                <?php
                                // Get the current shortcode or generate one
                                $current_shortcode = '';
                                if ($form && $form->id) {
                                    // Re-fetch the form to ensure we have the latest data
                                    global $wpdb;
                                    $fresh_form = $wpdb->get_row($wpdb->prepare(
                                        "SELECT * FROM {$wpdb->prefix}form_plugin_forms WHERE id = %d",
                                        $form->id
                                    ));
                                    
                                    if ($fresh_form && !empty($fresh_form->shortcode)) {
                                        $current_shortcode = $fresh_form->shortcode;
                                    } else {
                                        // Generate a new shortcode if missing
                                        $current_shortcode = 'form_' . wp_generate_password(8, false);
                                        $wpdb->update(
                                            $wpdb->prefix . 'form_plugin_forms',
                                            array('shortcode' => $current_shortcode),
                                            array('id' => $form->id)
                                        );
                                    }
                                }
                                
                                // Build the shortcode value
                                $shortcode_value = '';
                                if ($form && $form->id && !empty($current_shortcode)) {
                                    $shortcode_value = '[form_plugin id="' . esc_attr($current_shortcode) . '"]';
                                } else {
                                    $shortcode_value = '[form_plugin id=""]';
                                }
                                ?>
                                <div class="input-group">
                                    <input type="text" id="form-shortcode" class="form-control" 
                                           value='<?php echo $shortcode_value; ?>' 
                                           readonly>
                                    <button class="btn btn-outline-secondary copy-shortcode" type="button">
                                        <i class="dashicons dashicons-admin-page"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="form-description" class="form-label">
                                    <i class="dashicons dashicons-text"></i>
                                    <?php _e('Form Description', 'form-plugin'); ?>
                                </label>
                                <textarea id="form-description" class="form-control" rows="3" 
                                          placeholder="<?php _e('Enter form description (optional)', 'form-plugin'); ?>"><?php echo $form ? esc_textarea($form->description) : ''; ?></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Template Selection Section -->
        <div class="template-selection-section">
            <div class="template-section">
                <div class="section-header">
                    <h4>
                        <i class="dashicons dashicons-admin-appearance"></i>
                        <?php _e('Form Template', 'form-plugin'); ?>
                    </h4>
                </div>
                <div class="template-content">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="template-grid" id="template-grid">
                                <!-- Templates will be loaded via AJAX -->
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="template-customization">
                                <h5><?php _e('Customize Colors', 'form-plugin'); ?></h5>
                                <div class="color-controls">
                                    <div class="form-group">
                                        <label for="template-bg-color"><?php _e('Background Color', 'form-plugin'); ?></label>
                                        <input type="color" id="template-bg-color" class="form-control color-picker" value="#ffffff">
                                    </div>
                                    <div class="form-group">
                                        <label for="template-text-color"><?php _e('Text Color', 'form-plugin'); ?></label>
                                        <input type="color" id="template-text-color" class="form-control color-picker" value="#333333">
                                    </div>
                                    <div class="form-group">
                                        <label for="template-button-color"><?php _e('Button Color', 'form-plugin'); ?></label>
                                        <input type="color" id="template-button-color" class="form-control color-picker" value="#0073aa">
                                    </div>
                                    <div class="form-group">
                                        <label for="template-border-color"><?php _e('Border Color', 'form-plugin'); ?></label>
                                        <input type="color" id="template-border-color" class="form-control color-picker" value="#ddd">
                                    </div>
                                </div>
                            <button type="button" id="apply-template" class="btn btn-primary">
                                <i class="dashicons dashicons-yes"></i> <?php _e('Apply Template', 'form-plugin'); ?>
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Two Column Layout: Form Fields & Drag & Drop -->
        <div class="form-builder-main">
            <div class="row g-3">
                <!-- Form Fields Canvas -->
                <div class="col-lg-8">
                    <div class="form-fields-section">
                        <div class="section-header">
                            <h4>
                                <i class="dashicons dashicons-forms"></i>
                                <?php _e('Form Fields', 'form-plugin'); ?>
                            </h4>
                        </div>
                         <div class="form-fields-container" id="form-fields-container">
                             <div class="empty-form-message">
                                 <p>Drag fields from the sidebar to start building your form.</p>
                             </div>
                         </div>
                    </div>
                </div>
                
                <!-- Field Palette -->
                <div class="col-lg-4">
                    <div class="field-palette-section">
                        <div class="section-header">
                            <h4>
                                <i class="dashicons dashicons-plus"></i>
                                <?php _e('Add Fields', 'form-plugin'); ?>
                            </h4>
                        </div>
                        <div class="field-palette">
                            <div class="field-category">
                                <h6><?php _e('Text Fields', 'form-plugin'); ?></h6>
                                <div class="field-item" data-field-type="text">
                                    <i class="dashicons dashicons-edit"></i>
                                    <span><?php _e('Text Field', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="email">
                                    <i class="dashicons dashicons-email"></i>
                                    <span><?php _e('Email Field', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="textarea">
                                    <i class="dashicons dashicons-text"></i>
                                    <span><?php _e('Textarea', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="number">
                                    <i class="dashicons dashicons-calculator"></i>
                                    <span><?php _e('Number Field', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="date">
                                    <i class="dashicons dashicons-calendar"></i>
                                    <span><?php _e('Date Field', 'form-plugin'); ?></span>
                                </div>
                            </div>
                            
                            <div class="field-category">
                                <h6><?php _e('Selection Fields', 'form-plugin'); ?></h6>
                                <div class="field-item" data-field-type="dropdown">
                                    <i class="dashicons dashicons-arrow-down-alt2"></i>
                                    <span><?php _e('Dropdown', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="radio">
                                    <i class="dashicons dashicons-marker"></i>
                                    <span><?php _e('Radio Buttons', 'form-plugin'); ?></span>
                                </div>
                                <div class="field-item" data-field-type="checkbox">
                                    <i class="dashicons dashicons-yes"></i>
                                    <span><?php _e('Checkbox', 'form-plugin'); ?></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Preview Section -->
        <div class="form-preview-section">
            <div class="preview-section">
                <div class="section-header">
                    <h4>
                        <i class="dashicons dashicons-visibility"></i>
                        <?php _e('Form Preview', 'form-plugin'); ?>
                    </h4>
                </div>
                <div class="preview-container" id="form-preview">
                    <div class="preview-empty">
                        <i class="dashicons dashicons-forms"></i>
                        <p><?php _e('Form preview will appear here as you add fields.', 'form-plugin'); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="form-builder-actions mt-4">
        <button type="button" class="button button-primary" id="save-form">
            <?php _e('Save Form', 'form-plugin'); ?>
        </button>
        <a href="<?php echo admin_url('admin.php?page=form-plugin'); ?>" class="button">
            <?php _e('Cancel', 'form-plugin'); ?>
        </a>
    </div>
</div>

<!-- Field Configuration Modal -->
<div class="modal fade" id="field-config-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content custom-modal-content">
            <div class="modal-header custom-modal-header">
                <h4 class="modal-title custom-modal-title">
                    <i class="dashicons dashicons-admin-generic"></i>
                    <?php _e('Field Configuration', 'form-plugin'); ?>
                </h4>
                <button type="button" class="btn-close custom-close-btn" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body custom-modal-body" id="field-config-content">
                <!-- Field configuration form will be loaded here -->
            </div>
            <div class="modal-footer custom-modal-footer">
                <button type="button" class="btn btn-secondary custom-btn-secondary" data-bs-dismiss="modal">
                    <i class="dashicons dashicons-no-alt"></i>
                    <?php _e('Cancel', 'form-plugin'); ?>
                </button>
                <button type="button" class="btn btn-primary custom-btn-primary" id="save-field-config">
                    <i class="dashicons dashicons-yes"></i>
                    <?php _e('Save Changes', 'form-plugin'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Initialize form builder
    FormBuilder.init({
        formId: <?php echo $form_id; ?>,
        formData: <?php echo $form ? wp_json_encode($form->form_data) : 'null'; ?>,
        isEdit: <?php echo $is_edit ? 'true' : 'false'; ?>
    });
});
</script>

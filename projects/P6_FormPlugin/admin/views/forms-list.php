<?php
/**
 * Forms list page template
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1 class="wp-heading-inline">
        <?php _e('Forms', 'form-plugin'); ?>
        <a href="<?php echo admin_url('admin.php?page=form-plugin-new'); ?>" class="page-title-action">
            <?php _e('Add New', 'form-plugin'); ?>
        </a>
    </h1>
    
    <hr class="wp-header-end">
    
    <?php if (empty($forms)): ?>
        <div class="empty-state">
            <div class="empty-state-content">
                <i class="dashicons dashicons-forms"></i>
                <h3><?php _e('No Forms Found', 'form-plugin'); ?></h3>
                <p><?php _e('Create your first form to get started building amazing forms for your website.', 'form-plugin'); ?></p>
                <a href="<?php echo admin_url('admin.php?page=form-plugin-new'); ?>" class="button button-primary">
                    <i class="dashicons dashicons-plus"></i>
                    <?php _e('Create Your First Form', 'form-plugin'); ?>
                </a>
            </div>
        </div>
    <?php else: ?>
        <div class="forms-list-container">
            <div class="forms-stats">
                <div class="stat-item">
                    <span class="stat-number"><?php echo count($forms); ?></span>
                    <span class="stat-label"><?php _e('Total Forms', 'form-plugin'); ?></span>
                </div>
                <div class="stat-item">
                    <span class="stat-number"><?php echo count(array_filter($forms, function($f) { return $f->status === 'active'; })); ?></span>
                    <span class="stat-label"><?php _e('Active Forms', 'form-plugin'); ?></span>
                </div>
            </div>
            
            <div class="forms-grid">
                <?php foreach ($forms as $form): ?>
                    <div class="form-card" data-form-id="<?php echo $form->id; ?>">
                        <div class="form-card-header">
                            <div class="form-title">
                                <h3>
                                    <a href="<?php echo admin_url('admin.php?page=form-plugin-new&form_id=' . $form->id); ?>">
                                        <?php echo esc_html($form->title); ?>
                                    </a>
                                </h3>
                                <div class="form-status">
                                    <span class="status-badge status-<?php echo esc_attr($form->status); ?>">
                                        <?php echo ucfirst($form->status); ?>
                                    </span>
                                </div>
                            </div>
                            <div class="form-actions">
                                <div class="form-dropdown">
                                    <button class="button button-small form-dropdown-toggle" type="button">
                                        <i class="dashicons dashicons-ellipsis"></i>
                                    </button>
                                    <ul class="form-dropdown-menu">
                                        <li>
                                            <a href="<?php echo admin_url('admin.php?page=form-plugin-new&form_id=' . $form->id); ?>" class="dropdown-item">
                                                <i class="dashicons dashicons-edit"></i>
                                                <?php _e('Edit', 'form-plugin'); ?>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" class="dropdown-item duplicate-form" data-form-id="<?php echo $form->id; ?>">
                                                <i class="dashicons dashicons-admin-page"></i>
                                                <?php _e('Duplicate', 'form-plugin'); ?>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" class="dropdown-item toggle-status" data-form-id="<?php echo $form->id; ?>" data-status="<?php echo $form->status; ?>">
                                                <i class="dashicons dashicons-<?php echo $form->status === 'active' ? 'hidden' : 'visibility'; ?>"></i>
                                                <?php echo $form->status === 'active' ? __('Deactivate', 'form-plugin') : __('Activate', 'form-plugin'); ?>
                                            </a>
                                        </li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <a href="#" class="dropdown-item text-danger delete-form" data-form-id="<?php echo $form->id; ?>">
                                                <i class="dashicons dashicons-trash"></i>
                                                <?php _e('Delete', 'form-plugin'); ?>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-card-body">
                            <?php if (!empty($form->description)): ?>
                                <p class="form-description"><?php echo esc_html($form->description); ?></p>
                            <?php endif; ?>
                            
                            <div class="form-shortcode">
                                <label><?php _e('Shortcode:', 'form-plugin'); ?></label>
                                <div class="shortcode-input-group">
                                    <input type="text" value='[form_plugin id="<?php echo esc_attr($form->shortcode); ?>"]' readonly class="shortcode-input">
                                    <button type="button" class="button button-small copy-shortcode" data-shortcode='[form_plugin id="<?php echo esc_attr($form->shortcode); ?>"]'>
                                        <i class="dashicons dashicons-admin-page"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-card-footer">
                            <div class="form-meta">
                                <span class="form-date">
                                    <i class="dashicons dashicons-calendar"></i>
                                    <?php echo date_i18n(get_option('date_format'), strtotime($form->created_at)); ?>
                                </span>
                                <a href="<?php echo admin_url('admin.php?page=form-plugin-submissions&form_id=' . $form->id); ?>" class="view-submissions">
                                    <i class="dashicons dashicons-list-view"></i>
                                    <?php _e('View Submissions', 'form-plugin'); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>
</div>

<script>
jQuery(document).ready(function($) {
    // Copy shortcode functionality
    $('.copy-shortcode').on('click', function() {
        var shortcode = $(this).data('shortcode');
        var $btn = $(this);
        var originalText = $btn.html();
        
        navigator.clipboard.writeText(shortcode).then(function() {
            $btn.html('<i class="dashicons dashicons-yes"></i>');
            $btn.addClass('copied');
            
            setTimeout(function() {
                $btn.html(originalText);
                $btn.removeClass('copied');
            }, 2000);
        }).catch(function() {
            // Fallback for older browsers
            var input = $btn.siblings('.shortcode-input')[0];
            input.select();
            document.execCommand('copy');
            alert('<?php _e('Shortcode copied to clipboard!', 'form-plugin'); ?>');
        });
    });
    
    // Duplicate form functionality
    $('.duplicate-form').on('click', function(e) {
        e.preventDefault();
        var formId = $(this).data('form-id');
        var $card = $(this).closest('.form-card');
        
        if (confirm('<?php _e('Are you sure you want to duplicate this form?', 'form-plugin'); ?>')) {
            $card.addClass('loading');
            
            $.ajax({
                url: formPlugin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_duplicate_form',
                    form_id: formId,
                    nonce: formPlugin.nonce
                },
                success: function(response) {
                    $card.removeClass('loading');
                    if (response.success) {
                        location.reload();
                    } else {
                        alert(response.data.message);
                    }
                },
                error: function() {
                    $card.removeClass('loading');
                    alert('<?php _e('Error duplicating form. Please try again.', 'form-plugin'); ?>');
                }
            });
        }
    });
    
    // Delete form functionality
    $('.delete-form').on('click', function(e) {
        e.preventDefault();
        var formId = $(this).data('form-id');
        var $card = $(this).closest('.form-card');
        
        if (confirm('<?php _e('Are you sure you want to delete this form? This action cannot be undone.', 'form-plugin'); ?>')) {
            $card.addClass('loading');
            
            $.ajax({
                url: formPlugin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_delete_form',
                    form_id: formId,
                    nonce: formPlugin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $card.fadeOut(300, function() {
                            $(this).remove();
                        });
                    } else {
                        $card.removeClass('loading');
                        alert(response.data.message);
                    }
                },
                error: function() {
                    $card.removeClass('loading');
                    alert('<?php _e('Error deleting form. Please try again.', 'form-plugin'); ?>');
                }
            });
        }
    });
    
    // Toggle form status
    $('.toggle-status').on('click', function(e) {
        e.preventDefault();
        var formId = $(this).data('form-id');
        var currentStatus = $(this).data('status');
        var newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        var $card = $(this).closest('.form-card');
        var $statusBadge = $card.find('.status-badge');
        
        $card.addClass('loading');
        
        $.ajax({
            url: formPlugin.ajaxUrl,
            type: 'POST',
            data: {
                action: 'form_plugin_update_status',
                form_id: formId,
                status: newStatus,
                nonce: formPlugin.nonce
            },
            success: function(response) {
                $card.removeClass('loading');
                if (response.success) {
                    // Update status badge
                    $statusBadge.removeClass('status-' + currentStatus).addClass('status-' + newStatus);
                    $statusBadge.text(newStatus.charAt(0).toUpperCase() + newStatus.slice(1));
                    
                    // Update toggle button
                    var $toggleBtn = $card.find('.toggle-status');
                    $toggleBtn.data('status', newStatus);
                    $toggleBtn.find('i').removeClass('dashicons-hidden dashicons-visibility')
                        .addClass(newStatus === 'active' ? 'dashicons-hidden' : 'dashicons-visibility');
                    
                    // Update the text content (it's directly in the anchor, not in a span)
                    var newText = newStatus === 'active' ? '<?php _e('Deactivate', 'form-plugin'); ?>' : '<?php _e('Activate', 'form-plugin'); ?>';
                    $toggleBtn.contents().filter(function() {
                        return this.nodeType === 3; // Text nodes
                    }).remove();
                    $toggleBtn.append(newText);
                } else {
                    alert(response.data.message);
                }
            },
            error: function() {
                $card.removeClass('loading');
                alert('<?php _e('Error updating form status. Please try again.', 'form-plugin'); ?>');
            }
        });
    });
});
</script>

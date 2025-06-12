<?php
/**
 * Enhanced Submissions page template
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get forms for filter dropdown
$forms = $database->get_forms();
$current_form_id = isset($_GET['form_id']) ? intval($_GET['form_id']) : 0;
$current_status = isset($_GET['status']) ? sanitize_text_field($_GET['status']) : '';
$current_search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
$current_page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
$per_page = 20;
$offset = ($current_page - 1) * $per_page;

// Search submissions
$search_args = array(
    'form_id' => $current_form_id,
    'status' => $current_status,
    'search' => $current_search,
    'limit' => $per_page,
    'offset' => $offset,
    'orderby' => 'submitted_at',
    'order' => 'DESC'
);

$submissions = $database->search_submissions($search_args);
$total_count = $database->search_submissions(array_merge($search_args, array('count' => true)));
$total_pages = ceil($total_count / $per_page);
?>

<div class="wrap">
    <h1><?php _e('Form Submissions', 'form-plugin'); ?></h1>
    
    <!-- Search and Filter Form -->
    <div class="submissions-search-container">
        <form method="get" id="submissions-filter-form" class="submissions-search-form">
            <input type="hidden" name="page" value="form-plugin-submissions">
            
            <div class="search-row">
                <div class="search-field">
                    <label for="form_id"><?php _e('Form', 'form-plugin'); ?></label>
                    <select name="form_id" id="form_id">
                        <option value=""><?php _e('All Forms', 'form-plugin'); ?></option>
                        <?php foreach ($forms as $form): ?>
                            <option value="<?php echo esc_attr($form->id); ?>" <?php selected($current_form_id, $form->id); ?>>
                                <?php echo esc_html($form->title); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <div class="search-field">
                    <label for="status"><?php _e('Status', 'form-plugin'); ?></label>
                    <select name="status" id="status">
                        <option value=""><?php _e('All Statuses', 'form-plugin'); ?></option>
                        <option value="new" <?php selected($current_status, 'new'); ?>><?php _e('New', 'form-plugin'); ?></option>
                        <option value="read" <?php selected($current_status, 'read'); ?>><?php _e('Read', 'form-plugin'); ?></option>
                        <option value="archived" <?php selected($current_status, 'archived'); ?>><?php _e('Archived', 'form-plugin'); ?></option>
                        <option value="spam" <?php selected($current_status, 'spam'); ?>><?php _e('Spam', 'form-plugin'); ?></option>
                        <option value="trash" <?php selected($current_status, 'trash'); ?>><?php _e('Trash', 'form-plugin'); ?></option>
                    </select>
                </div>
                
                <div class="search-field search-field-wide">
                    <label for="search"><?php _e('Search', 'form-plugin'); ?></label>
                    <input type="text" name="search" id="search" 
                           value="<?php echo esc_attr($current_search); ?>" 
                           placeholder="<?php _e('Search submissions...', 'form-plugin'); ?>">
                </div>
                
                <div class="search-field">
                    <label for="date_from"><?php _e('From Date', 'form-plugin'); ?></label>
                    <input type="date" name="date_from" id="date_from" 
                           value="<?php echo esc_attr(isset($_GET['date_from']) ? $_GET['date_from'] : ''); ?>">
                </div>
                
                <div class="search-field">
                    <label for="date_to"><?php _e('To Date', 'form-plugin'); ?></label>
                    <input type="date" name="date_to" id="date_to" 
                           value="<?php echo esc_attr(isset($_GET['date_to']) ? $_GET['date_to'] : ''); ?>">
                </div>
                
                <div class="search-actions">
                    <button type="submit" class="btn-search">
                        <i class="fas fa-search"></i> <?php _e('Search', 'form-plugin'); ?>
                    </button>
                    <a href="<?php echo admin_url('admin.php?page=form-plugin-submissions'); ?>" class="btn-clear">
                        <i class="fas fa-times"></i> <?php _e('Clear', 'form-plugin'); ?>
                    </a>
                    <button type="button" id="export-submissions" class="btn-export">
                        <i class="fas fa-download"></i> <?php _e('Export CSV', 'form-plugin'); ?>
                    </button>
                </div>
            </div>
        </form>
    </div>
    
    <!-- Bulk Actions -->
    <div class="bulk-actions" id="bulk-actions">
        <div class="bulk-actions-left">
            <select id="bulk-action">
                <option value=""><?php _e('Bulk Actions', 'form-plugin'); ?></option>
                <option value="mark_read"><?php _e('Mark as Read', 'form-plugin'); ?></option>
                <option value="mark_archived"><?php _e('Mark as Archived', 'form-plugin'); ?></option>
                <option value="mark_spam"><?php _e('Mark as Spam', 'form-plugin'); ?></option>
                <option value="mark_trash"><?php _e('Move to Trash', 'form-plugin'); ?></option>
                <option value="delete"><?php _e('Delete Permanently', 'form-plugin'); ?></option>
            </select>
            <button type="button" id="apply-bulk-action">
                <?php _e('Apply', 'form-plugin'); ?>
            </button>
        </div>
        <div class="bulk-actions-right">
            <span class="selected-count" id="selected-count">0 <?php _e('selected', 'form-plugin'); ?></span>
        </div>
    </div>
    
    <!-- Results Summary -->
    <div class="submissions-summary mb-3">
        <p class="text-muted">
            <?php 
            printf(
                _n('Showing %d of %d submission', 'Showing %d of %d submissions', $total_count, 'form-plugin'),
                count($submissions),
                $total_count
            );
            ?>
        </p>
    </div>
    
    <?php if (empty($submissions)): ?>
        <div class="notice notice-info">
            <p><?php _e('No submissions found.', 'form-plugin'); ?></p>
        </div>
    <?php else: ?>
        <!-- Submissions Table -->
        <div class="table-responsive">
            <table class="wp-list-table widefat fixed striped submissions-table">
                <thead>
                    <tr>
                        <td class="manage-column column-cb check-column">
                            <input type="checkbox" id="select-all" class="form-check-input">
                        </td>
                        <th scope="col" class="manage-column column-form">
                            <?php _e('Form', 'form-plugin'); ?>
                        </th>
                        <th scope="col" class="manage-column column-submission">
                            <?php _e('Submission Data', 'form-plugin'); ?>
                        </th>
                        <th scope="col" class="manage-column column-status">
                            <?php _e('Status', 'form-plugin'); ?>
                        </th>
                        <th scope="col" class="manage-column column-date">
                            <?php _e('Submitted', 'form-plugin'); ?>
                        </th>
                        <th scope="col" class="manage-column column-actions">
                            <?php _e('Actions', 'form-plugin'); ?>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($submissions as $submission): ?>
                        <tr data-submission-id="<?php echo esc_attr($submission->id); ?>">
                            <td class="check-column">
                                <input type="checkbox" class="submission-checkbox form-check-input" 
                                       value="<?php echo esc_attr($submission->id); ?>">
                            </td>
                            <td class="form column-form">
                                <strong><?php echo esc_html($submission->form_title); ?></strong>
                            </td>
                            <td class="submission column-submission">
                                <?php
                                $submission_data = json_decode($submission->submission_data, true);
                                if ($submission_data && is_array($submission_data)) {
                                    echo '<div class="submission-preview">';
                                    $count = 0;
                                    foreach ($submission_data as $key => $value) {
                                        if ($count >= 3) {
                                            echo '<span class="more-fields">...</span>';
                                            break;
                                        }
                                        if (!empty($value) && is_array($value) && isset($value['value'])) {
                                            echo '<strong>' . esc_html($value['label']) . ':</strong> ' . esc_html($value['value']) . '<br>';
                                            $count++;
                                        }
                                    }
                                    echo '</div>';
                                }
                                ?>
                            </td>
                            <td class="status column-status">
                                <select class="form-select status-select" data-submission-id="<?php echo esc_attr($submission->id); ?>">
                                    <option value="new" <?php selected($submission->status, 'new'); ?>><?php _e('New', 'form-plugin'); ?></option>
                                    <option value="read" <?php selected($submission->status, 'read'); ?>><?php _e('Read', 'form-plugin'); ?></option>
                                    <option value="archived" <?php selected($submission->status, 'archived'); ?>><?php _e('Archived', 'form-plugin'); ?></option>
                                    <option value="spam" <?php selected($submission->status, 'spam'); ?>><?php _e('Spam', 'form-plugin'); ?></option>
                                    <option value="trash" <?php selected($submission->status, 'trash'); ?>><?php _e('Trash', 'form-plugin'); ?></option>
                                </select>
                            </td>
                            <td class="date column-date">
                                <?php echo date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($submission->submitted_at)); ?>
                            </td>
                            <td class="actions column-actions">
                                <div class="btn-group" role="group">
                                    <button type="button" class="btn btn-outline-primary view-submission" 
                                            data-submission-id="<?php echo esc_attr($submission->id); ?>"
                                            title="<?php _e('View Submission', 'form-plugin'); ?>">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary add-notes-btn" 
                                            data-submission-id="<?php echo esc_attr($submission->id); ?>"
                                            title="<?php _e('Add Notes', 'form-plugin'); ?>">
                                        <i class="fas fa-sticky-note"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-danger delete-submission" 
                                            data-submission-id="<?php echo esc_attr($submission->id); ?>"
                                            title="<?php _e('Delete Submission', 'form-plugin'); ?>">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <?php if ($total_pages > 1): ?>
            <div class="submissions-pagination mt-4">
                <?php
                $pagination_args = array(
                    'base' => add_query_arg('paged', '%#%'),
                    'format' => '',
                    'prev_text' => __('&laquo; Previous'),
                    'next_text' => __('Next &raquo;'),
                    'total' => $total_pages,
                    'current' => $current_page,
                    'type' => 'plain'
                );
                
                // Preserve filter parameters
                $filter_params = array('form_id', 'status', 'search', 'date_from', 'date_to');
                foreach ($filter_params as $param) {
                    if (!empty($_GET[$param])) {
                        $pagination_args['add_args'][$param] = $_GET[$param];
                    }
                }
                
                echo paginate_links($pagination_args);
                ?>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<!-- View Submission Modal -->
<div class="modal fade" id="view-submission-modal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><?php _e('View Submission', 'form-plugin'); ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="submission-details">
                <!-- Submission details will be loaded here -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <?php _e('Close', 'form-plugin'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Add Notes Modal -->
<div class="modal fade" id="add-notes-modal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><?php _e('Add Notes', 'form-plugin'); ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="notes-form">
                    <input type="hidden" id="notes-submission-id" name="submission_id">
                    <div class="mb-3">
                        <label for="submission-notes" class="form-label"><?php _e('Notes', 'form-plugin'); ?></label>
                        <textarea id="submission-notes" name="notes" class="form-control" rows="4" 
                                  placeholder="<?php _e('Add notes about this submission...', 'form-plugin'); ?>"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <?php _e('Cancel', 'form-plugin'); ?>
                </button>
                <button type="button" class="btn btn-primary" id="save-notes">
                    <?php _e('Save Notes', 'form-plugin'); ?>
                </button>
            </div>
        </div>
    </div>
</div>


<script>
jQuery(document).ready(function($) {
    // Initialize submissions management
    FormPluginSubmissions.init();
});
</script>
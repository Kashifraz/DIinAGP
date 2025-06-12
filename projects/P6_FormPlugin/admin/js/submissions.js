/**
 * Enhanced Submissions Management JavaScript
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

(function($) {
    'use strict';
    
    // Submissions Management Object
    window.FormPluginSubmissions = {
        
        /**
         * Initialize submissions management
         */
        init: function() {
            this.bindEvents();
        },
        
        /**
         * Bind event handlers
         */
        bindEvents: function() {
            var self = this;
            
            // Select all checkbox
            $(document).on('change', '#select-all', function() {
                self.toggleAllCheckboxes($(this).is(':checked'));
            });
            
            // Individual checkboxes
            $(document).on('change', '.submission-checkbox', function() {
                self.updateBulkActions();
            });
            
            // Status change
            $(document).on('change', '.status-select', function() {
                self.updateSubmissionStatus($(this));
            });
            
            // View submission
            $(document).on('click', '.view-submission', function() {
                self.viewSubmission($(this).data('submission-id'));
            });
            
            // Add notes
            $(document).on('click', '.add-notes-btn', function() {
                self.showNotesModal($(this).data('submission-id'));
            });
            
            // Save notes
            $(document).on('click', '#save-notes', function() {
                self.saveNotes();
            });
            
            // Delete submission
            $(document).on('click', '.delete-submission', function() {
                self.deleteSubmission($(this).data('submission-id'));
            });
            
            // Bulk actions
            $(document).on('click', '#apply-bulk-action', function() {
                self.applyBulkAction();
            });
            
            // Export submissions
            $(document).on('click', '#export-submissions', function() {
                self.exportSubmissions();
            });
        },
        
        /**
         * Toggle all checkboxes
         */
        toggleAllCheckboxes: function(checked) {
            $('.submission-checkbox').prop('checked', checked);
            this.updateBulkActions();
        },
        
        /**
         * Update bulk actions visibility
         */
        updateBulkActions: function() {
            var checkedCount = $('.submission-checkbox:checked').length;
            var $bulkActions = $('#bulk-actions');
            
            if (checkedCount > 0) {
                $bulkActions.addClass('show');
                $('#selected-count').text(checkedCount + ' selected');
            } else {
                $bulkActions.removeClass('show');
            }
        },
        
        /**
         * Update submission status
         */
        updateSubmissionStatus: function($select) {
            var self = this;
            var submissionId = $select.data('submission-id');
            var newStatus = $select.val();
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_update_submission_status',
                    submission_id: submissionId,
                    status: newStatus,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.showMessage('Status updated successfully', 'success');
                    } else {
                        self.showMessage(response.data || 'Error updating status', 'error');
                        // Revert the select
                        $select.val($select.data('original-value'));
                    }
                },
                error: function() {
                    self.showMessage('Error updating status', 'error');
                    // Revert the select
                    $select.val($select.data('original-value'));
                }
            });
        },
        
        /**
         * View submission details
         */
        viewSubmission: function(submissionId) {
            var self = this;
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_get_submission',
                    submission_id: submissionId,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.displaySubmissionDetails(response.data);
                        $('#view-submission-modal').modal('show');
                    } else {
                        self.showMessage(response.data || 'Error loading submission', 'error');
                    }
                },
                error: function() {
                    self.showMessage('Error loading submission', 'error');
                }
            });
        },
        
        /**
         * Display submission details in modal
         */
        displaySubmissionDetails: function(submission) {
            var html = '<div class="submission-details">';
            html += '<h6>Form: ' + submission.form_title + '</h6>';
            html += '<p><strong>Submitted:</strong> ' + submission.submitted_at + '</p>';
            html += '<p><strong>Status:</strong> ' + submission.status + '</p>';
            
            if (submission.submission_data) {
                html += '<h6>Submission Data:</h6>';
                html += '<div class="submission-data">';
                
                $.each(submission.submission_data, function(key, value) {
                    if (value && typeof value === 'object' && value.label && value.value) {
                        html += '<div class="field-row">';
                        html += '<strong>' + value.label + ':</strong> ';
                        html += '<span>' + value.value + '</span>';
                        html += '</div>';
                    }
                });
                
                html += '</div>';
            }
            
            html += '</div>';
            $('#submission-details').html(html);
        },
        
        /**
         * Show notes modal
         */
        showNotesModal: function(submissionId) {
            $('#notes-submission-id').val(submissionId);
            $('#submission-notes').val('');
            $('#add-notes-modal').modal('show');
        },
        
        /**
         * Save notes
         */
        saveNotes: function() {
            var self = this;
            var submissionId = $('#notes-submission-id').val();
            var notes = $('#submission-notes').val().trim();
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_add_submission_notes',
                    submission_id: submissionId,
                    notes: notes,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.showMessage('Notes saved successfully', 'success');
                        $('#add-notes-modal').modal('hide');
                    } else {
                        self.showMessage(response.data || 'Error saving notes', 'error');
                    }
                },
                error: function() {
                    self.showMessage('Error saving notes', 'error');
                }
            });
        },
        
        /**
         * Delete submission
         */
        deleteSubmission: function(submissionId) {
            var self = this;
            
            if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
                return;
            }
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_delete_submission',
                    submission_id: submissionId,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.showMessage('Submission deleted successfully', 'success');
                        $('tr[data-submission-id="' + submissionId + '"]').fadeOut();
                    } else {
                        self.showMessage(response.data || 'Error deleting submission', 'error');
                    }
                },
                error: function() {
                    self.showMessage('Error deleting submission', 'error');
                }
            });
        },
        
        /**
         * Apply bulk action
         */
        applyBulkAction: function() {
            var self = this;
            var action = $('#bulk-action').val();
            var selectedIds = [];
            
            $('.submission-checkbox:checked').each(function() {
                selectedIds.push($(this).val());
            });
            
            if (!action || selectedIds.length === 0) {
                self.showMessage('Please select an action and at least one submission', 'error');
                return;
            }
            
            if (!confirm('Are you sure you want to apply this action to ' + selectedIds.length + ' submission(s)?')) {
                return;
            }
            
            // Disable the apply button during processing
            $('#apply-bulk-action').prop('disabled', true).text('Processing...');
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_bulk_update_submissions',
                    bulk_action: action,
                    submission_ids: selectedIds,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        var message = response.data && response.data.message ? response.data.message : 'Bulk action completed successfully';
                        self.showMessage(message, 'success');
                        // Reload the page after a short delay
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    } else {
                        var errorMessage = 'Error applying bulk action';
                        if (response.data) {
                            if (typeof response.data === 'string') {
                                errorMessage = response.data;
                            } else if (response.data.message) {
                                errorMessage = response.data.message;
                            }
                        }
                        self.showMessage(errorMessage, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    var errorMessage = 'Error applying bulk action';
                    if (xhr.responseJSON && xhr.responseJSON.data) {
                        if (typeof xhr.responseJSON.data === 'string') {
                            errorMessage = xhr.responseJSON.data;
                        } else if (xhr.responseJSON.data.message) {
                            errorMessage = xhr.responseJSON.data.message;
                        }
                    }
                    self.showMessage(errorMessage, 'error');
                },
                complete: function() {
                    // Re-enable the apply button
                    $('#apply-bulk-action').prop('disabled', false).text('Apply');
                }
            });
        },
        
        /**
         * Export submissions to CSV
         */
        exportSubmissions: function() {
            var self = this;
            var $exportBtn = $('#export-submissions');
            
            // Disable button during export
            $exportBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Exporting...');
            
            // Get current filter values
            var exportData = {
                action: 'form_plugin_export_submissions',
                form_id: $('#form_id').val() || 0,
                status: $('#status').val() || '',
                search: $('#search').val() || '',
                date_from: $('#date_from').val() || '',
                date_to: $('#date_to').val() || '',
                nonce: formPluginAdmin.nonce
            };
            
            // Create a form and submit it to trigger download
            var $form = $('<form>', {
                method: 'POST',
                action: formPluginAdmin.ajaxUrl,
                target: '_blank'
            });
            
            $.each(exportData, function(key, value) {
                $form.append($('<input>', {
                    type: 'hidden',
                    name: key,
                    value: value
                }));
            });
            
            $('body').append($form);
            $form.submit();
            $form.remove();
            
            // Re-enable button after a short delay
            setTimeout(function() {
                $exportBtn.prop('disabled', false).html('<i class="fas fa-download"></i> Export CSV');
            }, 2000);
        },
        
        /**
         * Show message
         */
        showMessage: function(message, type) {
            // Handle object messages properly
            var displayMessage = message;
            if (typeof message === 'object') {
                if (message.message) {
                    displayMessage = message.message;
                } else if (message.data && message.data.message) {
                    displayMessage = message.data.message;
                } else {
                    displayMessage = JSON.stringify(message);
                }
            }
            
            var alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
            var $alert = $('<div class="alert ' + alertClass + ' alert-dismissible fade show" role="alert">' +
                displayMessage +
                '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                '</div>');
            
            // Remove any existing alerts
            $('.alert').remove();
            
            $('.wrap h1').after($alert);
            
            // Auto-hide after 5 seconds
            setTimeout(function() {
                $alert.alert('close');
            }, 5000);
        }
    };
    
})(jQuery);
/**
 * Admin JavaScript for Form Plugin
 *
 * @package Form_Plugin
 * @since 1.0.1
 * @updated 2024-01-15 - Major redesign with custom radio/checkbox rendering system
 */

(function($) {
    'use strict';
    
    // DEBUG: Cache busting test
    console.log('Form Plugin Admin JS loaded - version 1.0.1 with custom radio/checkbox system');
    
    // Form Builder object
    window.FormBuilder = {
        formId: 0,
        formData: null,
        isEdit: false,
        fields: [],
        
        /**
         * Initialize form builder
         */
        init: function(options) {
            this.formId = options.formId || 0;
            this.formData = options.formData || null;
            this.isEdit = options.isEdit || false;
            
            if (this.formData && this.formData.fields) {
                this.fields = this.formData.fields;
                this.renderFields();
            }
            
            this.bindEvents();
        },
        
        /**
         * Bind event handlers
         */
        bindEvents: function() {
            var self = this;
            
            // Check if jQuery UI is loaded
            if (typeof $.fn.draggable === 'undefined') {
                console.warn('jQuery UI not loaded, using fallback for drag and drop');
                this.bindFallbackEvents();
                return;
            }
            
            // Drag and drop for field palette
            $('.field-item').draggable({
                helper: 'clone',
                revert: 'invalid',
                cursor: 'move'
            });
            
            // Drop zone for form canvas
            $('#form-fields-container').droppable({
                accept: '.field-item',
                drop: function(event, ui) {
                    var fieldType = ui.draggable.data('field-type');
                    self.addField(fieldType);
                },
                over: function() {
                    $(this).addClass('drag-over');
                },
                out: function() {
                    $(this).removeClass('drag-over');
                }
            });
            
            // Field configuration
            $(document).on('click', '.configure-field', function() {
                var fieldId = $(this).closest('.form-field').data('field-id');
                self.configureField(fieldId);
            });
            
            // Remove field
            $(document).on('click', '.remove-field', function() {
                var fieldId = $(this).closest('.form-field').data('field-id');
                self.removeField(fieldId);
            });
            
            // Save form
            $('#save-form').on('click', function() {
                self.saveForm();
            });
            
            // Preview form
            
            // Save field configuration
            $('#save-field-config').on('click', function() {
                self.saveFieldConfig();
            });
        },
        
        /**
         * Fallback event handlers when jQuery UI is not available
         */
        bindFallbackEvents: function() {
            var self = this;
            
            // Simple click to add field functionality
            $('.field-item').on('click', function() {
                var fieldType = $(this).data('field-type');
                self.addField(fieldType);
            });
            
            // Add visual feedback
            $('.field-item').on('mouseenter', function() {
                $(this).addClass('field-item-hover');
            }).on('mouseleave', function() {
                $(this).removeClass('field-item-hover');
            });
        },
        
         /**
          * Add new field to form
          */
         addField: function(fieldType) {
             var self = this;
             var fieldId = 'field_' + Date.now();
             var fieldConfig = {
                 id: fieldId,
                 type: fieldType,
                 label: this.getDefaultLabel(fieldType),
                 placeholder: '',
                 required: false,
                 help_text: '',
                 options: []
             };
             
             // Add field to local data immediately for better UX
             this.fields.push(fieldConfig);
             this.renderField(fieldConfig);
             this.updatePreview();
             
             // Show success message
             this.showMessage('Field added successfully', 'success');
             
             // Only try to save to server if we have a valid form ID (not 0)
             if (this.formId && this.formId > 0) {
                 // Send AJAX request to save field (for persistence)
                 $.ajax({
                     url: formPlugin.ajaxUrl,
                     type: 'POST',
                     data: {
                         action: 'form_plugin_add_field',
                         form_id: this.formId,
                         field_type: fieldType,
                         field_config: fieldConfig,
                         nonce: formPlugin.nonce
                     },
                     success: function(response) {
                         if (!response.success) {
                             console.warn('Failed to save field to server:', response.message);
                             // Don't remove the field from UI, just log the warning
                         }
                     },
                     error: function() {
                         console.warn('Error saving field to server');
                         // Don't remove the field from UI, just log the warning
                     }
                 });
             } else {
                 console.log('Form not saved yet, field will be saved when form is saved');
             }
         },
        
        /**
         * Render field in form builder
         */
        renderField: function(field) {
            var fieldHtml = this.getFieldHtml(field);
            var $field = $(fieldHtml);
            
            // Remove empty message if it exists
            $('.empty-form-message').remove();
            
            // Add to container
            $('#form-fields-container').append($field);
            
            // Make field sortable
            this.makeFieldsSortable();
        },
        
        /**
         * Render all fields
         */
        renderFields: function() {
            var self = this;
            $('#form-fields-container').empty();
            
            if (this.fields.length === 0) {
                $('#form-fields-container').html('<div class="empty-form-message"><p>Drag fields from the sidebar to start building your form.</p></div>');
                return;
            }
            
            this.fields.forEach(function(field) {
                self.renderField(field);
            });
            
            this.updatePreview();
        },
        
        /**
         * Get field HTML
         */
        getFieldHtml: function(field) {
            var required = field.required ? ' <span class="required">*</span>' : '';
            var helpText = field.help_text ? '<small class="form-text text-muted">' + field.help_text + '</small>' : '';
            
            return '<div class="form-field" data-field-id="' + field.id + '">' +
                '<div class="field-controls">' +
                    '<button type="button" class="configure-field" title="Configure">' +
                        '<span class="dashicons dashicons-admin-generic"></span>' +
                    '</button>' +
                    '<button type="button" class="remove-field" title="Remove">' +
                        '<span class="dashicons dashicons-trash"></span>' +
                    '</button>' +
                '</div>' +
                '<label>' + field.label + required + '</label>' +
                this.getFieldInput(field) +
                helpText +
            '</div>';
        },
        
        /**
         * Get field input HTML
         */
        getFieldInput: function(field) {
            var placeholder = field.placeholder ? ' placeholder="' + field.placeholder + '"' : '';
            var required = field.required ? ' required' : '';
            
            switch (field.type) {
                case 'text':
                case 'email':
                case 'number':
                case 'date':
                    return '<input type="' + field.type + '" class="form-control"' + placeholder + required + '>';
                    
                case 'textarea':
                    return '<textarea class="form-control"' + placeholder + required + '></textarea>';
                    
                case 'dropdown':
                    var options = '<option value="">Select an option</option>';
                    if (field.options && field.options.length > 0) {
                        field.options.forEach(function(option) {
                            options += '<option value="' + option.value + '">' + option.label + '</option>';
                        });
                    }
                    return '<select class="form-control"' + required + '>' + options + '</select>';
                    
                case 'radio':
                    var radioHtml = '<div class="custom-radio-container' + (field.layout === 'horizontal' ? ' horizontal' : '') + '">';
                    if (field.options && field.options.length > 0) {
                        field.options.forEach(function(option, index) {
                            radioHtml += '<label class="custom-radio-option">' +
                                '<input type="radio" name="' + field.id + '" value="' + option.value + '" class="custom-radio-input"' + required + '>' +
                                '<span class="custom-radio-mark"></span>' +
                                '<span class="custom-radio-label">' + option.label + '</span>' +
                            '</label>';
                        });
                    }
                    radioHtml += '</div>';
                    return radioHtml;
                    
                case 'checkbox':
                    var checkboxHtml = '<div class="custom-checkbox-container' + (field.layout === 'horizontal' ? ' horizontal' : '') + '">';
                    if (field.options && field.options.length > 0) {
                        field.options.forEach(function(option, index) {
                            checkboxHtml += '<label class="custom-checkbox-option">' +
                                '<input type="checkbox" name="' + field.id + '[]" value="' + option.value + '" class="custom-checkbox-input">' +
                                '<span class="custom-checkbox-mark"></span>' +
                                '<span class="custom-checkbox-label">' + option.label + '</span>' +
                            '</label>';
                        });
                    }
                    checkboxHtml += '</div>';
                    return checkboxHtml;
                    
                default:
                    return '<input type="text" class="form-control"' + placeholder + required + '>';
            }
        },
        
        /**
         * Get default label for field type
         */
        getDefaultLabel: function(fieldType) {
            var labels = {
                'text': 'Text Field',
                'email': 'Email Address',
                'textarea': 'Message',
                'number': 'Number',
                'date': 'Date',
                'dropdown': 'Select Option',
                'radio': 'Choose Option',
                'checkbox': 'Select Options'
            };
            
            return labels[fieldType] || 'Field';
        },
        
        /**
         * Make fields sortable
         */
        makeFieldsSortable: function() {
            $('#form-fields-container').sortable({
                items: '.form-field',
                placeholder: 'sortable-placeholder',
                update: function() {
                    // Update field order
                    var newOrder = [];
                    $('#form-fields-container .form-field').each(function() {
                        var fieldId = $(this).data('field-id');
                        var field = FormBuilder.getFieldById(fieldId);
                        if (field) {
                            newOrder.push(field);
                        }
                    });
                    FormBuilder.fields = newOrder;
                    FormBuilder.updatePreview();
                }
            });
        },
        
        /**
         * Get field by ID
         */
        getFieldById: function(fieldId) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].id === fieldId) {
                    return this.fields[i];
                }
            }
            return null;
        },
        
        /**
         * Configure field
         */
        configureField: function(fieldId) {
            var field = this.getFieldById(fieldId);
            if (!field) return;
            
            var configHtml = this.getFieldConfigHtml(field);
            $('#field-config-content').html(configHtml);
            
            // Store current field ID
            $('#field-config-modal').data('field-id', fieldId);
            
            // Show modal with fallback
            if (typeof $.fn.modal !== 'undefined') {
                $('#field-config-modal').modal('show');
            } else {
                // Fallback: show as regular div if Bootstrap modal is not available
                $('#field-config-modal').addClass('show-fallback').show();
                console.warn('Bootstrap modal not available, showing as regular div');
            }
        },
        
        /**
         * Get field configuration HTML
         */
        getFieldConfigHtml: function(field) {
            var self = this;
            var configHtml = '';
            
            $.ajax({
                url: formPlugin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_get_field_config_form',
                    field_type: field.type,
                    field_config: field,
                    nonce: formPlugin.nonce
                },
                async: false,
                success: function(response) {
                    if (response.success) {
                        configHtml = response.data;
                    } else {
                        configHtml = '<div class="alert alert-danger">Failed to load field configuration form.</div>';
                    }
                },
                error: function() {
                    configHtml = '<div class="alert alert-danger">Error loading field configuration form.</div>';
                }
            });
            
            return configHtml;
        },
        
        /**
         * Save field configuration
         */
        saveFieldConfig: function() {
            var self = this;
            var fieldId = $('#field-config-modal').data('field-id');
            var field = this.getFieldById(fieldId);
            
            if (!field) return;
            
            // Collect field configuration from form
            var fieldConfig = {
                id: field.id,
                type: field.type,
                label: $('#field-label').val(),
                placeholder: $('#field-placeholder').val(),
                required: $('#field-required').is(':checked'),
                help_text: $('#field-help-text').val(),
                css_class: $('#field-css-class').val() || ''
            };
            
            // Add type-specific configuration
            switch (field.type) {
                case 'text':
                case 'email':
                    fieldConfig.max_length = $('#field-max-length').val() || '';
                    fieldConfig.min_length = $('#field-min-length').val() || '';
                    fieldConfig.pattern = $('#field-pattern').val() || '';
                    break;
                    
                case 'textarea':
                    fieldConfig.rows = $('#field-rows').val() || 4;
                    fieldConfig.max_length = $('#field-max-length').val() || '';
                    fieldConfig.min_length = $('#field-min-length').val() || '';
                    break;
                    
                case 'number':
                    fieldConfig.min = $('#field-min').val() || '';
                    fieldConfig.max = $('#field-max').val() || '';
                    fieldConfig.step = $('#field-step').val() || '1';
                    break;
                    
                case 'date':
                    fieldConfig.min_date = $('#field-min-date').val() || '';
                    fieldConfig.max_date = $('#field-max-date').val() || '';
                    break;
                    
                case 'dropdown':
                    fieldConfig.options = [];
                    var optionsText = $('#field-options').val().trim();
                    if (optionsText) {
                        var optionLines = optionsText.split('\n');
                        optionLines.forEach(function(line) {
                            line = line.trim();
                            if (line) {
                                fieldConfig.options.push({label: line, value: line});
                            }
                        });
                    }
                    fieldConfig.multiple = $('#field-multiple').is(':checked');
                    fieldConfig.placeholder_text = $('#field-placeholder-text').val() || '';
                    break;
                    
                case 'radio':
                case 'checkbox':
                    fieldConfig.options = [];
                    var optionsText = $('#field-options').val().trim();
                    if (optionsText) {
                        var optionLines = optionsText.split('\n');
                        optionLines.forEach(function(line) {
                            line = line.trim();
                            if (line) {
                                fieldConfig.options.push({label: line, value: line});
                            }
                        });
                    }
                    fieldConfig.layout = $('input[name="layout"]:checked').val() || 'vertical';
                    
                    if (field.type === 'checkbox') {
                        fieldConfig.min_selections = $('#field-min-selections').val() || 0;
                        fieldConfig.max_selections = $('#field-max-selections').val() || 0;
                    }
                    break;
            }
            
             // Send AJAX request to update field
             $.ajax({
                 url: formPlugin.ajaxUrl,
                 type: 'POST',
                 data: {
                     action: 'form_plugin_update_field',
                     form_id: this.formId,
                     field_id: fieldId,
                     field_config: fieldConfig,
                     nonce: formPlugin.nonce
                 },
                success: function(response) {
                    if (response.success) {
                        // Update field in local data
                        self.updateField(fieldId, fieldConfig);
                        
                        // Show success message
                        self.showMessage('Field updated successfully', 'success');
                        
                        // Close modal
                        if (typeof $.fn.modal !== 'undefined') {
                            $('#field-config-modal').modal('hide');
                        } else {
                            $('#field-config-modal').removeClass('show-fallback').hide();
                        }
                    } else {
                        self.showMessage(response.message || 'Failed to update field', 'error');
                    }
                },
                error: function() {
                    self.showMessage('Error updating field', 'error');
                }
            });
        },
        
        /**
         * Remove field
         */
        removeField: function(fieldId) {
            var self = this;
            
             // Send AJAX request to remove field
             $.ajax({
                 url: formPlugin.ajaxUrl,
                 type: 'POST',
                 data: {
                     action: 'form_plugin_remove_field',
                     form_id: this.formId,
                     field_id: fieldId,
                     nonce: formPlugin.nonce
                 },
                success: function(response) {
                    if (response.success) {
                        // Remove field from local data
                        self.fields = self.fields.filter(function(field) {
                            return field.id !== fieldId;
                        });
                        
                        $('[data-field-id="' + fieldId + '"]').remove();
                        self.updatePreview();
                        
                        // Show success message
                        self.showMessage('Field removed successfully', 'success');
                    } else {
                        self.showMessage(response.message || 'Failed to remove field', 'error');
                    }
                },
                error: function() {
                    self.showMessage('Error removing field', 'error');
                }
            });
        },
        
        /**
         * Update form preview
         */
        updatePreview: function() {
            // Get current template info
            var templateClass = 'template-classic';
            var customStyles = '';
            
            if (typeof TemplateManager !== 'undefined') {
                templateClass = 'template-' + (TemplateManager.currentTemplate || 'classic');
                
                if (TemplateManager.currentCustomization && typeof TemplateManager.currentCustomization === 'object') {
                    var styles = [];
                    if (TemplateManager.currentCustomization.background_color) {
                        styles.push('background-color: ' + TemplateManager.currentCustomization.background_color + ' !important');
                    }
                    if (TemplateManager.currentCustomization.text_color) {
                        styles.push('color: ' + TemplateManager.currentCustomization.text_color + ' !important');
                    }
                    if (TemplateManager.currentCustomization.border_color) {
                        styles.push('border-color: ' + TemplateManager.currentCustomization.border_color + ' !important');
                    }
                    if (styles.length > 0) {
                        customStyles = ' style="' + styles.join('; ') + '"';
                    }
                }
            }
            
            var previewHtml = '<div class="form-plugin-container">';
            
            // Add form title if available
            if (this.formData && this.formData.title) {
                previewHtml += '<h3 class="form-plugin-title">' + this.formData.title + '</h3>';
            }
            
            // Add form description if available
            if (this.formData && this.formData.description) {
                previewHtml += '<div class="form-plugin-description">' + this.formData.description + '</div>';
            }
            
            previewHtml += '<form class="form-plugin-form ' + templateClass + '"' + customStyles + '>';
            
            this.fields.forEach(function(field) {
                var required = field.required ? ' <span class="required">*</span>' : '';
                var helpText = field.help_text ? '<small class="form-text text-muted">' + field.help_text + '</small>' : '';
                
                previewHtml += '<div class="form-group">' +
                    '<label class="form-label">' + field.label + required + '</label>' +
                    FormBuilder.getFieldInput(field) +
                    helpText +
                '</div>';
            });
            
            // Add math captcha section
            var captchaNum1 = Math.floor(Math.random() * 10) + 1;
            var captchaNum2 = Math.floor(Math.random() * 10) + 1;
            var captchaAnswer = captchaNum1 + captchaNum2;
            
            previewHtml += '<div class="form-group form-plugin-captcha">';
            previewHtml += '<label for="captcha_input" class="form-label">';
            previewHtml += 'What is ' + captchaNum1 + ' + ' + captchaNum2 + '?';
            previewHtml += ' <span class="required">*</span>';
            previewHtml += '</label>';
            previewHtml += '<input type="number" id="captcha_input" name="captcha_input" class="form-control" required>';
            previewHtml += '<button type="button" class="btn btn-link btn-sm form-plugin-refresh-captcha">';
            previewHtml += 'Refresh';
            previewHtml += '</button>';
            previewHtml += '</div>';
            
            // Add submit button with custom color
            var buttonStyle = '';
            if (typeof TemplateManager !== 'undefined' && TemplateManager.currentCustomization && TemplateManager.currentCustomization.button_color) {
                buttonStyle = ' style="background-color: ' + TemplateManager.currentCustomization.button_color + ' !important; border-color: ' + TemplateManager.currentCustomization.button_color + ' !important;"';
            }
            
            previewHtml += '<div class="form-group form-plugin-submit">' +
                '<button type="button" class="btn btn-primary form-plugin-submit-btn" disabled' + buttonStyle + '>Submit Form</button>' +
            '</div>';
            
            previewHtml += '</form>';
            previewHtml += '</div>';
            
            $('#form-preview').html(previewHtml);
        },
        
         /**
          * Save form
          */
         saveForm: function() {
             var formData = {
                 title: $('#form-title').val(),
                 description: $('#form-description').val(),
                 status: $('#form-status').val(),
                 fields: this.fields,
                 settings: {}
             };
             
             if (!formData.title) {
                 this.showMessage('Please enter a form title.', 'error');
                 return;
             }
             
             // Show loading message
             this.showMessage('Saving form...', 'info');
             
             // Get current template data
             var templateData = {
                 template_id: TemplateManager.currentTemplate,
                 template_customization: TemplateManager.currentCustomization
             };
             
             $.ajax({
                 url: formPlugin.ajaxUrl,
                 type: 'POST',
                 data: {
                     action: 'form_plugin_save_form',
                     form_id: this.formId,
                     title: formData.title,
                     description: formData.description,
                     status: formData.status,
                     form_data: JSON.stringify(formData),
                     settings: JSON.stringify(formData.settings),
                     template_id: templateData.template_id,
                     template_customization: templateData.template_customization,
                     nonce: formPlugin.nonce
                 },
                 success: function(response) {
                     if (response.success) {
                         // Update form ID if this was a new form
                         if (response.data.form_id) {
                             FormBuilder.formId = response.data.form_id;
                         }
                         
                         FormBuilder.showMessage('Form saved successfully!', 'success');
                         
                         if (!FormBuilder.isEdit && response.data.form_id) {
                             // Update URL to include form ID
                             var newUrl = window.location.href.split('?')[0] + '?page=form-plugin-new&form_id=' + response.data.form_id;
                             window.history.replaceState({}, '', newUrl);
                         }
                     } else {
                         FormBuilder.showMessage('Error saving form: ' + (response.data.message || 'Unknown error'), 'error');
                     }
                 },
                 error: function() {
                     FormBuilder.showMessage('Error saving form. Please try again.', 'error');
                 }
             });
        },
        
        /**
         * Update field in local data
         */
         updateField: function(fieldId, fieldConfig) {
             for (var i = 0; i < this.fields.length; i++) {
                 if (this.fields[i].id === fieldId) {
                     this.fields[i] = fieldConfig;
                     break;
                 }
             }
             
             // Re-render the field
             $('[data-field-id="' + fieldId + '"]').replaceWith(this.getFieldHtml(fieldConfig));
             this.updatePreview();
         },
         
         /**
          * Show message to user
          */
         showMessage: function(message, type) {
             type = type || 'info';
             
             // Remove existing messages
             $('.form-plugin-message').remove();
             
             // Create message element
             var messageClass = 'notice notice-' + (type === 'error' ? 'error' : (type === 'info' ? 'info' : 'success'));
             var messageHtml = '<div class="form-plugin-message ' + messageClass + ' is-dismissible">' +
                 '<p>' + message + '</p>' +
                 '<button type="button" class="notice-dismiss">' +
                     '<span class="screen-reader-text">Dismiss this notice.</span>' +
                 '</button>' +
             '</div>';
             
             // Add to page
             $('.wrap h1').after(messageHtml);
             
             // Auto-dismiss after 5 seconds (except for info messages which dismiss after 3 seconds)
             var dismissTime = type === 'info' ? 3000 : 5000;
             setTimeout(function() {
                 $('.form-plugin-message').fadeOut();
             }, dismissTime);
             
             // Handle dismiss button
             $('.form-plugin-message .notice-dismiss').on('click', function() {
                 $(this).closest('.form-plugin-message').fadeOut();
             });
         }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        // Close modal functionality (fallback)
        $(document).on('click', '.btn-close, [data-bs-dismiss="modal"]', function() {
            if (typeof $.fn.modal !== 'undefined') {
                $('#field-config-modal').modal('hide');
            } else {
                $('#field-config-modal').removeClass('show-fallback').hide();
            }
        });
        
        // Copy shortcode functionality
        $('.copy-shortcode').on('click', function() {
            var shortcode = $('#form-shortcode').val();
            if (shortcode) {
                navigator.clipboard.writeText(shortcode).then(function() {
                    // Show success feedback
                    var $btn = $('.copy-shortcode');
                    var originalText = $btn.html();
                    $btn.html('<i class="dashicons dashicons-yes"></i> Copied!');
                    $btn.addClass('copied');
                    
                    setTimeout(function() {
                        $btn.html(originalText);
                        $btn.removeClass('copied');
                    }, 2000);
                }).catch(function() {
                    // Fallback for older browsers
                    var shortcodeInput = document.getElementById('form-shortcode');
                    shortcodeInput.select();
                    document.execCommand('copy');
                    alert('Shortcode copied to clipboard!');
                });
            }
        });
    });
    
    // Dropdown toggle functionality
    $('.form-dropdown-toggle').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $dropdown = $(this).siblings('.form-dropdown-menu');
        var $allDropdowns = $('.form-dropdown-menu');
        
        // Close other dropdowns
        $allDropdowns.not($dropdown).removeClass('show');
        
        // Toggle current dropdown
        $dropdown.toggleClass('show');
    });
    
    // Close dropdowns when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.form-dropdown').length) {
            $('.form-dropdown-menu').removeClass('show');
        }
    });
    
    // Template Management - Simplified and Robust
    var TemplateManager = {
        currentTemplate: 'classic',
        currentCustomization: {},
        
        /**
         * Initialize template manager
         */
        init: function() {
            this.loadTemplates();
            this.bindEvents();
            this.loadCurrentTemplate();
        },
        
        /**
         * Load available templates
         */
        loadTemplates: function() {
            var self = this;
            
            if (typeof formPluginAdmin === 'undefined') {
                return;
            }
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_get_templates',
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.renderTemplates(response.data);
                    }
                },
                error: function(xhr, status, error) {
                    // Silent fail
                }
            });
        },
        
        /**
         * Render template cards
         */
        renderTemplates: function(templates) {
            var html = '';
            $.each(templates, function(id, template) {
                html += '<div class="template-card" data-template="' + id + '">';
                html += '<div class="template-preview ' + id + '"></div>';
                html += '<div class="template-name">' + template.name + '</div>';
                html += '<div class="template-description">' + template.description + '</div>';
                html += '</div>';
            });
            
            $('#template-grid').html(html);
        },
        
        /**
         * Bind template events
         */
        bindEvents: function() {
            var self = this;
            
            // Template selection
            $(document).on('click', '.template-card', function() {
                $('.template-card').removeClass('selected');
                $(this).addClass('selected');
                self.currentTemplate = $(this).data('template');
                
                // Update preview immediately when template changes
                self.updateFormPreview();
                // Also trigger FormBuilder preview update
                if (typeof FormBuilder !== 'undefined' && FormBuilder.updatePreview) {
                    FormBuilder.updatePreview();
                }
            });
            
            // Color picker changes
            $(document).on('change', '.color-picker', function() {
                var pickerId = $(this).attr('id');
                var colorValue = $(this).val();

                // Map picker IDs to proper field names
                var colorFieldMap = {
                    'template-bg-color': 'background_color',
                    'template-text-color': 'text_color', 
                    'template-button-color': 'button_color',
                    'template-border-color': 'border_color'
                };
                
                var colorType = colorFieldMap[pickerId];
                
                if (!colorType) {
                    return;
                }

                // Force currentCustomization to be an object, not an array
                if (Array.isArray(self.currentCustomization)) {
                    self.currentCustomization = {};
                }

                if (!self.currentCustomization || typeof self.currentCustomization !== 'object') {
                    self.currentCustomization = {};
                }

                self.currentCustomization[colorType] = colorValue;
                
                // Update preview immediately when color changes
                setTimeout(function() {
                    self.updateFormPreview();
                }, 50);
            });
            
            // Apply template
            $(document).on('click', '#apply-template', function() {
                self.applyTemplate();
            });
        },
        
        /**
         * Load current template for edit mode
         */
        loadCurrentTemplate: function() {
            var formId = FormBuilder.formId;
            
            if (formId === 0) {
                return;
            }
            
            var self = this;
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_get_template',
                    form_id: formId,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.currentTemplate = response.data.template_id || 'classic';
                        
                        // Force customization to be an object, not an array
                        var customization = response.data.customization || {};
                        if (Array.isArray(customization)) {
                            customization = {};
                        }
                        self.currentCustomization = customization;
                        
                        self.updateUI();
                        // Update preview after loading template data
                        setTimeout(function() {
                            self.updateFormPreview();
                            // Also trigger FormBuilder preview update
                            if (typeof FormBuilder !== 'undefined' && FormBuilder.updatePreview) {
                                FormBuilder.updatePreview();
                            }
                        }, 100);
                    }
                },
                error: function(xhr, status, error) {
                    // Silent fail
                }
            });
        },
        
        /**
         * Update UI with current template
         */
        updateUI: function() {
            // Select current template
            $('.template-card').removeClass('selected');
            $('.template-card[data-template="' + this.currentTemplate + '"]').addClass('selected');
            
            // Update color pickers with current customization
            if (this.currentCustomization && typeof this.currentCustomization === 'object') {
                // Set default colors if not specified
                var defaultColors = {
                    background_color: '#ffffff',
                    text_color: '#333333',
                    button_color: '#0073aa',
                    border_color: '#ddd'
                };
                
                // Update each color picker with correct field mapping
                var self = this;
                var fieldMapping = {
                    'background_color': '#template-bg-color',
                    'text_color': '#template-text-color',
                    'button_color': '#template-button-color',
                    'border_color': '#template-border-color'
                };
                
                Object.keys(fieldMapping).forEach(function(colorType) {
                    var colorValue = self.currentCustomization[colorType] || defaultColors[colorType];
                    var pickerId = fieldMapping[colorType];
                    $(pickerId).val(colorValue);
                });
            }
        },
        
        /**
         * Apply template - Simplified approach
         */
        applyTemplate: function() {
            var formId = FormBuilder.formId;
            
            if (formId === 0) {
                // Try to get form ID from URL
                var urlParams = new URLSearchParams(window.location.search);
                var urlFormId = urlParams.get('form_id');
                if (urlFormId) {
                    formId = parseInt(urlFormId);
                } else {
                    alert('Please save the form first before applying a template.');
                    return;
                }
            }
            
            var self = this;
            var $button = $('#apply-template');
            
            // Ensure customization is an object before sending
            var customizationToSend = this.currentCustomization || {};
            if (Array.isArray(customizationToSend)) {
                customizationToSend = {};
            }
            
            $button.prop('disabled', true).text('Applying...');
            
            $.ajax({
                url: formPluginAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'form_plugin_update_template',
                    form_id: formId,
                    template_id: this.currentTemplate,
                    customization: customizationToSend,
                    nonce: formPluginAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        self.showMessage('Template applied successfully!', 'success');
                        // Update the form preview
                        self.updateFormPreview();
                    } else {
                        var errorMsg = 'Unknown error';
                        if (response.data && response.data.message) {
                            errorMsg = response.data.message;
                        }
                        self.showMessage('Failed to apply template: ' + errorMsg, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    self.showMessage('Failed to apply template: ' + error, 'error');
                },
                complete: function() {
                    $button.prop('disabled', false).html('<i class="dashicons dashicons-yes"></i> Apply Template');
                }
            });
        },
        
        /**
         * Update form preview with current template
         */
        updateFormPreview: function() {
            // Force FormBuilder to regenerate the preview with current template
            if (typeof FormBuilder !== 'undefined' && FormBuilder.updatePreview) {
                FormBuilder.updatePreview();
            }
            
            // Wait a moment for FormBuilder to complete, then apply custom styles
            setTimeout(function() {
                var $previewForm = $('#form-preview .form-plugin-form, #form-preview form');
                
                if ($previewForm.length > 0) {
                    // Remove existing template classes
                    $previewForm.removeClass('template-classic template-modern template-minimal template-professional');
                    
                    // Add current template class
                    $previewForm.addClass('template-' + this.currentTemplate);
                    
                    // Apply custom colors with !important to override CSS
                    if (this.currentCustomization && typeof this.currentCustomization === 'object') {
                        var styles = [];
                        
                        if (this.currentCustomization.background_color) {
                            styles.push('background-color: ' + this.currentCustomization.background_color + ' !important');
                        }
                        if (this.currentCustomization.text_color) {
                            styles.push('color: ' + this.currentCustomization.text_color + ' !important');
                        }
                        if (this.currentCustomization.border_color) {
                            styles.push('border-color: ' + this.currentCustomization.border_color + ' !important');
                        }
                        
                        if (styles.length > 0) {
                            $previewForm.attr('style', styles.join('; '));
                        }
                        
                        // Update button color with !important
                        if (this.currentCustomization.button_color) {
                            $previewForm.find('button[type="submit"]').css({
                                'background-color': this.currentCustomization.button_color + ' !important',
                                'border-color': this.currentCustomization.button_color + ' !important'
                            });
                        }
                    }
                }
            }.bind(this), 100);
        },
        
        /**
         * Show message
         */
        showMessage: function(message, type) {
            var alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
            var $alert = $('<div class="alert ' + alertClass + ' alert-dismissible fade show" role="alert">' +
                message +
                '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                '</div>');
            
            $('.template-selection-section').after($alert);
            
            setTimeout(function() {
                $alert.alert('close');
            }, 3000);
        }
    };
    
    // Initialize template manager when document is ready
    $(document).ready(function() {
        // Wait a bit for FormBuilder to be initialized first
        setTimeout(function() {
            TemplateManager.init();
        }, 100);
    });
    
})(jQuery);

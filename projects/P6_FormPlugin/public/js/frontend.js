/**
 * Form Plugin Frontend JavaScript
 *
 * @package Form_Plugin
 * @since 1.0.0
 */

(function($) {
    'use strict';
    
    // Form Plugin Frontend Object
    window.FormPluginFrontend = {
        
        /**
         * Initialize frontend functionality
         */
        init: function() {
            this.bindEvents();
        },
        
        /**
         * Bind event handlers
         */
        bindEvents: function() {
            var self = this;
            
            // Form submission
            $(document).on('submit', '.form-plugin-form', function(e) {
                e.preventDefault();
                self.handleFormSubmission($(this));
            });
            
            // Captcha refresh
            $(document).on('click', '.form-plugin-refresh-captcha', function(e) {
                e.preventDefault();
                self.refreshCaptcha($(this));
            });
            
        // Real-time validation
        $(document).on('blur', '.form-control', function() {
            self.validateField($(this));
        });
        },
        
        /**
         * Handle form submission
         */
        handleFormSubmission: function($form) {
            var $submitBtn = $form.find('.form-plugin-submit-btn');
            var $messages = $form.find('.form-plugin-messages');
            
            // Clear previous messages
            $messages.hide().removeClass('success error info');
            
            // Validate form
            if (!this.validateForm($form)) {
                return;
            }
            
            // Show loading state
            $submitBtn.prop('disabled', true);
            $form.addClass('form-plugin-loading');
            
            // Prepare form data - exclude WordPress referer field
            var formData = $form.serializeArray();
            var cleanData = {};
            
            // Build clean data object, excluding _wp_http_referer
            $.each(formData, function(i, field) {
                if (field.name !== '_wp_http_referer') {
                    cleanData[field.name] = field.value;
                }
            });
            
            // Add action
            cleanData.action = 'form_plugin_submit';
            
            // Debug: Log form data
            console.log('Form data being sent:', cleanData);
            
            // Submit form via AJAX
            $.ajax({
                url: formPluginFrontend.ajaxUrl,
                type: 'POST',
                data: cleanData,
                success: function(response) {
                    if (response.success) {
                        FormPluginFrontend.showMessage($messages, response.data.message, 'success');
                        $form[0].reset();
                        FormPluginFrontend.refreshCaptcha($form.find('.form-plugin-refresh-captcha'));
                    } else {
                        FormPluginFrontend.showMessage($messages, response.data.message, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    FormPluginFrontend.showMessage($messages, 'There was an error submitting the form.', 'error');
                },
                complete: function() {
                    $submitBtn.prop('disabled', false);
                    $form.removeClass('form-plugin-loading');
                }
            });
        },
        
        /**
         * Validate entire form
         */
        validateForm: function($form) {
            var isValid = true;
            var $fields = $form.find('input[required], select[required], textarea[required]');
            
            $fields.each(function() {
                if (!FormPluginFrontend.validateField($(this))) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        /**
         * Validate individual field
         */
        validateField: function($field) {
            var value = $field.val().trim();
            var fieldType = $field.attr('type') || $field.prop('tagName').toLowerCase();
            var isRequired = $field.prop('required');
            var isValid = true;
            var errorMessage = '';
            
            // Clear previous error
            this.clearFieldError($field);
            
            // Required field validation
            if (isRequired && !value) {
                errorMessage = 'This field is required.';
                isValid = false;
            }
            
            // Type-specific validation
            if (value && fieldType === 'email') {
                var emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
                if (!emailPattern.test(value)) {
                    errorMessage = 'Please enter a valid email address.';
                    isValid = false;
                }
            }
            
            // Show error if invalid
            if (!isValid) {
                this.showFieldError($field, errorMessage);
            }
            
            return isValid;
        },
        
        /**
         * Show field error
         */
        showFieldError: function($field, message) {
            $field.addClass('is-invalid');
            
            var $error = $('<div class="invalid-feedback">' + message + '</div>');
            $field.after($error);
        },
        
        /**
         * Clear field error
         */
        clearFieldError: function($field) {
            $field.removeClass('is-invalid');
            $field.siblings('.invalid-feedback').remove();
        },
        
        /**
         * Show message
         */
        showMessage: function($container, message, type) {
            $container
                .removeClass('success error info')
                .addClass(type)
                .html(message)
                .fadeIn();
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(function() {
                    $container.fadeOut();
                }, 5000);
            }
        },
        
        /**
         * Refresh math captcha
         */
        refreshCaptcha: function($button) {
            var $form = $button.closest('.form-plugin-form');
            var $label = $form.find('.form-plugin-captcha .form-label');
            var $input = $form.find('#captcha_input');
            var $answer = $form.find('input[name="captcha_answer"]');
            
            // Show loading state
            $button.prop('disabled', true).text('Loading...');
            
            // Generate new captcha on client side
            var num1 = Math.floor(Math.random() * 10) + 1;
            var num2 = Math.floor(Math.random() * 10) + 1;
            var answer = num1 + num2;
            
            // Update the form
            $label.text('What is ' + num1 + ' + ' + num2 + '? *');
            $answer.val(answer);
            $input.val('').focus();
            
            // Reset button
            $button.prop('disabled', false).text('Refresh');
        },
        
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        FormPluginFrontend.init();
    });
    
})(jQuery);
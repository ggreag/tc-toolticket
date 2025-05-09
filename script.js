document.addEventListener('DOMContentLoaded', function() {
    // Ticket types by category
    const ticketCategories = {
        "TICKET": {
            "Soporte conexion WiFi Deco": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nSe contacta solicitando asistencia para conectar decodificador a red WiFi, se brinda soporte y se soluciona en linea",
            "Billing Inquiry": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nCustomer has questions about billing on invoice #[INVOICE_NUMBER].\n\nIssues identified:\n- [DESCRIBE ISSUE]\n\nResolution provided:\n- [EXPLANATION/RESOLUTION]\n\nCustomer [was/was not] satisfied with resolution."
        },
        "SOCKET": {
            "Connection Issue": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nCustomer reports connection issues with socket service.\n\nDiagnosed problem:\n- [DESCRIBE ISSUE]\n\nResolution:\n- [STEPS TAKEN]\n\nConnection restored: [YES/NO]",
            "Timeout Error": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nCustomer experiencing timeout errors with socket connections.\n\nTimeout threshold: [TIME]\n\nResolution:\n- [STEPS TAKEN]"
        },
        "MORE": {
            "Additional Services": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nCustomer requested additional services.\n\nServices requested:\n- [LIST SERVICES]\n\nProvided information on:\n- Pricing\n- Implementation timeline\n- Requirements",
            "Feature Inquiry": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nCustomer inquired about additional features.\n\nFeatures discussed:\n- [FEATURE LIST]\n\nFollow up required: [YES/NO]"
        },
        "SERIOUS TICKETS": {
            "Security Breach": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nPOTENTIAL SECURITY BREACH REPORTED\n\nDetails:\n- [DESCRIBE INCIDENT]\n\nImmediate actions taken:\n1. [ACTION 1]\n2. [ACTION 2]\n3. [ACTION 3]\n\nEscalated to: [SECURITY TEAM]",
            "System Outage": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nSYSTEM OUTAGE REPORTED\n\nAffected systems:\n- [SYSTEM LIST]\n\nImpact:\n- [DESCRIBE IMPACT]\n\nCurrent status: [INVESTIGATING/REPAIRING/RESOLVED]"
        },
        "R.A SI": {
            "Default R.A SI Ticket": "Client ID: [CLIENT_ID]\nCaller: [CALLER_NAME]\n\nR.A SI Ticket Content\n\nDetails:\n- [ENTER DETAILS]\n\nResolution:\n- [ENTER RESOLUTION]"
        }
    };

    // DOM elements
    const clientIdInput = document.getElementById('client-id');
    const callerNameInput = document.getElementById('caller-name');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const ticketContent = document.getElementById('ticket-content');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusMessage = document.getElementById('status-message');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

    // Handle category selection
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other checkboxes
                categoryCheckboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
                
                // Enable and populate ticket type dropdown
                ticketTypeSelect.disabled = false;
                const categoryId = this.id.replace('-checkbox', '');
                const categoryMap = {
                    'ticket': 'TICKET',
                    'socket': 'SOCKET',
                    'more': 'MORE',
                    'serious': 'SERIOUS TICKETS',
                    'ra-si': 'R.A SI'
                };
                populateTicketTypes(categoryMap[categoryId] || categoryId);
            } else {
                // If unchecking the current box, disable dropdown
                ticketTypeSelect.disabled = true;
                ticketTypeSelect.innerHTML = '<option value="">-- Selecciona un tipo de ticket primero --</option>';
                ticketContent.value = '';
            }
        });
    });

    // Populate dropdown with ticket types for selected category
    function populateTicketTypes(category) {
        // Clear existing options
        ticketTypeSelect.innerHTML = '<option value="">-- Selecciona un tipo de ticket primero ---</option>';
        
        // Add all ticket types for the selected category
        if (ticketCategories[category]) {
            Object.keys(ticketCategories[category]).sort().forEach(type => {
                const option = new Option(type, type);
                ticketTypeSelect.add(option);
            });
        }
    }

    // When ticket type is selected, populate the template
    ticketTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        const selectedCheckbox = document.querySelector('.category-checkbox:checked');
        const categoryMap = {
            'ticket': 'TICKET',
            'socket': 'SOCKET',
            'more': 'MORE',
            'serious': 'SERIOUS TICKETS',
            'ra-si': 'R.A SI'
        };
        const selectedCategory = selectedCheckbox ? categoryMap[selectedCheckbox.id.replace('-checkbox', '')] : '';
        
        if (selectedType && selectedCategory && ticketCategories[selectedCategory]?.[selectedType]) {
            let template = ticketCategories[selectedCategory][selectedType];
            
            // Replace placeholders with actual values (or leave placeholders if empty)
            template = template.replace('[CLIENT_ID]', clientIdInput.value || '[CLIENT_ID]');
            template = template.replace('[CALLER_NAME]', callerNameInput.value || '[CALLER_NAME]');
            
            ticketContent.value = template;
        } else {
            ticketContent.value = '';
        }
    });

    // Update template when client ID or caller name changes
    clientIdInput.addEventListener('input', updateTemplatePlaceholders);
    callerNameInput.addEventListener('input', updateTemplatePlaceholders);
    
    function updateTemplatePlaceholders() {
        const selectedType = ticketTypeSelect.value;
        const selectedCheckbox = document.querySelector('.category-checkbox:checked');
        const categoryMap = {
            'ticket': 'TICKET',
            'socket': 'SOCKET',
            'more': 'MORE',
            'serious': 'SERIOUS TICKETS',
            'ra-si': 'R.A SI'
        };
        const selectedCategory = selectedCheckbox ? categoryMap[selectedCheckbox.id.replace('-checkbox', '')] : '';
        
        if (selectedType && selectedCategory && ticketContent.value) {
            let template = ticketCategories[selectedCategory][selectedType];
            
            template = template.replace('[CLIENT_ID]', clientIdInput.value || '[CLIENT_ID]');
            template = template.replace('[CALLER_NAME]', callerNameInput.value || '[CALLER_NAME]');
            
            // Only update if the content hasn't been manually modified too much
            if (ticketContent.value.includes('[CLIENT_ID]') || ticketContent.value.includes('[CALLER_NAME]')) {
                ticketContent.value = template;
            }
        }
    }
    
    // Modern copy to clipboard functionality
    copyBtn.addEventListener('click', async function() {
        if (!document.querySelector('.category-checkbox:checked')) {
            showStatus('Please select a ticket category first', 'error');
            return;
        }
        
        if (!ticketTypeSelect.value) {
            showStatus('Please select a ticket type', 'error');
            return;
        }
        
        try {
            // Select the text
            ticketContent.select();
            
            // Use the modern Clipboard API
            await navigator.clipboard.writeText(ticketContent.value);
            
            // Show confirmation
            showStatus('Content copied to clipboard!', 'success');
            
            // Deselect the text
            window.getSelection().removeAllRanges();
        } catch (err) {
            console.error('Failed to copy: ', err);
            showStatus('Failed to copy text. Please try again.', 'error');
        }
    });
    
    // Clear the form
    clearBtn.addEventListener('click', function() {
        clientIdInput.value = '';
        callerNameInput.value = '';
        categoryCheckboxes.forEach(cb => cb.checked = false);
        ticketTypeSelect.disabled = true;
        ticketTypeSelect.innerHTML = '<option value="">-- Selecciona un tipo de ticket primero --</option>';
        ticketContent.value = '';
        statusMessage.style.display = 'none';
    });
    
    // Helper function to show status messages
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
    }
});
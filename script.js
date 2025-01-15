document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status');

    // Initialize the widget
    JFCustomWidget.subscribe('ready', () => {
        console.log('Widget is ready!');

        // Fetch form fields
        const formFields = JFCustomWidget.getWidgetSettings().formFields;

        // Fetch responses for the form fields
        JFCustomWidget.getFieldsValueById(Object.keys(formFields), (responses) => {
            console.log('Form Responses:', responses);

            // Process the responses
            const processedData = processFormData(responses);

            // Automatically submit the processed data
            JFCustomWidget.sendSubmit({
                valid: true,
                value: JSON.stringify(processedData), // Example: Submitting processed data as a JSON string
            });

            // Update the status
            statusText.textContent = "Submission successful. Redirecting...";
        });
    });

    /**
     * Process form data as needed (e.g., filter, transform, or aggregate)
     * @param {Object} formData
     * @returns {Object} Processed data
     */
    function processFormData(formData) {
        // Example: Add a timestamp and format responses
        return {
            ...formData,
            timestamp: new Date().toISOString(),
            processed: true,
        };
    }
});
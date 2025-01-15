document.addEventListener('DOMContentLoaded', () => {
    const formDataContainer = document.getElementById('form-data');
    const submitButton = document.getElementById('submit-btn');

    // Initialize the widget
    JFCustomWidget.subscribe('ready', () => {
        console.log('Widget is ready!');

        // Fetch form fields
        const formFields = JFCustomWidget.getWidgetSettings().formFields;

        // Display form responses in the widget
        JFCustomWidget.getFieldsValueById(Object.keys(formFields), (responses) => {
            console.log('Form Responses:', responses);

            // Display the form data in the widget
            formDataContainer.innerHTML = `<pre>${JSON.stringify(responses, null, 2)}</pre>`;
        });

        // Handle submit button click
        submitButton.addEventListener('click', () => {
            // Process custom widget value
            const customValue = `Custom Data: ${Date.now()}`; // Example custom value

            // Submit data back to the form
            JFCustomWidget.sendSubmit({
                valid: true,
                value: customValue,
            });
        });
    });
});
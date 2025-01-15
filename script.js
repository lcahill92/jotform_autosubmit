JFCustomWidget.subscribe('ready', () => {
    console.log('Widget is ready!');

    setTimeout(() => {
        try {
            // Get all the field IDs from the widget settings
            const settings = JFCustomWidget.getWidgetSettings();
            console.log('Widget settings:', settings);

            const formFields = settings.fields || {};
            if (!formFields || Object.keys(formFields).length === 0) {
                throw new Error('formFields is undefined or empty. Check widget configuration.');
            }

            console.log('Form Fields:', formFields);

            // Fetch field values by IDs
            JFCustomWidget.getFieldsValueById(Object.keys(formFields), (responses) => {
                console.log('Form Responses:', responses);
            });
        } catch (error) {
            console.error('Error fetching fields and responses:', error);
        }
    }, 2000); // Delay of 2 seconds
});
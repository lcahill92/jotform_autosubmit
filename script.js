JFCustomWidget.subscribe("ready", function () {
    // Get the widget settings
    const settings = JFCustomWidget.getWidgetSettings();
    
    // Extract the form ID from the widget settings
    const formId = settings.formId || "Unknown Form ID";
    const formFields = settings.fields || {}; // Extract form fields from settings

    // Log the form ID for debugging
    console.log("Form ID:", formId);

    // Check if form fields are available
    if (!formFields || Object.keys(formFields).length === 0) {
        console.error("No fields found in the widget settings. Ensure the widget is properly configured.");
        return;
    }

    // Log fields and their values after a 2-second delay
    setTimeout(() => {
        console.log("Form Fields and Values:");
        Object.keys(formFields).forEach((key) => {
            const field = formFields[key];
            console.log(`Field ID: ${key}, Label: ${field.label}, Value: ${field.value || "Not Filled"}`);
        });
    }, 2000);
});
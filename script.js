// Wait until the widget is ready
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");

    // Fetch the widget settings
    const settings = JFCustomWidget.getWidgetSettings();
    const formId = settings.formId;

    console.log("Form ID:", formId);

    // Use JFCustomWidget.getFieldsValueByName to fetch fields
    JFCustomWidget.getFieldsValueByName([], (data) => {
        if (data && Object.keys(data).length > 0) {
            console.log("Fields and values:");
            Object.entries(data).forEach(([fieldName, fieldValue]) => {
                console.log(`Field Name: ${fieldName}, Field Value: ${fieldValue}`);
            });
        } else {
            console.warn("No fields found or no values entered yet.");
        }
    });
});
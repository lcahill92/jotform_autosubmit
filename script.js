JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");

    // Fetch widget settings
    const settings = JFCustomWidget.getWidgetSettings();
    const apiKey = settings.apiKey || "your-default-api-key-here";
    const formId = settings.formId;
    const qid = settings.qid;

    console.log("Form ID:", formId);
    console.log("Question ID:", qid);

    if (!apiKey || !formId) {
        console.error("Missing API key or Form ID. Cannot fetch fields.");
        return;
    }

    // Fetch fields using the Jotform API
    fetch(`https://api.jotform.com/form/${formId}/questions?apiKey=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            if (data && data.content) {
                console.log("Form Fields:", data.content);

                // Fetch values of all fields on the page
                Object.keys(data.content).forEach((fieldId) => {
                    const field = data.content[fieldId];
                    console.log(`Field ID: ${fieldId}, Label: ${field.text}, Type: ${field.type}`);

                    // Fetch the field values using the `getFieldsValue` method
                    JFCustomWidget.getFieldsValue([fieldId], "id", (values) => {
                        if (values && values.length > 0) {
                            const fieldValue = values[0].value || "No input";
                            console.log(`Field "${field.text}" (ID: ${fieldId}) value:`, fieldValue);
                        } else {
                            console.warn(`No value found for field "${field.text}" (ID: ${fieldId})`);
                        }
                    });
                });
            } else {
                console.warn("No fields found in the form.");
            }
        })
        .catch((error) => {
            console.error("Error fetching fields:", error);
        });
});
JFCustomWidget.subscribe("ready", function () {
    // Get the widget settings
    const settings = JFCustomWidget.getWidgetSettings();

    // Extract formId and questionId from settings
    const formId = settings.formId || "Unknown Form ID";
    const qid = settings.qid || "Unknown Question ID";

    console.log("Form ID:", formId);
    console.log("Question ID:", qid);

    // Attempt to fetch the fields dynamically
    setTimeout(() => {
        try {
            // Fetch fields dynamically from Jotform's API
            JFCustomWidget.getFieldsValue([], "id", (fields) => {
                console.log("Fetched Fields:", fields);

                if (fields && Object.keys(fields).length > 0) {
                    console.log("Form Fields and Responses:");
                    Object.keys(fields).forEach((key) => {
                        const field = fields[key];
                        console.log(
                            `Field ID: ${key}, Label: ${field.label || "No Label"}, Value: ${field.value || "Not Filled"}`
                        );
                    });
                } else {
                    console.warn("No fields found or responses are empty.");
                }
            });
        } catch (error) {
            console.error("Error fetching fields and responses:", error);
        }
    }, 2000);
});
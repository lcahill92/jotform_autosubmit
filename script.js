JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");

    // Fetch widget settings
    const settings = JFCustomWidget.getWidgetSettings();
    console.log("Widget Settings:", settings);

    // Check for formId and qid
    const formId = settings.formId || "Unknown Form ID";
    const qid = settings.qid || "Unknown Question ID";

    console.log("Form ID:", formId);
    console.log("Question ID:", qid);

    // Simulate fetching fields if not directly accessible
    const simulatedFields = {
        field1: { label: "Name", value: "John Doe" },
        field2: { label: "Email", value: "john.doe@example.com" },
    };

    // Attempt to log fields after a delay
    setTimeout(() => {
        if (settings.fields) {
            console.log("Fetched Fields from Settings:", settings.fields);
            Object.keys(settings.fields).forEach((key) => {
                const field = settings.fields[key];
                console.log(`Field ID: ${key}, Label: ${field.label}, Value: ${field.value || "Not Filled"}`);
            });
        } else {
            console.warn("No fields found. Using simulated fields for testing.");
            Object.keys(simulatedFields).forEach((key) => {
                const field = simulatedFields[key];
                console.log(`Field ID: ${key}, Label: ${field.label}, Value: ${field.value}`);
            });
        }
    }, 2000);
});
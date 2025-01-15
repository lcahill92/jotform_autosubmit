(function () {
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;
    let fallbackTimeout;
    let receivedFormData = false;

    JFCustomWidget.subscribe("ready", async () => {
        console.log("Widget is ready.");

        const widgetSettings = JFCustomWidget.getWidgetSettings();
        const apiKey = widgetSettings.apiKey;
        const formId = widgetSettings.formId;

        console.log("Form ID:", formId);
        console.log("API Key:", apiKey);

        if (!formId || !apiKey) {
            console.error("Form ID or API Key is missing!");
            return;
        }

        console.log("Requesting all field values...");
        window.parent.postMessage({ type: "getAllValues" }, "*");

        fallbackTimeout = setTimeout(() => {
            if (!receivedFormData) {
                console.error("Timeout: Did not receive form data from parent.");
            }
        }, 5000); // Adjust timeout as needed

        window.addEventListener("message", async (event) => {
            try {
                console.log("Event Message Received:", event);

                if (event.data.type === "allValues") {
                    receivedFormData = true;
                    clearTimeout(fallbackTimeout);

                    const formData = event.data.values;
                    console.log("Form Data to be submitted:", formData);

                    if (!formData || Object.keys(formData).length === 0) {
                        console.error("Form Data is empty.");
                        return;
                    }

                    const formattedData = {};
                    for (const key in formData) {
                        formattedData[`q_${key}`] = formData[key];
                    }
                    console.log("Formatted Data:", formattedData);

                    await submitToApi(apiKey, formId, formattedData);
                } else {
                    console.error("Unexpected event type:", event.data.type);
                }
            } catch (error) {
                console.error("Error in event message handler:", error);
            }
        });
    });

    async function submitToApi(apiKey, formId, formattedData) {
        try {
            const apiUrl = `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`;
            console.log("API Request URL:", apiUrl);

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submission: formattedData,
                }),
            });

            const result = await response.json();
            console.log("API Response:", result);

            if (!response.ok || !result.success) {
                console.error("Submission failed:", result.message || "Unknown error");
                return;
            }

            console.log("Submission successful:", result);

            window.parent.postMessage({ type: "submissionSuccess" }, "*");
        } catch (error) {
            console.error("Error during API submission:", error);
        }
    }
})();
(async function () {
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Wait for the widget to be ready
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

        const timerElement = document.getElementById("timer");
        if (!timerElement) {
            console.error("Timer element not found.");
            return;
        }

        timerElement.textContent = timeRemaining;

        const countdownInterval = setInterval(() => {
            timeRemaining -= 1;
            timerElement.textContent = timeRemaining;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                submitForm(apiKey, formId);
            }
        }, 1000);
    });

    async function submitForm(apiKey, formId) {
        console.log("Submitting the form...");

        try {
            window.parent.postMessage({ type: "getAllValues" }, "*");

            window.addEventListener("message", async (event) => {
                console.log("Event Received:", event);

                if (event.data.type === "allValues") {
                    const formData = event.data.values;
                    console.log("Form Data to be submitted:", formData);

                    if (!formData || Object.keys(formData).length === 0) {
                        console.error("Form Data is empty. Cannot submit.");
                        return;
                    }

                    const formattedData = {}; // Prepare data with correct field IDs
                    for (const key in formData) {
                        formattedData[`q_${key}`] = formData[key]; // Map to JotForm field IDs
                    }
                    console.log("Formatted Data:", formattedData);

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
                }
            });
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }
})();

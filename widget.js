(function () {
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Timeout fallback for message listener
    let receivedFormData = false;

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

    // Custom fetch with timeout
    async function fetchWithTimeout(resource, options = {}, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(resource, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            throw error; // Rethrow to handle in the main flow
        }
    }

    async function submitForm(apiKey, formId) {
        console.log("Submitting the form...");

        try {
            console.log("Requesting all field values...");
            window.parent.postMessage({ type: "getAllValues" }, "*");

            // Add a timeout fallback for receiving form data
            const fallbackTimeout = setTimeout(() => {
                if (!receivedFormData) {
                    console.error("Timeout: Did not receive form data from parent.");
                }
            }, 5000);

            window.addEventListener("message", async (event) => {
                if (event.data.type === "allValues") {
                    receivedFormData = true; // Stop fallback timer
                    clearTimeout(fallbackTimeout);

                    const formData = event.data.values;
                    console.log("Form Data to be submitted:", formData);

                    if (!formData || Object.keys(formData).length === 0) {
                        console.error("Form Data is empty. Cannot submit.");
                        return;
                    }

                    const formattedData = {};
                    for (const key in formData) {
                        formattedData[`q_${key}`] = formData[key]; // Adjust mapping as needed
                    }
                    console.log("Formatted Data:", formattedData);

                    const apiUrl = `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`;
                    console.log("API Request URL:", apiUrl);

                    try {
                        const response = await fetchWithTimeout(apiUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                submission: formattedData,
                            }),
                        }, 5000); // 5-second timeout

                        const result = await response.json();
                        console.log("API Response:", result);

                        if (!response.ok || !result.success) {
                            console.error("Submission failed:", result.message || "Unknown error");
                            return;
                        }

                        console.log("Submission successful:", result);

                        // Notify the parent form of submission success
                        window.parent.postMessage({ type: "submissionSuccess" }, "*");
                    } catch (fetchError) {
                        console.error("Error during API fetch:", fetchError);
                    }
                }
            });
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }
})();
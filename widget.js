(function () {
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Wait for the widget to be ready
    JFCustomWidget.subscribe("ready", async () => {
        console.log("Widget is ready.");

        // Get widget settings
        const widgetSettings = JFCustomWidget.getWidgetSettings();
        console.log("Widget Settings:", widgetSettings);

        // Retrieve API key and Form ID from widget settings
        const apiKey = widgetSettings.apiKey; // API key passed via widget settings
        const formId = widgetSettings.formId; // Form ID passed via widget settings

        console.log("Form ID:", formId);
        console.log("API Key:", apiKey);

        if (!formId) {
            console.error("Form ID is missing from widget settings!");
            return;
        }

        // Ensure the timer element exists
        const timerElement = document.getElementById("timer");
        if (!timerElement) {
            console.error("Timer element not found in the DOM.");
            return;
        }

        // Initialize the timer
        timerElement.textContent = timeRemaining;

        // Start the countdown
        const countdownInterval = setInterval(() => {
            timeRemaining -= 1;
            timerElement.textContent = timeRemaining;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                submitForm(apiKey, formId);
            }
        }, 1000); // Decrement every second
    });

    // Submit the form via JotForm API
    async function submitForm(apiKey, formId) {
        console.log("Submitting the form...");

        try {
            // Request all field values from the parent form
            window.parent.postMessage({ type: "getAllValues" }, "*");

            // Listen for form values from JotForm
            window.addEventListener("message", async (event) => {
                if (event.data.type === "allValues") {
                    const formData = event.data.values;

                    // Submit the form data via JotForm API
                    const response = await fetch(`https://api.jotform.com/form/${formId}/submissions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            APIKEY: apiKey,
                        },
                        body: JSON.stringify({
                            submission: formData,
                        }),
                    });

                    const result = await response.json();
                    console.log("Submission successful:", result);

                    // Notify the parent form of submission success
                    window.parent.postMessage({ type: "submissionSuccess" }, "*");
                }
            });
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }
})();
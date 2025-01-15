(function () {
    const countdownTime = 5; // Countdown duration in seconds
    let timeRemaining = countdownTime;

    // Log a clear indicator that the widget has initialized
    console.log("Widget script has loaded.");

    // Wait for the widget to be ready
    JFCustomWidget.subscribe("ready", async () => {
        console.log("Widget is ready.");

        // Retrieve API key and form ID from widget settings
        const widgetSettings = JFCustomWidget.getWidgetSettings();
        const apiKey = "03700e066d92a4e8a50476dcf7a1a3fc"; // Use the stored API key
        const formId = "250137186711049"; // Use the stored form ID

        if (!formId || !apiKey) {
            console.error("Form ID or API key is missing.");
            return;
        }

        console.log("Form ID:", formId);
        console.log("API Key:", apiKey);

        // Ensure the timer element exists in the DOM
        const timerElement = document.getElementById("timer");
        if (!timerElement) {
            console.error("Timer element not found in the DOM.");
            return;
        }

        // Initialize the timer display
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

    // Function to submit the form via JotForm API
    async function submitForm(apiKey, formId) {
        console.log("Submitting the form...");

        try {
            // Request all field values from the parent form
            window.parent.postMessage({ type: "getAllValues" }, "*");

            let receivedFormData = false;

            // Listen for the form values from the parent form
            window.addEventListener("message", async (event) => {
                if (event.data.type === "allValues") {
                    receivedFormData = true;
                    const formData = event.data.values;

                    console.log("Form Data received:", formData);

                    if (!formData || Object.keys(formData).length === 0) {
                        console.error("Form Data is empty. Cannot submit.");
                        return;
                    }

                    // Submit the form data via JotForm API
                    const response = await fetch(
                        `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                submission: formData,
                            }),
                        }
                    );

                    const result = await response.json();
                    if (response.ok) {
                        console.log("Submission successful:", result);
                        window.parent.postMessage({ type: "submissionSuccess" }, "*");
                    } else {
                        console.error("Error in submission:", result);
                    }
                }
            });

            // Add a timeout fallback for receiving form data
            setTimeout(() => {
                if (!receivedFormData) {
                    console.error("Timeout: Did not receive form data from parent.");
                }
            }, 5000);
        } catch (error) {
            console.error("Error during submission process:", error);
        }
    }
})();

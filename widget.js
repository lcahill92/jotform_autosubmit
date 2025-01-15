(function () {
    const countdownTime = 5; // Countdown duration in seconds
    let timeRemaining = countdownTime;

    const JFCustomWidget = {
        init() {
            // Subscribe to the ready event
            this.subscribe("ready", this.onReady);
        },
        subscribe(event, handler) {
            window.addEventListener("message", (e) => {
                if (e.data.type === event) {
                    handler(e.data);
                }
            });
        },
        sendMessage(data) {
            window.parent.postMessage(data, "*");
        },
        onReady() {
            console.log("Widget is ready.");
            const timerElement = document.getElementById("timer");
            if (!timerElement) {
                console.error("Timer element not found.");
                return;
            }

            timerElement.textContent = timeRemaining;
            const countdownInterval = setInterval(() => {
                timeRemaining--;
                timerElement.textContent = timeRemaining;

                if (timeRemaining <= 0) {
                    clearInterval(countdownInterval);
                    JFCustomWidget.submitForm();
                }
            }, 1000);
        },
        async submitForm() {
            console.log("Submitting form...");
            this.sendMessage({ type: "getAllValues" });

            const timeout = setTimeout(() => {
                console.error("Timeout: Did not receive form data.");
            }, 5000);

            window.addEventListener("message", async (event) => {
                if (event.data.type === "allValues") {
                    clearTimeout(timeout);
                    const formData = event.data.values;

                    if (!formData || Object.keys(formData).length === 0) {
                        console.error("Received empty form data.");
                        return;
                    }

                    console.log("Form Data Received:", formData);
                    await this.sendSubmission(formData);
                }
            });
        },
        async sendSubmission(formData) {
            const formId = "250137186711049"; // Replace with dynamic form ID
            const apiKey = "03700e066d92a4e8a50476dcf7a1a3fc"; // Replace with dynamic API Key
            const apiUrl = `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`;

            try {
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        submission: formData,
                    }),
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    console.log("Submission successful:", result);
                    this.sendMessage({ type: "submissionSuccess" });
                } else {
                    console.error("Submission failed:", result.message || "Unknown error");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        },
    };

    // Initialize the widget
    JFCustomWidget.init();
})();
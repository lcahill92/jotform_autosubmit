(function () {
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Decrypt the API key
    const decryptionKey = "your-secret-key"; // Securely store this key
    function decryptApiKey(encryptedKey) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedKey, decryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Error decrypting API key:", error);
            return null;
        }
    }

    // Get query parameters
    function getQueryParam(key) {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    }

    // Wait for the widget to be ready
    JFCustomWidget.subscribe("ready", async () => {
        console.log("Widget is ready.");

        const encryptedApiKey = getQueryParam("encryptedApiKey");
        const formId = getQueryParam("formID");

        if (!encryptedApiKey || !formId) {
            console.error("Required parameters missing (encryptedApiKey, formID)!");
            return;
        }

        const apiKey = decryptApiKey(encryptedApiKey);

        if (!apiKey) {
            console.error("Failed to decrypt API key!");
            return;
        }

        console.log("Decrypted API Key:", apiKey);
        console.log("Form ID:", formId);

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
            const apiUrl = `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`;
            console.log("API Request URL:", apiUrl);

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submission: { name: "Test User", email: "test@example.com" }, // Replace with actual form data
                }),
            });

            const result = await response.json();
            console.log("API Response:", result);

            if (!response.ok) {
                console.error("API Request Failed. Status:", response.status, "Error:", result);
                return;
            }

            console.log("Submission successful:", result);

        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }
})();
(function () {
    console.log("Widget script loaded.");

    // Countdown timer configuration
    const countdownTime = 5; // Countdown duration in seconds
    let timeRemaining = countdownTime;

    // Ensure the form exists
    const formElement = document.getElementById("250137186711049");
    if (!formElement) {
        console.error("Form not found in the DOM.");
        return;
    }

    // Timer element (if you want to show a countdown)
    const timerElement = document.getElementById("timer");
    if (timerElement) {
        timerElement.textContent = timeRemaining;

        // Start the countdown
        const countdownInterval = setInterval(() => {
            timeRemaining -= 1;
            timerElement.textContent = timeRemaining;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                console.log("Time's up! Submitting the form...");
                submitForm();
            }
        }, 1000);
    } else {
        console.log("No timer element found. Submitting immediately...");
        submitForm();
    }

    // Function to submit the form programmatically
    function submitForm() {
        try {
            console.log("Submitting the form programmatically...");
            formElement.submit(); // Trigger form submission
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }
})();
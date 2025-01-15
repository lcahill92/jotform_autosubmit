(function () {
    console.log("Widget script loaded.");

    // Countdown timer configuration
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Ensure the form exists
    const formElement = document.getElementById("250137186711049");
    if (!formElement) {
        console.error("Form not found in the DOM.");
        return;
    }

    // Timer element (to show the countdown visually)
    let timerElement = document.getElementById("timer");
    if (!timerElement) {
        // If no timer element exists, create one dynamically for debugging
        timerElement = document.createElement("div");
        timerElement.id = "timer";
        timerElement.style.position = "absolute";
        timerElement.style.top = "10px";
        timerElement.style.right = "10px";
        timerElement.style.backgroundColor = "yellow";
        timerElement.style.padding = "10px";
        timerElement.style.fontSize = "20px";
        document.body.appendChild(timerElement);
    }

    // Initialize the timer
    timerElement.textContent = `Time Remaining: ${timeRemaining} seconds`;

    // Start the countdown
    const countdownInterval = setInterval(() => {
        timeRemaining -= 1;
        timerElement.textContent = `Time Remaining: ${timeRemaining} seconds`;

        console.log(`Time remaining: ${timeRemaining} seconds`);

        // When countdown reaches 0, clear the timer and submit the form
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            console.log("Countdown finished. Attempting to submit the form.");
            autoSubmitForm();
        }
    }, 1000);

    // Function to submit the form programmatically
    function autoSubmitForm() {
        try {
            console.log("Submitting the form...");
            // Simulate a form submission
            formElement.submit();
        } catch (error) {
            console.error("Error while submitting the form:", error);
        }
    }
})();

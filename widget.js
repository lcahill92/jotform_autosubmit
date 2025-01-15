document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded. Starting script...");

    // Countdown timer configuration
    const countdownTime = 2; // Timer duration in seconds
    let timeRemaining = countdownTime;

    // Ensure the form exists
    const formElement = document.querySelector("form#250137186711049");
    if (!formElement) {
        console.error("Form not found in the DOM. Ensure the form ID is correct.");
        return;
    }
    console.log("Form found in the DOM.");

    // Ensure the timer element exists
    let timerElement = document.getElementById("timer");
    if (!timerElement) {
        // If no timer element exists, create one dynamically for debugging
        timerElement = document.createElement("div");
        timerElement.id = "timer";
        timerElement.style.position = "fixed";
        timerElement.style.bottom = "10px";
        timerElement.style.right = "10px";
        timerElement.style.backgroundColor = "yellow";
        timerElement.style.padding = "10px";
        timerElement.style.fontSize = "20px";
        timerElement.style.zIndex = "1000";
        document.body.appendChild(timerElement);
    }
    console.log("Timer element created or found.");

    // Initialize the timer
    timerElement.textContent = `Time Remaining: ${timeRemaining} seconds`;

    // Start the countdown
    const countdownInterval = setInterval(() => {
        console.log(`Time remaining: ${timeRemaining} seconds`);

        timerElement.textContent = `Time Remaining: ${timeRemaining} seconds`;
        timeRemaining -= 1;

        if (timeRemaining < 0) {
            clearInterval(countdownInterval);
            console.log("Countdown finished. Attempting to submit the form...");
            autoSubmitForm();
        }
    }, 1000);

    // Function to submit the form programmatically
    function autoSubmitForm() {
        try {
            console.log("Submitting the form programmatically...");
            formElement.submit();
        } catch (error) {
            console.error("Error while submitting the form:", error);
        }
    }
});

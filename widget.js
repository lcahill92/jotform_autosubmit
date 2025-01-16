// Ensure JFCustomWidget is ready before interacting
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready.");
    
    // Handle input field value change
    const inputField = document.getElementById("custom-input");
    const errorMessage = document.getElementById("error-message");

    inputField.addEventListener("input", function () {
        const inputValue = inputField.value;
        if (inputValue) {
            errorMessage.style.display = "none"; // Hide error message
            // Send the current value to JotForm
            JFCustomWidget.sendData({ value: inputValue });
        } else {
            JFCustomWidget.sendData({ value: null }); // Send null if empty
        }
    });
});

// Handle form submission
JFCustomWidget.subscribe("submit", function () {
    const inputField = document.getElementById("custom-input");
    const inputValue = inputField.value;
    const errorMessage = document.getElementById("error-message");

    if (!inputValue) {
        // Display error if the field is required and empty
        errorMessage.style.display = "block";
        JFCustomWidget.sendSubmitError("The input field cannot be empty.");
    } else {
        errorMessage.style.display = "none"; // Hide error
        JFCustomWidget.sendData({ value: inputValue }); // Send data to JotForm
    }
});
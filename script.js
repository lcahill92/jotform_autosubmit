// Listen for changes in the input field
document.getElementById("custom-input").addEventListener("input", function (e) {
    const inputValue = e.target.value;
    // Send the value back to JotForm
    JFCustomWidget.sendData({ value: inputValue });
});

// Handle data initialization
JFCustomWidget.subscribe("submit", function () {
    const inputValue = document.getElementById("custom-input").value;
    JFCustomWidget.sendData({ value: inputValue });
});
// Wait until the widget is ready
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready to receive data.");

    // Display data in the widget
    function displayData(data) {
        const dataList = document.getElementById("data-list");
        dataList.innerHTML = ""; // Clear previous data
        Object.entries(data).forEach(([field, value]) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${field}: ${value}`;
            dataList.appendChild(listItem);
        });
    }

    // Listen for incoming data
    JFCustomWidget.subscribe("setData", function (data) {
        console.log("Received data:", data);
        displayData(data); // Update the widget's display
    });
});

// Handle form submission
JFCustomWidget.subscribe("submit", function () {
    console.log("Form submitted.");
    // Optionally send data to JotForm
    JFCustomWidget.sendData({ submitted: true });
});
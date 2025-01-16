// Initialize a data store to capture dynamic inputs
let dataStore = {};

// Function to fetch and log values dynamically based on the widget setting
function fetchAndLogFormValues(targetFieldID) {
    if (!targetFieldID) {
        console.error("Target field ID is not defined in widget settings.");
        return;
    }

    // Use the provided target field ID to locate the input field
    const targetField = document.getElementById(targetFieldID);

    if (targetField) {
        console.log(`Value of the field with ID "${targetFieldID}":`, targetField.value);
        dataStore[targetFieldID] = targetField.value; // Store the field value in the data store
    } else {
        console.warn(`Field with ID "${targetFieldID}" not found.`);
    }
}

// Ensure the widget is ready
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready to receive data.");

    // Fetch the target field ID from widget settings
    const targetFieldID = JFCustomWidget.getWidgetSetting("targetFieldID");
    console.log("Target Field ID from settings:", targetFieldID);

    // Fetch and log form values based on the target field ID
    fetchAndLogFormValues(targetFieldID);

    // Example: Dynamically update the widget with external data
    JFCustomWidget.subscribe("setData", function (data) {
        console.log("Received external data:", data);

        // Merge new data with existing data
        dataStore = { ...dataStore, ...data };
        updateDataList();
    });

    // Handle form submission
    JFCustomWidget.subscribe("submit", function () {
        console.log("Submitting data:", dataStore);

        // Include user input from the text field
        const userInput = document.getElementById("userInput").value;
        if (userInput) {
            dataStore["userInput"] = userInput;
        }

        // Fetch and include the field value based on the widget setting
        fetchAndLogFormValues(targetFieldID);

        // Convert the dataStore object to a JSON string
        const msg = {
            valid: true,
            value: JSON.stringify(dataStore), // Stringify the data
        };

        console.log("Final submission data:", msg);
        JFCustomWidget.sendSubmit(msg);
    });
});

// Function to update the display list
function updateDataList() {
    const dataList = document.getElementById("dataList");
    dataList.innerHTML = ""; // Clear existing list

    Object.entries(dataStore).forEach(([key, value]) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${key}: ${value}`;
        dataList.appendChild(listItem);
    });
}
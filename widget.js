// Initialize a data store to capture dynamic inputs
let dataStore = {};

// Function to fetch and log values from hidden input fields dynamically
function fetchAndLogFormValues() {
    // Use querySelector to find the hidden input field by attributes
    const hiddenField = document.querySelector('input[type="hidden"][name="q138_typeA"]');

    if (hiddenField) {
        console.log("Hidden field value fetched:", hiddenField.value);
        dataStore["hiddenField"] = hiddenField.value; // Store the hidden field value in the data store
    } else {
        console.warn("Hidden field not found. Ensure the field exists in the form.");
    }
}

// Ensure the widget is ready
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready to receive data.");

    // Fetch and log form values when the widget is ready
    fetchAndLogFormValues();

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

        // Fetch and include the hidden field value
        fetchAndLogFormValues();

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
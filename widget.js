// Wait until the widget is ready
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget SDK is ready!");

    // Notify JotForm that the widget is initialized
    JFCustomWidget.sendData({ initialized: true });

    // Set a timeout to auto-submit the form
    setTimeout(() => {
        console.log("Attempting to auto-submit the form...");
        try {
            JFCustomWidget.sendSubmit();
            console.log("Form submission triggered successfully!");
        } catch (error) {
            console.error("Error while triggering form submission:", error);
        }
    }, 3000); // Adjust delay as needed (3 seconds here)
});

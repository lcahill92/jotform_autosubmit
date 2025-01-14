// Subscribe to the "ready" event to know when the widget is loaded
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");

    // Notify the JotForm form that the widget is initialized
    JFCustomWidget.sendData({ initialized: true });

    // Auto-submit the form after a delay
    setTimeout(() => {
        console.log("Auto-submitting the form...");
        JFCustomWidget.sendSubmit();
    }, 3000); // Adjust the delay (in milliseconds) as needed (3 seconds in this example)
});

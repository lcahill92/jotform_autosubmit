JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");

    JFCustomWidget.sendData({ initialized: true });

    setTimeout(() => {
        console.log("Auto-submitting the form...");
        JFCustomWidget.sendSubmit();
    }, 5000); // Auto-submit after 5 seconds
});

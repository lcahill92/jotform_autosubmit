"use strict";

$(document).ready(function () {
    console.log("Widget initialized.");

    // Display initial status
    const statusElement = $("#status");
    statusElement.text("Waiting for 2 seconds before submission...");

    // Simulate a 2-second wait
    setTimeout(() => {
        console.log("2 seconds elapsed. Attempting to submit...");

        // Use the JFCustomWidget API to submit the form
        try {
            if (typeof JFCustomWidget !== "undefined") {
                // Send data back to JotForm
                JFCustomWidget.sendSubmit({
                    valid: true, // Ensure submission proceeds
                    value: "Form submitted via widget after 2-second delay",
                });
                console.log("Submission request sent to JotForm.");
                statusElement.text("Submission sent!");
            } else {
                console.error("JFCustomWidget API not available.");
                statusElement.text("Error: Unable to submit form.");
            }
        } catch (error) {
            console.error("Error during submission:", error);
            statusElement.text("Error during submission.");
        }
    }, 2000); // 2-second delay
});
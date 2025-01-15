document.addEventListener("DOMContentLoaded", function () {
    console.log("Widget loaded. Waiting for 2 seconds...");

    // Wait for 2 seconds
    setTimeout(function () {
        console.log("2 seconds passed. Attempting to submit the form...");

        try {
            // Access the parent form using JFCustomWidget API
            JFCustomWidget.sendSubmit({
                success: true,
                message: "Form submitted after 2 seconds!"
            });
            console.log("Form submitted successfully!");
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }, 2000); // 2-second delay 
});

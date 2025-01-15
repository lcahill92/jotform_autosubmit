document.addEventListener("DOMContentLoaded", function () {
    console.log("Widget loaded. Waiting for 2 seconds...");

    // Wait for 2 seconds
    setTimeout(function () {
        console.log("2 seconds passed. Attempting to submit the form...");

        try {
            // First, try submitting via JFCustomWidget API
            if (typeof JFCustomWidget !== "undefined" && typeof JFCustomWidget.sendSubmit === "function") {
                console.log("Using JFCustomWidget to submit the form...");
                JFCustomWidget.sendSubmit({
                    success: true,
                    message: "Form submitted after 2 seconds!"
                });
                console.log("Form submission triggered via JFCustomWidget.");
            } else {
                console.warn("JFCustomWidget API not available. Attempting DOM-based submission...");

                // Fallback: Submit the form directly via the parent DOM
                const parentForm = window.parent.document.querySelector("form");
                if (parentForm) {
                    parentForm.submit();
                    console.log("Form submission triggered via DOM.");
                } else {
                    console.error("Parent form not found. Submission failed.");
                }
            }
        } catch (error) {
            console.error("Error submitting the form:", error);
        }
    }, 2000); // 2-second delay
});

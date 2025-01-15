window.addEventListener("load", function () {
    const timerDuration = 120; // Countdown duration in seconds
    let countdownComplete = false;

    // Initialize the countdown timer
    function initializeCountdown() {
        $("#countdown").timeTo({
            seconds: timerDuration,
            fontSize: 30,
            theme: "black",
            displayCaptions: true,
            captionSize: 12,
            callback: function () {
                countdownComplete = true;
                console.log("Countdown finished!");
            },
        });

        // Resize widget dynamically for proper rendering in JotForm
        JFCustomWidget.requestFrameResize({
            height: $("#countdown-container").outerHeight(),
        });
    }

    // Prepare data for submission
    function getSubmissionData() {
        return {
            valid: countdownComplete,
            value: countdownComplete
                ? "Countdown finished!"
                : "Countdown is still running.",
        };
    }

    // Widget lifecycle events
    JFCustomWidget.subscribe("ready", function () {
        console.log("Widget is ready");
        initializeCountdown();
    });

    JFCustomWidget.subscribe("submit", function () {
        console.log("Submitting data to JotForm...");
        const data = getSubmissionData();
        console.log("Submission Data:", data);

        // Send the data back to JotForm
        JFCustomWidget.sendSubmit(data);
    });
});

(function () {
    // Countdown timer configuration
    const countdownTime = 10; // Timer duration in seconds
    let timeRemaining = countdownTime;
  
    // Update the timer UI
    const timerElement = document.getElementById("timer");
    timerElement.textContent = timeRemaining;
  
    // Countdown logic
    const countdownInterval = setInterval(() => {
      timeRemaining -= 1;
      timerElement.textContent = timeRemaining;
  
      if (timeRemaining <= 0) {
        clearInterval(countdownInterval);
        submitForm();
      }
    }, 1000);
  
    // Submit the form via JotForm API
    async function submitForm() {
      console.log("Submitting the form...");
  
      try {
        // Get form field values from JotForm's parent form
        window.parent.postMessage({ type: "getAllValues" }, "*");
  
        // Listen for form values from JotForm
        window.addEventListener("message", async (event) => {
          if (event.data.type === "allValues") {
            const formData = event.data.values;
  
            // Submit the form data via JotForm API
            const response = await fetch("https://api.jotform.com/submission", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                APIKEY: "YOUR_API_KEY", // Replace with your JotForm API key
              },
              body: JSON.stringify({
                form_id: "YOUR_FORM_ID", // Replace with your JotForm ID
                submission: formData,
              }),
            });
  
            const result = await response.json();
            console.log("Submission successful:", result);
  
            // Notify the parent form of submission success
            window.parent.postMessage({ type: "submissionSuccess" }, "*");
          }
        });
      } catch (error) {
        console.error("Error submitting the form:", error);
      }
    }
  })();
(function () {
    // Countdown timer configuration
    const countdownTime = 10; // Timer duration in seconds
    let timeRemaining = countdownTime;
  
    // Update the timer UI
    const timerElement = document.getElementById("timer");
    timerElement.textContent = timeRemaining;
  
    // Initialize the widget
    JFCustomWidget.subscribe("ready", async () => {
      console.log("Widget is ready.");
  
      // Get widget settings (includes API key and other configurations)
      const widgetSettings = JFCustomWidget.getWidgetSettings();
  
      const apiKey = widgetSettings.apiKey; // API key passed via widget settings
      const formId = widgetSettings.formId || widgetSettings.refFormID; // Dynamic form ID
  
      console.log("Form ID:", formId);
      console.log("API Key:", apiKey);
  
      // Start the countdown
      const countdownInterval = setInterval(() => {
        timeRemaining -= 1;
        timerElement.textContent = timeRemaining;
  
        if (timeRemaining <= 0) {
          clearInterval(countdownInterval);
          submitForm(apiKey, formId);
        }
      }, 1000);
    });
  
    // Submit the form via JotForm API
    async function submitForm(apiKey, formId) {
      console.log("Submitting the form...");
  
      try {
        // Request all field values from the parent form
        window.parent.postMessage({ type: "getAllValues" }, "*");
  
        // Listen for form values from JotForm
        window.addEventListener("message", async (event) => {
          if (event.data.type === "allValues") {
            const formData = event.data.values;
  
            // Submit the form data via JotForm API
            const response = await fetch(`https://api.jotform.com/form/${formId}/submissions`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                APIKEY: apiKey,
              },
              body: JSON.stringify({
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
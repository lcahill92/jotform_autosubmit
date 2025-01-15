(function () {
    // Default timer duration (fallback if not provided in settings)
    const defaultCountdownTime = 10;
  
    // Wait for the widget to be ready
    JFCustomWidget.subscribe("ready", async () => {
      console.log("Widget is ready.");
  
      // Get widget settings (includes timer duration and other configurations)
      const widgetSettings = JFCustomWidget.getWidgetSettings();
      console.log("Widget Settings:", widgetSettings);
  
      // Retrieve the timer duration from settings, or use the default
      const timerDuration = parseInt(widgetSettings.timerDuration, 10) || defaultCountdownTime;
      console.log("Timer Duration:", timerDuration);
  
      // Retrieve API key and form ID
      const apiKey = widgetSettings.apiKey; // API key passed via widget settings
      let formId = widgetSettings.formId || widgetSettings.refFormID;
  
      if (!formId) {
        formId = getFormIdFromUrl();
      }
      console.log("Form ID:", formId);
  
      if (!formId || !apiKey) {
        console.error("Form ID or API Key is missing!");
        return;
      }
  
      // Ensure the timer element exists before proceeding
      const timerElement = document.getElementById("timer");
      if (!timerElement) {
        console.error("Timer element not found in the DOM.");
        return;
      }
  
      // Initialize the timer
      let timeRemaining = timerDuration;
      timerElement.textContent = timeRemaining;
  
      // Start the countdown
      const countdownInterval = setInterval(() => {
        timeRemaining -= 1;
        timerElement.textContent = timeRemaining;
  
        if (timeRemaining <= 0) {
          clearInterval(countdownInterval);
          submitForm(apiKey, formId);
        }
      }, 1000); // Decrement every second
    });
  
    // Function to extract Form ID from URL
    function getFormIdFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("formID");
    }
  
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
// Initialize the widget
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");
  
    // Fetch widget settings
    const settings = JFCustomWidget.getWidgetSettings();
    console.log("Widget Settings:", settings);
  
    const formId = settings.formId; // Form ID from settings
    const field1 = settings.field1; // Single field ID from settings
  
    console.log("Form ID from settings:", formId);
    console.log("Field ID from settings:", field1);
  
    // Add event listener to handle widget input submission
    const widgetInputElement = document.getElementById("widgetInput");
    const widgetSubmitButton = document.getElementById("widgetSubmit");
  
    if (!widgetInputElement || !widgetSubmitButton) {
      console.error("Widget input or submit button is missing from the DOM.");
      return;
    }
  
    console.log("Widget Input Element:", widgetInputElement);
    console.log("Widget Submit Button:", widgetSubmitButton);
  
    widgetSubmitButton.addEventListener("click", function () {
      console.log("Submit button clicked!");
  
      const widgetInputValue = widgetInputElement.value;
      console.log("Value entered in widget input:", widgetInputValue);
  
      if (!widgetInputValue) {
        console.warn("No value entered in the widget input field.");
        alert("Please enter a value.");
        return;
      }
  
      if (field1) {
        console.log(`Fetching value from form field with ID: ${field1}`);
        JFCustomWidget.getWidgetValue(field1, function (formFieldValue) {
          console.log(`Value retrieved from form field (ID: ${field1}):`, formFieldValue);
  
          const combinedData = {
            widgetInput: widgetInputValue,
            formField: formFieldValue,
          };
  
          console.log("Combined data before submission:", combinedData);
  
          // Simulate data handling before submission (can be extended)
          console.log("Data prepared for submission:", JSON.stringify(combinedData, null, 2));
  
          // Note: Data is not submitted yet, allowing further debugging
          console.log("Submission is still pending. Modify or inspect data if needed.");
        });
      } else {
        console.warn("No field ID was specified in widget settings.");
        alert("No field specified in settings.");
      }
    });
  });
  
  // Listen for form submission
  JFCustomWidget.subscribe("submit", function () {
    console.log("Form submission triggered.");
  });
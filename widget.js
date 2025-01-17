// Initialize the widget
JFCustomWidget.subscribe("ready", function () {
    console.log("Widget is ready!");
  
    // Fetch widget settings defined in the JotForm Widget Builder
    const settings = JFCustomWidget.getWidgetSettings();
    console.log("Widget Settings:", settings);
  
    const fieldId = settings.fieldId; // Get the field ID passed via settings
    if (!fieldId) {
      console.error("No Field ID provided in widget settings.");
      return;
    }
  
    console.log("Field ID from settings:", fieldId);
  
    // Fetch the value of the field from JotForm
    JFCustomWidget.getFieldValue(fieldId, function (fieldValue) {
      if (fieldValue !== undefined) {
        console.log(`Value retrieved from form field (ID: ${fieldId}):`, fieldValue);
  
        // Optional: Display the field value in a widget input field
        const widgetInputElement = document.getElementById("widgetInput");
        if (widgetInputElement) {
          widgetInputElement.value = fieldValue;
          console.log("Widget input pre-filled with field value:", fieldValue);
        }
      } else {
        console.warn(`Field with ID ${fieldId} has no value or does not exist.`);
      }
    });
  
    // Add event listener for the widget's submit button (if required)
    const widgetSubmitButton = document.getElementById("widgetSubmit");
    if (widgetSubmitButton) {
      widgetSubmitButton.addEventListener("click", function () {
        const widgetInputValue = document.getElementById("widgetInput").value;
        console.log("Widget input value:", widgetInputValue);
  
        // Send the widget data back to JotForm
        const payload = { fieldId, widgetInputValue };
        console.log("Payload to be sent:", payload);
        JFCustomWidget.sendSubmit(payload);
      });
    }
  });
  
  // Log form submission (optional)
  JFCustomWidget.subscribe("submit", function () {
    console.log("Form submission triggered.");
  });
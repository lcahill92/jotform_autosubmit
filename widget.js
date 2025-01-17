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
  
    // Fetch value from the hidden field (id="input_152")
    const hiddenFieldId = "input_152"; // Adjust this as needed
    JFCustomWidget.getWidgetValue(hiddenFieldId, function (hiddenFieldValue) {
      if (hiddenFieldValue !== undefined) {
        console.log(`Value retrieved from hidden field (ID: ${hiddenFieldId}):`, hiddenFieldValue);
      } else {
        console.warn(`Hidden field with ID ${hiddenFieldId} has no value or does not exist.`);
      }
    });
  
    // Log the widget input field (if exists)
    const widgetInputElement = document.getElementById("widgetInput");
    if (widgetInputElement) {
      console.log("Widget Input Element:", widgetInputElement);
      console.log("Initial value of widget input:", widgetInputElement.value);
    } else {
      console.warn("Widget input field is missing.");
    }
  
    // Capture the current state of all key settings and fields
    const state = {
      formId: formId,
      field1: field1,
      hiddenFieldValue: null,
    };
  
    // Update state with hidden field value
    JFCustomWidget.getWidgetValue(hiddenFieldId, function (value) {
      state.hiddenFieldValue = value;
      console.log("Captured state on load:", state);
    });
  });
  
  // Listen for form submission (optional if needed later)
  JFCustomWidget.subscribe("submit", function () {
    console.log("Form submission triggered.");
  });
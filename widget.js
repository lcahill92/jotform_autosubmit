JFCustomWidget.subscribe("ready", function () {
    // Fetch widget settings
    const settings = JFCustomWidget.getSettings();
    const formId = settings.formId; // Form ID from settings
    const inputIds = settings.inputIds ? settings.inputIds.split(",") : []; // Input IDs as an array
  
    console.log("Form ID:", formId);
    console.log("Input Field IDs:", inputIds);
  
    // Add event listener to handle widget input submission
    document.getElementById("widgetSubmit").addEventListener("click", function () {
      const widgetInputValue = document.getElementById("widgetInput").value;
  
      if (!widgetInputValue) {
        alert("Please enter a value.");
        return;
      }
  
      // Retrieve data from each specified form field
      const formFieldData = {};
      inputIds.forEach((inputId) => {
        JFCustomWidget.getWidgetValue(inputId, function (value) {
          formFieldData[inputId] = value;
  
          // If all input IDs have been processed, send data back
          if (Object.keys(formFieldData).length === inputIds.length) {
            const combinedData = {
              widgetInput: widgetInputValue,
              formFields: formFieldData,
            };
  
            console.log("Combined Data:", combinedData);
            JFCustomWidget.sendSubmit(combinedData);
          }
        });
      });
    });
  });
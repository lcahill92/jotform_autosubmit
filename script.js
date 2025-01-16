// Function to extract the canonical URL and log all form details
function extractFormDetails() {
    try {
        // Fetch the <form> element
        const formElement = document.querySelector("form.jotform-form");

        if (!formElement) {
            console.error("No form element found on the page.");
            return;
        }

        // Extract the form action URL
        const actionUrl = formElement.getAttribute("action");
        console.log("Form Action URL:", actionUrl);

        // Extract the form ID
        const formId = formElement.querySelector("input[name='formID']")?.value;
        console.log("Form ID:", formId);

        // Extract input names and their values
        const inputs = formElement.querySelectorAll("input, select, textarea");
        const inputData = Array.from(inputs).map(input => ({
            name: input.name,
            value: input.value,
            type: input.type
        }));

        console.log("Form Inputs and Values:", inputData);

        // Fallback: Log the current page URL
        const currentPageUrl = document.location.href;
        console.log("Current Page URL:", currentPageUrl);

        // Return all extracted data
        return {
            actionUrl,
            formId,
            inputs: inputData,
            currentPageUrl
        };
    } catch (error) {
        console.error("Error extracting form details:", error);
    }
}

// Call the function and log the extracted details
const formDetails = extractFormDetails();

// If you want to send the extracted data to a webhook
if (formDetails) {
    console.log("Sending extracted data to webhook...");
    fetch("https://hooks.zapier.com/hooks/catch/16414363/2k229v1/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formDetails)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Webhook Response:", data);
        })
        .catch(error => {
            console.error("Error sending data to webhook:", error);
        });
}
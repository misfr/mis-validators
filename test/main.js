/**
 * Test script
 * @author Frederic BAYLE
 */

// Set the current locale to French
validators.localization.setCurrentLocale("fr");

// Defining needed validation events
validators.onValidationBegin = () => {
  let elements = document.getElementsByTagName("*");
  for(let i = 0; i < elements.length; i++) {
    // Remove any is-required class on page elements
    elements[i].className = elements[i].className.replace(/\bis-invalid\b/g, "").trim();
  }
};
validators.onControlValidated = (controlToValidate, validationStatus) => {
  if (controlToValidate && !validationStatus) {
    controlToValidate.className += " is-invalid";
  }
}
validators.onValidationEnd = (validationStatus, validationMsgTab) => {
  if (!validationStatus) {
    // For example, you can display an error message if the validation fails
    alert("The form contains some errors :\n - " + validationMsgTab.join("\n - "));
  }
};

Validators.onValidationBegin = function () {
  $(".is-invalid").removeClass("is-invalid");
};
Validators.onControlValidated = function (controlToValidate, validationStatus) {
  if (!validationStatus) {
    controlToValidate.addClass("is-invalid");
  }
};
Validators.onValidationEnd = function (validationStatus, validationMsgTab) {
  if (!validationStatus) {
    // For example, you can display an error message if the validation fails
    alert("The form contains some errors :\n - " + validationMsgTab.join("\n - "));
  }
};

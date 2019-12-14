# mis-validators

Simple javascript form validation utility

## Requirements

There's no requirement

## Installation

If you plan to use mis-validators as module, simpùly type the following command in a terminal :

```bash
npm install mis-validators
```

Otherwise, you can include the mis-validators bundle script in your HTML pages like this :

```html
<script type="text/javascript" src="path_to_validators/mis-validators.bundle.js"></script>
```

## Using mis-validators in a javascript module

If you use mis-validators as a module, you have to require it and instanciate the main class like this :

__ES5 :__

```javascript
const v = require("mis-validators");
let validators = new v.Validators();
```

__ES6 / Typescript :__

```javascript
import { Validators } from "mis-validators";
let validators = new Validators();
```

## Simple form validation example

Let's see a simple example with a basic authentication form :

```html
<form id="myform" onsubmit="return validators.validate();">
  <input type="email" id="login" name="login" placeholder="Enter your email address">
  <span data-validate="required" data-control="email" data-message="You must enter your email address"></span>
  <input type="password" id="pwd" name="pwd" placeholder="Enter your password">
  <span data-validate="required" data-control="pwd" data-message="You must enter your password"></span>
</form>
```

Each tag containing the data-validate attribute will be considered as a validator.
An input control can have more than one validator.

__Required attributes__ :

* **data-control** : Input control to validate
* **data-message** : Message to display when the input control validation fails

__Optional attributes__ :

* **data-enabled** : Flag that determines whether validation should check the validator or not

## Available validators

### **required** - Required field validation

You can use this validator to check if an input control is empty

```html
<input type="email" id="login" name="login" placeholder="Enter your email address">
<span data-validate="required" data-control="email" data-message="You must enter your email address"></span>
```

### **regexp** - Regular expression validation

You can use this validator to check a pattern of an input control value.

```html
<input type="text" id="ref" name="ref" placeholder="Enter the product reference">
<span data-validate="required" data-control="ref" data-pattern="^[A-Z0-9]+$"
  data-message="You must enter a valid reference"></span>
```

__Required attributes__ :

* **data-pattern** : Regular expression pattern

### **int** - Int number validation

You can use this validator to check the int value of an input control value.

```html
<input type="text" id="age" name="age" placeholder="Enter your age">
<span data-validate="int" data-control="age" data-operator="greaterthan" data-comparevalue="0"
  data-message="Your age must be a positive int number"></span>
```

__Optional attributes__ :

* **data-operator** : if not provided, only the data type is checked. Available values are :
  * equal
  * notequal
  * greaterthan
  * lessthan
  * greaterthanequal
  * lessthanequal
  * range
* **data-comparevalue** : value to compare with the input control to validate if the data-operator attribute is provided
* **data-comparecontrol** : you can compare with another control instead of a value with this attribute
* **data-comparemaxvalue** : You must provide this attribute if the range operator is provided

### **float** - Float number validation

You can use this validator to check the float value of an input control value.

```html
<input type="text" id="price" name="price" placeholder="Product price">
<span data-validate="float" data-control="price" data-operator="greaterthan" data-comparevalue="0"
  data-message="The product price must be a positive float number"></span>
```

__Optional attributes__ : see the int validator

### **date** - Date or DateTime expression validation

You can use this validator to check a date in an input control value.

```html
<input type="text" id="birthday" name="birthday" placeholder="Enter your birthday">
<span data-validate="date" data-control="birthday" data-message="Your birthday must be a valid date"></span>
```

__Optional attributes__ : see the int validator

### **email** - Email address validation

You can use this validator to check en email address in an input control value.

```html
<input type="email" id="email" name="email" placeholder="Your email address">
<span data-validate="email" data-control="email" data-message="You must enter a valid email address"></span>
```

### **custom** - Custom validation

You can use this validator to perform complex validation that cannot be done with other validators
Note that the data-control and data-message attributes are not required with this validator

```html
<span data-validate="custom" data-function="myValidationFunction"></span>
```

```javascript
function myValidationFunction(args) {
  args.isValid = false;   // This will indicate that validation failed
  args.message = "You must enter a valid address";  // You can customize the validator message like that
}
```

## Localization

Dates and floating point numbers can be written in different ways depending on your country. Validators comes with a full localization engine.
You can define the locale to use using this method :

```javascript
validators.localization.setCurrentLocale("fr");
```

By the way, you can also extend validators with youre own localization parameters like this :

```javascript
validators.localization.addCustomLocale("myLocale", {
  dateFormat: /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/,
  dateFormatGroups: { days: 1, months: 2, years: 3, hours: 5, minutes: 6, seconds: 8 },
  decimalSeparator: ","
})
```

## Handling validation events

Validate forms with this utility is great but displaying user friendly messages to the user is better. Validators provides events for that.
You can customize the executed code during the validation process like this :

```javascript
// Event triggered when the validation begins
validators.onValidationBegin = function () {
  // For example, you can reset the validation state of all input controls
  $(".is-invalid").removeClass("is-invalid");
};

// Event triggered when a validator is checked
validators.onControlValidated = function (controlToValidate, validationStatus) {
  if (!validationStatus) {
    // For example, you can add a specific css class to the input control if its validation fails
    controlToValidate.addClass("is-invalid");
  }
};

// Event triggered when the validation ends
validators.onValidationEnd = function (validationStatus, validationMsgTab) {
  if (!validationStatus) {
    // For example, you can display an error message if the validation fails
    alert("The form contains some errors :\n - " + validationMsgTab.join("\n - "));
  }
};
```

## Validation groups

You can build complex validation scenarios using validation groups. For example, you can choose to validate or not some form fields according to a selected mode.

Example :

```html
<input type="email" id="email" name="email" placeholder="Your email address">
<span data-validate="required" data-control="email" data-message="You must enter an email address" data-validationgroup="user_add"></span>
<span data-validate="email" data-control="email" data-message="You must enter a valid email address"></span>
```

```javascript
validators.validate("user_add");  // This will only validate the required validator
validators.validate();  // This will validate all validators
```

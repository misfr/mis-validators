/**
 * Validators main script
 * 
 * @author Frederic BAYLE
 */

/// <reference path="validators.l10n.ts" />

namespace Validators {
  /**
   * Custom validator arguments
   */
  class CustomValidatorArguments {
    /**
     * Validation status
     */
    public isValid: boolean = true;

    /**
     * Message to display on validation fail
     */
    public message: string|undefined = undefined;
  }

  /**
   * Validation begining event
   * 
   * This function must be overrided
   * 
   * @event
   */
  export var onValidationBegin: () => void = function () {
  }

  /**
   * Input control Validation event
   * 
   * This function must be overrided
   * 
   * @param pControlToValidate Input control to validate JQuery object
   * @param pValidationStatus  True on success, otherwise false
   * @event
   */
  export var onControlValidated: (pControlToValidate: JQuery, pValidationStatus: boolean) => void = function (pControlToValidate: JQuery, pValidationStatus: boolean) {
  }

  /**
   * Validation ending event
   * 
   * This function must be overrided
   * 
   * @param pValidationStatus True on success, otherwise false
   * @param pValidationMsgTab Validation messages array
   * @event
   */
  export var onValidationEnd: (pValidationStatus: boolean, pValidationMsgTab: string[]) => void = function (pValidationStatus: boolean, pValidationMsgTab: string[]) {
  }

  /**
   * Validate input controls
   * 
   * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
   * @returns                  True on success, otherwise false
   */
  export function validate(pValidationGroup?: string): boolean {
    // Initialize validation group
    if (pValidationGroup === undefined) {
      pValidationGroup = "";
    }

    // Other initializations
    let validationMsgTab: string[] = [];
    let validationStatus: boolean = true;

    // Validation begining event
    onValidationBegin();

    // For each validator
    $('*[data-validate]').each(function () {
      // Get the control to validate if not a custom validator
      let controlToValidate: JQuery = $();
      if($(this).data("validate") != "custom") {
        controlToValidate = $("#" + $(this).data("control"));
        if (controlToValidate.length == 0) {
          throw "Unable to find the control to validate : " + $(this).data("control") + ".";
        }
      }

      // Check if we must validate this control
      var validateControl = false;
      if ($.trim(<string>pValidationGroup) === "") {
        // No validation group specified, validate all the input controls
        validateControl = true;
      }
      else if ($(this).data("validationgroup")) {
        // A validation group is specified, check if the input control must be validated
        if (("," + pValidationGroup + ",").indexOf("," + $(this).data("validationgroup") + ",") >= 0) {
          // We must validate the input control
          validateControl = true;
        }
      }

      let ctrlValidationStatus: boolean = true;

      // Custom validation
      if ($(this).data("validate") === "custom" && validateControl === true) {
        let customArguments: CustomValidatorArguments = new CustomValidatorArguments();
        validateCustom(customArguments, $(this));
        if (!customArguments.isValid) {
          validationStatus = false;
          if(customArguments.message) {
            validationMsgTab.push(customArguments.message);
          }
        }
      }

      // Required field
      if ($(this).data("validate") === "required" && validateControl === true) {
        ctrlValidationStatus = validateRequired(controlToValidate);
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Regex 
      if ($(this).data("validate") === "regexp" && validateControl === true) {
        ctrlValidationStatus = validateRegexp(controlToValidate, $(this));
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Int number
      if ($(this).data("validate") === "int" && validateControl === true) {
        ctrlValidationStatus = validateInt(controlToValidate, $(this));
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Float number
      if ($(this).data("validate") === "float" && validateControl === true) {
        ctrlValidationStatus = validateFloat(controlToValidate, $(this));
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Date
      if ($(this).data("validate") === "date" && validateControl === true) {
        ctrlValidationStatus = validateDate(controlToValidate, $(this));
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Email address
      if ($(this).data("validate") === "email" && validateControl === true) {
        ctrlValidationStatus = validateEmailAddress(controlToValidate);
        if (!ctrlValidationStatus) {
          validationStatus = false;
          validationMsgTab.push($(this).data('message'));
        }
      }

      // Control validated event
      onControlValidated(controlToValidate, ctrlValidationStatus);
    });

    // Validation ending event
    onValidationEnd(validationStatus, validationMsgTab);

    return validationStatus;
  };

  /**
   * Get a string representation of an input control value
   * 
   * @param   pJQueryObj JQuery object corresponding to the input control to validate
   * @returns            String value
   */
  function getControlValidationValue(pJQueryObj: JQuery): string {
    // Use the value attribute by default
    let returnValue: number|string|string[]|undefined = pJQueryObj.val();

    if (pJQueryObj.prop("tagName").toLowerCase() === "input") {
      if (pJQueryObj.prop("type").toLowerCase() === "checkbox" ||
        pJQueryObj.prop("type").toLowerCase() === "radio") {
        // For checkboxes or radiobuttons, return empty if unchecked
        returnValue = pJQueryObj.is(":checked") === true ? <string>pJQueryObj.attr("value") : "";
      }
    }

    // Ensure that returnValue is a string
    if(returnValue === undefined) {
      returnValue = "";
    }
    else if(typeof(returnValue) == "number") {
      returnValue = returnValue.toString();
    }
    else if(returnValue instanceof Array) {
      returnValue = returnValue.join(",");
    }

    return returnValue;
  };

  /**
   * Required field validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @returns             True if not empty, otherwise false
   */
  function validateRequired(pJQueryObj: JQuery): boolean {
    if (getControlValidationValue(pJQueryObj) == "") {
      return false;
    }
    return true;
  };

  /**
   * Custom validation
   * 
   * @param   pArgs         Custom validator arguments
   * @param   pValidatorObj JQuery object corresponding to the validator
   */
  function validateCustom(pArgs: CustomValidatorArguments, pValidatorObj: JQuery): void {
    if(!$(pValidatorObj).data("function")) {
      throw "You must define the data-function attribute in a custom validator.";
    }
    let cbFunction = new Function("pArgs", pValidatorObj.data('function') + "(pArgs);");
    cbFunction(pArgs);
  };

  /**
   * Regular expression validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @param   pValidatorObj JQuery object corresponding to the validator
   * @returns               True on success, otherwise false
   */
  function validateRegexp(pJQueryObj: JQuery, pValidatorObj: JQuery) {
    if(!$(pValidatorObj).data("pattern")) {
      throw "You must define the data-pattern attribute in a regexp validator.";
    }

    if (getControlValidationValue(pJQueryObj) != "") {
      var rxValidation: RegExp = new RegExp(pValidatorObj.data('pattern'));
      if (!rxValidation.test(getControlValidationValue(pJQueryObj))) {
        return false;
      }
    }
    return true;
  };

  /**
   * Int number validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @param   pValidatorObj JQuery object corresponding to the validator
   * @returns               True on success, otherwise false
   */
  function validateInt(pJQueryObj: JQuery, pValidatorObj: JQuery): boolean {
    if (getControlValidationValue(pJQueryObj) != "") {
      let controlValue: number | undefined = undefined;
      if (!/^-?[0-9]+$/.test(getControlValidationValue(pJQueryObj))) {
        return false;
      }
      controlValue = parseInt(getControlValidationValue(pJQueryObj), 10);

      // We must compare the value
      if (pValidatorObj.data("operator")) {
        if($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
          throw "You must define the data-comparecontrol or the data-comparevalue attribute in an int validator.";
        }

        let compareValue: number | string | undefined = undefined;
        if (pValidatorObj.data('comparecontrol')) {
          compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol')));
        }
        else {
          compareValue = pValidatorObj.data('comparevalue');
        }
        if (!/^-?[0-9]+$/.test(<string>compareValue)) {
          return false;
        }
        compareValue = parseInt(<string>compareValue, 10);

        switch (pValidatorObj.data("operator")) {
          case "equal":
            return (controlValue === compareValue);
          case "notequal":
            return (controlValue !== compareValue);
          case "greaterthan":
            return (controlValue > compareValue);
          case "lessthan":
            return (controlValue < compareValue);
          case "greaterthanequal":
            return (controlValue >= compareValue);
          case "lessthanequal":
            return (controlValue <= compareValue);
          case "range":
            if($(pValidatorObj).data("comparemaxvalue") === undefined) {
              throw "You must define the data-comparemaxvalue attribute in an int range validator.";
            }
            let compareMaxValue: number = parseInt(pValidatorObj.data('comparemaxvalue'), 10);
            return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
          default:
            throw "Unknown validator operator";
        }
      }
    }

    return true;
  };

  /**
   * Float number validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @param   pValidatorObj JQuery object corresponding to the validator
   * @returns               True on success, otherwise false
   */
  function validateFloat(pJQueryObj: JQuery, pValidatorObj: JQuery): boolean {
    if (getControlValidationValue(pJQueryObj) != "") {
      let controlValue: number | string | undefined = getControlValidationValue(pJQueryObj).replace(/[\.,]/g, ".");
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(controlValue)) {
        return false;
      }
      controlValue = parseFloat(controlValue);

      // We must compare the value
      if (pValidatorObj.data("operator")) {
        if($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
          throw "You must define the data-comparecontrol or the data-comparevalue attribute in a float number validator.";
        }

        let compareValue: string | number | undefined = undefined;
        if (pValidatorObj.data('comparecontrol')) {
          compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol'))).replace(/[\.,]/g, '.');
        }
        else {
          compareValue = (pValidatorObj.data('comparevalue') + "").replace(/[\.,]/g, '.');
        }
        if (!/^-?[0-9]+(\.[0-9]+)?$/.test(<string>compareValue)) {
          return false;
        }
        compareValue = parseFloat(<string>compareValue);

        switch (pValidatorObj.data("operator")) {
          case "equal":
            return (controlValue === compareValue);
          case "notequal":
            return (controlValue !== compareValue);
          case "greaterthan":
            return (controlValue > compareValue);
          case "lessthan":
            return (controlValue < compareValue);
          case "greaterthanequal":
            return (controlValue >= compareValue);
          case "lessthanequal":
            return (controlValue <= compareValue);
          case "range":
            if($(pValidatorObj).data("comparemaxvalue") === undefined) {
              throw "You must define the data-comparemaxvalue attribute in a float number range validator.";
            }
            let compareMaxValue: number = parseFloat((pValidatorObj.data('comparemaxvalue') + "").replace(/[\.,]/g, '.'));
            return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
          default:
            throw "Unknown validator operator";
        }
      }
    }

    return true;
  };

  /**
   * Date validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @param   pValidatorObj JQuery object corresponding to the validator
   * @returns               True on success, otherwise false
   */
  function validateDate(pJQueryObj: JQuery, pValidatorObj: JQuery): boolean {
    if (getControlValidationValue(pJQueryObj) != "") {
      let controlValue: Date | undefined = parseDate(getControlValidationValue(pJQueryObj));
      if (controlValue === undefined) {
        return false;
      }

      // We must compare the value
      if (pValidatorObj.data("operator")) {
        if($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
          throw "You must define the data-comparecontrol or the data-comparevalue attribute in a date validator.";
        }

        let compareValue: Date | string | undefined = undefined;
        if (pValidatorObj.data('comparecontrol')) {
          compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol')));
        }
        else {
          compareValue = pValidatorObj.data('comparevalue');
        }
        compareValue = parseDate(<string>compareValue);
        if (compareValue === undefined) {
          return false;
        }

        switch (pValidatorObj.data("operator")) {
          case "equal":
            return (controlValue === compareValue);
          case "notequal":
            return (controlValue !== compareValue);
          case "greaterthan":
            return (controlValue > compareValue);
          case "lessthan":
            return (controlValue < compareValue);
          case "greaterthanequal":
            return (controlValue >= compareValue);
          case "lessthanequal":
            return (controlValue <= compareValue);
          case "range":
            if($(pValidatorObj).data("comparemaxvalue") === undefined) {
              throw "You must define the data-comparemaxvalue attribute in a date range validator.";
            }
            let compareMaxValue: Date | undefined = parseDate(pValidatorObj.data('comparemaxvalue'));
            if (compareMaxValue === undefined) {
              return false;
            }
            return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
          default:
            throw "Unknown validator operator";
        }
      }
    }

    return true;
  };

  /**
   * Email address validation
   * 
   * @param   pJQueryObj    JQuery object corresponding to the input control to validate
   * @returns               True on success, otherwise false
   */
  function validateEmailAddress(pJQueryObj: JQuery): boolean {
    if (getControlValidationValue(pJQueryObj) != "") {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(getControlValidationValue(pJQueryObj))) {
        return false;
      }
    }
    return true;
  };

  /**
   * Try to convert a string to a Date object
   * 
   * @param    pInputValue String to convert
   * @returns              Date object on success, otherwise undefined
   */
  export function parseDate(pInputValue: string): Date | undefined {
    // International format yyyy-mm-dd
    let rxTester = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?$/;
    let rxGroups: L10n.DateFormatGroups = { day: 3, month: 2, year: 1, hour: 5, minutes: 6, seconds: 8 };
    let nbDaysMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // First, check the international date pattern
    if (!rxTester.test(pInputValue)) {
      // Fail, check french format
      rxTester = L10n.currentLocale.dateFormat;
      rxGroups = L10n.currentLocale.dateFormatGroups;
      if (!rxTester.test(pInputValue)) {
        return undefined;
      }
    }

    // Extract date parts
    let rxResult: RegExpExecArray = <RegExpExecArray>rxTester.exec(pInputValue);
    let month: number = parseInt(rxResult[rxGroups.month], 10) - 1;
    let day: number = parseInt(rxResult[rxGroups.day], 10);
    let year: number = parseInt(rxResult[rxGroups.year], 10);
    let hour: number = 0;
    let minutes: number = 0;
    let seconds: number = 0;
    if (rxResult[rxGroups.hour] !== undefined) {
      // Hour specified, parse it
      hour = parseInt(rxResult[rxGroups.hour], 10);
      minutes = parseInt(rxResult[rxGroups.minutes], 10);
      if (rxResult[rxGroups.seconds] !== undefined) {
        seconds = parseInt(rxResult[rxGroups.seconds], 10);
      }
    }

    // Adjust the number of days in February for leap years
    if (year % 4 === 0) {
      nbDaysMonth[1] = 29;
    }

    // Check date parts ranges
    if (month < 0 || month > 11 || day < 1 || day > nbDaysMonth[month]) {
      return undefined;
    }
    // Check hour parts ranges
    if (hour < 0 || hour > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return undefined;
    }

    // Success, return a Date object
    return new Date(year, month, day, hour, minutes, seconds);
  };
}

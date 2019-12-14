
/**
 * MIS validators main module
 * @author Frederic BAYLE
 */

import { L10n } from "./l10n";
import { onValidationBeginType, onControlValidatedType, onValidationEndType, CustomValidatorArguments } from "./models";
import { DateFormatGroupsType } from "./l10n/models";

/**
 * MIS validators main class
 */
export class Validators {
  
  /**
   * Localization utilities
   */
  protected _localization: L10n;

  /**
   * Validation begining event
   * This function must be overrided
   */
  public onValidationBegin: onValidationBeginType = () => {
  };

  /**
   * Input control Validation event
   * This function must be overrided
   * @param pControlToValidate Input control to validate
   * @param pValidationStatus  True on success, otherwise false
   */
  public onControlValidated: onControlValidatedType = (pControlToValidate: HTMLElement, pValidationStatus: boolean) => {
  };

  /**
   * Validation ending event
   * This function must be overrided
   * @param pValidationStatus True on success, otherwise false
   * @param pValidationMsgTab Validation messages array
   */
  public onValidationEnd: onValidationEndType = (pValidationStatus: boolean, pValidationMsgTab: string[]) => {
  };

  /**
   * Class constructor
   * @param pLocale Locale to use
   */
  constructor(pLocale?: string) {
    this._localization = new L10n();
    if(pLocale) {
      this._localization.setCurrentLocale(pLocale);
    }
  }

  /**
   * Loop into the validators
   */
  protected forEachValidator(pCallback: (pElt: HTMLElement) => void) {
    let elementsToValidate = document.getElementsByTagName("*");
    for(let i = 0; i < elementsToValidate.length; i++) {
      if("validate" in (<HTMLElement>elementsToValidate[i]).dataset) {
        // We must validate the element, execute the callback function
        pCallback(<HTMLElement>elementsToValidate[i]);
      }
    }
  }

  /**
   * Get a string representation of an input control value
   * @param   pElt  HTML element corresponding to the input control to validate
   * @returns       String value
   */
  protected getControlValidationValue(pElt: HTMLElement): string {
    let returnValue:string = "";

    switch (pElt.tagName.toLowerCase()) {
      case "select":    // Select HTML element
        for(let i = 0; i < (<HTMLSelectElement>pElt).options.length; i++) {
          if((<HTMLSelectElement>pElt).options[i].selected) {
            returnValue += (returnValue == "" ? "" : ",") + ((<HTMLSelectElement>pElt).options[i].value||"");
          }
        }
        break;

      case "textarea":    // Textarea HTML element
        returnValue = "" + ((<HTMLTextAreaElement>pElt).value||"");
        break;

      case "input":    // Input HTML element
        if ((<HTMLInputElement>pElt).type.toLowerCase() == "checkbox" ||
            (<HTMLInputElement>pElt).type.toLowerCase() == "radio") {
          // For checkboxes or radiobuttons, return empty if unchecked
          returnValue = "" + ((<HTMLInputElement>pElt).checked === true ? ((<HTMLTextAreaElement>pElt).value||"") : "");
        }
        else {
          // Otherwise, simply return the element's value
          returnValue = "" + ((<HTMLTextAreaElement>pElt).value||"");
        }
        break;

      default:
        throw new Error("The element to validate must be an input, select or textarea");        
    }

    return returnValue;
  };

  /**
   * Get localization utilities
   * @returns Localization utilities
   */
  public get localization() {
    return this._localization;
  }

  /**
   * Validate input controls
   * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
   * @returns                  True on success, otherwise false
   */
  public validate(pValidationGroup?: string): boolean {
    // Initialize validation group
    pValidationGroup = pValidationGroup || "";

    // Other initializations
    let validationMsgTab: string[] = [];
    let validationStatus: boolean = true;

    // Validation begining event
    this.onValidationBegin();

    // For each validator
    this.forEachValidator((pValidatorElt: HTMLElement) => {
      let controlToValidate: HTMLElement|null = null;

      // If not a custom validator
      if(pValidatorElt.dataset.validate != "custom") {
        // Ensure that we have a validation message
        if(!("message" in pValidatorElt.dataset)) {
          throw new Error("You must specify the validation message using the data-message attribute");          
        }

        // Try to get the control to validate
        if(!("control" in pValidatorElt.dataset)) {
          throw new Error("You must specify the control to validate using the data-control attribute");          
        }
        controlToValidate = document.getElementById(<string>pValidatorElt.dataset.control);
        if (!controlToValidate) {
          throw new Error("Unable to find the control to validate : " + pValidatorElt.dataset.control + ".");
        }
      }

      // Check if we must check this validator
      var checkValidator = false;
      if (pValidationGroup?.trim() == "") {
        // No validation group specified, must validate all validators
        checkValidator = true;
      }
      else if ("validationgroup" in pValidatorElt.dataset) {
        // A validation group is specified, check if this validator must be checked
        if (("," + pValidationGroup + ",").indexOf("," + pValidatorElt.dataset.validationgroup + ",") >= 0) {
          // We must check this validator
          checkValidator = true;
        }
      }

      // Check if validator is enabled or not
      if(pValidatorElt.dataset.enabled == "false") {
        checkValidator = false;
      }

      let validatorValidationStatus: boolean = true;

      // Custom validation
      if (pValidatorElt.dataset.validate == "custom" && checkValidator) {
        let customArguments: CustomValidatorArguments = new CustomValidatorArguments();
        this.validateCustom(customArguments, pValidatorElt);
        if (!customArguments.isValid) {
          validationStatus = false;
          if(customArguments.message) {
            validationMsgTab.push(customArguments.message);
          }
        }
      }

      // Required field
      if (pValidatorElt.dataset.validate == "required" && checkValidator) {
        validatorValidationStatus = this.validateRequired(<HTMLElement>controlToValidate);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Regex 
      if (pValidatorElt.dataset.validate == "regexp" && checkValidator) {
        validatorValidationStatus = this.validateRegexp(<HTMLElement>controlToValidate, pValidatorElt);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Int number
      if (pValidatorElt.dataset.validate == "int" && checkValidator) {
        validatorValidationStatus = this.validateInt(<HTMLElement>controlToValidate, pValidatorElt);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Float number
      if (pValidatorElt.dataset.validate == "float" && checkValidator) {
        validatorValidationStatus = this.validateFloat(<HTMLElement>controlToValidate, pValidatorElt);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Date
      if (pValidatorElt.dataset.validate == "date" && checkValidator) {
        validatorValidationStatus = this.validateDate(<HTMLElement>controlToValidate, pValidatorElt);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Email address
      if (pValidatorElt.dataset.validate == "email" && checkValidator) {
        validatorValidationStatus = this.validateEmailAddress(<HTMLElement>controlToValidate);
        if (!validatorValidationStatus) {
          validationStatus = false;
          validationMsgTab.push(<string>pValidatorElt.dataset.message);
        }
      }

      // Control validated event
      this.onControlValidated(<HTMLElement>controlToValidate, validationStatus);
    });

    // Validation ending event
    this.onValidationEnd(validationStatus, validationMsgTab);

    return validationStatus;
  }

  /**
   * Required field validation
   * @param   pElt    Element corresponding to the input control to validate
   * @returns         True if not empty, otherwise false
   */
  protected validateRequired(pElt: HTMLElement): boolean {
    if (this.getControlValidationValue(pElt) == "") {
      return false;
    }
    return true;
  }

  /**
   * Custom validation
   * @param   pArgs         Custom validator arguments
   * @param   pValidatorElt Element corresponding to the validator
   */
  protected validateCustom(pArgs: CustomValidatorArguments, pValidatorElt: HTMLElement): void {
    if(!("function" in pValidatorElt.dataset)) {
      throw new Error("You must define the data-function attribute in a custom validator.");
    }
    let cbFunction = new Function("pArgs", pValidatorElt.dataset.function + "(pArgs);");
    cbFunction(pArgs);
  }

  /**
   * Regular expression validation
   * @param   pElt          Element corresponding to the input control to validate
   * @param   pValidatorElt Element corresponding to the validator
   * @returns               True on success, otherwise false
   */
  protected validateRegexp(pElt: HTMLElement, pValidatorElt: HTMLElement) {
    if(!("pattern" in pValidatorElt.dataset)) {
      throw new Error("You must define the data-pattern attribute in a regexp validator.");
    }

    if (this.getControlValidationValue(pElt) != "") {
      let rxValidation: RegExp = new RegExp(<string>pValidatorElt.dataset.pattern);
      if (!rxValidation.test(this.getControlValidationValue(pElt))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Int number validation
   * @param   pElt          Element corresponding to the input control to validate
   * @param   pValidatorElt Element corresponding to the validator
   * @returns               True on success, otherwise false
   */
  protected validateInt(pElt: HTMLElement, pValidatorElt: HTMLElement): boolean {
    if (this.getControlValidationValue(pElt) != "") {
      let controlValue: number | undefined = undefined;
      if (!/^-?[0-9]+$/.test(this.getControlValidationValue(pElt))) {
        return false;
      }
      controlValue = parseInt(this.getControlValidationValue(pElt), 10);

      // We must compare the value
      if ("operator" in pValidatorElt.dataset) {
        if(!("comparecontrol" in pValidatorElt.dataset) && !("comparevalue" in pValidatorElt.dataset)) {
          throw new Error("You must define the data-comparecontrol or the data-comparevalue attribute in an int validator.");
        }

        let compareValue: number | string | undefined = undefined;
        if ("comparecontrol" in pValidatorElt.dataset) {
          let compareControl = document.getElementById(<string>pValidatorElt.dataset.comparecontrol);
          if(!compareControl) {
            throw new Error("Unable to find the control to compare : " + pValidatorElt.dataset.comparecontrol + ".");
          }
          compareValue = this.getControlValidationValue(compareControl);
        }
        else {
          compareValue = pValidatorElt.dataset.comparevalue;
        }
        if (!/^-?[0-9]+$/.test(<string>compareValue)) {
          return false;
        }
        compareValue = parseInt(<string>compareValue, 10);

        switch (pValidatorElt.dataset.operator) {
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
            if(!("comparemaxvalue" in pValidatorElt.dataset)) {
              throw new Error("You must define the data-comparemaxvalue attribute in an int range validator.");
            }
            let compareMaxValue: number = parseInt(<string>pValidatorElt.dataset.comparemaxvalue, 10);
            return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
          default:
            throw new Error("Unknown validator operator : " + pValidatorElt.dataset.operator + ".");
        }
      }
    }

    return true;
  }

  /**
   * Float number validation
   * @param   pElt          Element corresponding to the input control to validate
   * @param   pValidatorElt Element corresponding to the validator
   * @returns               True on success, otherwise false
   */
  protected validateFloat(pElt: HTMLElement, pValidatorElt: HTMLElement): boolean {
    if (this.getControlValidationValue(pElt) != "") {
      let controlValue: number | string | undefined = this.getControlValidationValue(pElt).replace(/[\.,]/g, ".");
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(controlValue)) {
        return false;
      }
      controlValue = parseFloat(controlValue);

      // We must compare the value
      if ("operator" in pValidatorElt.dataset) {
        if(!("comparecontrol" in pValidatorElt.dataset) && !("comparevalue" in pValidatorElt.dataset)) {
          throw new Error("You must define the data-comparecontrol or the data-comparevalue attribute in an float validator.");
        }

        let compareValue: string | number | undefined = undefined;
        if ("comparecontrol" in pValidatorElt.dataset) {
          let compareControl = document.getElementById(<string>pValidatorElt.dataset.comparecontrol);
          if(!compareControl) {
            throw new Error("Unable to find the control to compare : " + pValidatorElt.dataset.comparecontrol + ".");
          }
          compareValue = this.getControlValidationValue(compareControl);
        }
        else {
          compareValue = pValidatorElt.dataset.comparevalue;
        }
        if (!/^-?[0-9]+(\.[0-9]+)?$/.test(<string>compareValue)) {
          return false;
        }
        compareValue = parseFloat(<string>compareValue);

        switch (pValidatorElt.dataset.operator) {
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
            if(!("comparemaxvalue" in pValidatorElt.dataset)) {
              throw new Error("You must define the data-comparemaxvalue attribute in a float number range validator.");
            }
            let compareMaxValue: number = parseFloat((<string>pValidatorElt.dataset.comparemaxvalue + "").replace(/[\.,]/g, '.'));
            return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
          default:
            throw new Error("Unknown validator operator : " + pValidatorElt.dataset.operator + ".");
        }
      }
    }

    return true;
  }

  /**
   * Date validation
   * @param   pElt          Element corresponding to the input control to validate
   * @param   pValidatorElt Element corresponding to the validator
   * @returns               True on success, otherwise false
   */
  protected validateDate(pElt: HTMLElement, pValidatorElt: HTMLElement): boolean {
    if (this.getControlValidationValue(pElt) != "") {
      let controlValue: Date | undefined = this.parseDate(this.getControlValidationValue(pElt));
      if (controlValue === undefined) {
        return false;
      }

      // We must compare the value
      if ("operator" in pValidatorElt.dataset) {
        if(!("comparecontrol" in pValidatorElt.dataset) && !("comparevalue" in pValidatorElt.dataset)) {
          throw new Error("You must define the data-comparecontrol or the data-comparevalue attribute in an date validator.");
        }

        let compareValue: Date | string | undefined = undefined;
        if ("comparecontrol" in pValidatorElt.dataset) {
          let compareControl = document.getElementById(<string>pValidatorElt.dataset.comparecontrol);
          if(!compareControl) {
            throw new Error("Unable to find the control to compare : " + pValidatorElt.dataset.comparecontrol + ".");
          }
          compareValue = this.getControlValidationValue(compareControl);
        }
        else {
          compareValue = pValidatorElt.dataset.comparevalue;
        }
        compareValue = this.parseDate(<string>compareValue);
        if (compareValue === undefined) {
          return false;
        }

        switch (pValidatorElt.dataset.operator) {
          case "equal":
            return (controlValue.getTime() == compareValue.getTime());
          case "notequal":
            return (controlValue.getTime() != compareValue.getTime());
          case "greaterthan":
            return (controlValue.getTime() > compareValue.getTime());
          case "lessthan":
            return (controlValue.getTime() < compareValue.getTime());
          case "greaterthanequal":
            return (controlValue.getTime() >= compareValue.getTime());
          case "lessthanequal":
            return (controlValue.getTime() <= compareValue.getTime());
          case "range":
            if(!("comparemaxvalue" in pValidatorElt.dataset)) {
              throw new Error("You must define the data-comparemaxvalue attribute in a date range validator.");
            }
            let compareMaxValue: Date | undefined = this.parseDate(<string>pValidatorElt.dataset.comparemaxvalue);
            if (compareMaxValue === undefined) {
              return false;
            }
            return (controlValue.getTime() >= compareValue.getTime()) && (controlValue.getTime() <= compareMaxValue.getTime());
          default:
            throw new Error("Unknown validator operator : " + pValidatorElt.dataset.operator + ".");
        }
      }
    }

    return true;
  }

  /**
   * Email address validation
   * @param   pElt    Element corresponding to the input control to validate
   * @returns         True on success, otherwise false
   */
  protected validateEmailAddress(pElt: HTMLElement): boolean {
    if (this.getControlValidationValue(pElt) != "") {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(this.getControlValidationValue(pElt))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Try to convert a string to a Date object
   * @param    pInputValue String to convert
   * @returns              Date object on success, otherwise undefined
   */
  public parseDate(pInputValue: string): Date | undefined {
    // International format [yyyy-mm-dd hh:mm:ss] or ISO format [yyyy-mm-ddThh:mm:ss]
    let rxTester = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})([\sT]+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/;
    let rxGroups: DateFormatGroupsType = { days: 3, months: 2, years: 1, hours: 5, minutes: 6, seconds: 8 };
    let nbDaysMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // First, check the international date pattern
    if (!rxTester.test(pInputValue)) {
      // Fail, check french format
      rxTester = this.localization.currentLocale.dateFormat;
      rxGroups = this.localization.currentLocale.dateFormatGroups;
      if (!rxTester.test(pInputValue)) {
        return undefined;
      }
    }

    // Extract date parts
    let rxResult: RegExpExecArray = <RegExpExecArray>rxTester.exec(pInputValue);
    let month: number = parseInt(rxResult[rxGroups.months], 10) - 1;
    let day: number = parseInt(rxResult[rxGroups.days], 10);
    let year: number = parseInt(rxResult[rxGroups.years], 10);
    let hour: number = 0;
    let minutes: number = 0;
    let seconds: number = 0;
    if (rxResult[rxGroups.hours] !== undefined) {
      // Hour specified, parse it
      hour = parseInt(rxResult[rxGroups.hours], 10);
      minutes = parseInt(rxResult[rxGroups.minutes], 10);
      if (rxResult[rxGroups.seconds] !== undefined) {
        seconds = parseInt(rxResult[rxGroups.seconds], 10);
      }
    }

    // Adjust the number of days in February for leap years
    if (year % 4 == 0) {
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
  }

}

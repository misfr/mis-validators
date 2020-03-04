/**
 * MIS validators main module
 * @author Frederic BAYLE
 */

import moment from "moment";
import { onValidationBeginType, onControlValidatedType, onValidationEndType, CustomValidatorArguments } from "./models";

/**
 * MIS validators main class
 */
export class Validators {

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
   * @param pLocale Locale to use (provided for convenience set the locale that moment.js will use)
   */
  constructor(pLocale?: string) {
    if(pLocale) {
      moment.locale(pLocale);
    }
  }

  /**
   * Get a flag that indicates wheter we should check this validator or not
   * @param     pValidator        Validator
   * @param     pValidationGroup  Validation group
   * @returns                     Result : true if we must check this validator, otherwise false
   */
  protected checkValidator(pValidator: HTMLElement, pValidationGroup?: string): boolean {
    let returnValue: boolean = false;

    // Initialize validation group
    pValidationGroup = pValidationGroup || "";

    if (pValidationGroup?.trim() == "") {
      // No validation group specified, must validate all validators
      returnValue = true;
    }
    else if ("validationgroup" in pValidator.dataset) {
      // A validation group is specified, check if this validator must be checked
      if (("," + pValidationGroup + ",").indexOf("," + pValidator.dataset.validationgroup + ",") >= 0) {
        // We must check this validator
        returnValue = true;
      }
    }

    // Check if validator is enabled or not
    if(pValidator.dataset.enabled == "false") {
      returnValue = false;
    }

    return returnValue;
  }

  /**
   * Get the control to validate
   * @param     pValidator  Validator
   * @returns               Control to validate
   */
  protected getControlToValidate(pValidator: HTMLElement): HTMLElement|null {
    let returnValue: HTMLElement|null = null;    

    // If not a custom validator
    if(pValidator.dataset.validate != "custom") {
      // Ensure that we have a validation message
      if(!("message" in pValidator.dataset)) {
        throw new Error("You must specify the validation message using the data-message attribute");          
      }

      // Try to get the control to validate
      if(!("control" in pValidator.dataset)) {
        throw new Error("You must specify the control to validate using the data-control attribute");          
      }
      returnValue = document.getElementById(<string>pValidator.dataset.control);
      if (!returnValue) {
        throw new Error("Unable to find the control to validate : " + pValidator.dataset.control + ".");
      }
    }

    return returnValue;
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
   * Get validators
   * @returns validators
   */
  protected getValidators(): HTMLElement[] {
    let elements = document.getElementsByTagName("*");
    let returnValue: HTMLElement[] = [];
    for(let i = 0; i < elements.length; i++) {
      if("validate" in (<HTMLElement>elements[i]).dataset) {
        // We must validate the element, add it to the result
        returnValue.push(<HTMLElement>elements[i]);
      }
    }
    return returnValue;
  }

  /**
   * Validate input controls
   * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
   * @returns                  True on success, otherwise false
   */
  public validate(pValidationGroup?: string): boolean {
    // Initializations
    let validationMsgTab: string[] = [];
    let validationStatus: boolean = true;
    let validators = this.getValidators();

    // Validation begining event
    this.onValidationBegin();

    // For each validator
    for(let i = 0; i < validators.length; i++) {
      let validatorValidationStatus: boolean = true;
      if(this.checkValidator(validators[i], pValidationGroup)) {
        let controlToValidate: HTMLElement|null = this.getControlToValidate(validators[i]);
        if (validators[i].dataset.validate == "custom") {
          // Custom validator
          let customArguments: CustomValidatorArguments = new CustomValidatorArguments();
          this.validateCustom(customArguments, validators[i]);
          this.onControlValidated(<HTMLElement>controlToValidate, customArguments.isValid);
          if (!customArguments.isValid) {
            validationStatus = false;
            if(customArguments.message) {
              validationMsgTab.push(customArguments.message);
            }
          }
        }
        else {
          // Common validators
          validatorValidationStatus = this.validateCommon(validators[i], controlToValidate);
          this.onControlValidated(<HTMLElement>controlToValidate, validatorValidationStatus);
          if (!validatorValidationStatus) {
            // Validation failed
            validationStatus = false;
            validationMsgTab.push(<string>validators[i].dataset.message);
          }
        }
      }
    }

    // Validation ending event
    this.onValidationEnd(validationStatus, validationMsgTab);

    return validationStatus;
  }

  /**
   * Validate input controls asynchronously
   * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
   * @returns                  Result promise : True on success, otherwise false
   */
  public async validateAsync(pValidationGroup?: string): Promise<boolean> {
    // Initializations
    let validationMsgTab: string[] = [];
    let validationStatus: boolean = true;
    let errorCaught = false;
    let validators = this.getValidators();

    // Validation begining event
    this.onValidationBegin();

    // For each validator
    for(let i = 0; i < validators.length; i++) {
      let validatorValidationStatus: boolean = true;
      if(this.checkValidator(validators[i], pValidationGroup)) {
        let controlToValidate: HTMLElement|null = this.getControlToValidate(validators[i]);
        if (validators[i].dataset.validate == "custom") {
          // Custom validator
          let customArguments = await this.validateCustomAsync(validators[i]);
          this.onControlValidated(<HTMLElement>controlToValidate, customArguments.isValid);
          if (!customArguments.isValid) {
            validationStatus = false;
            if(customArguments.message) {
              validationMsgTab.push(customArguments.message);
            }
          }
        }
        else {
          // Common validators
          validatorValidationStatus = this.validateCommon(validators[i], controlToValidate);
          this.onControlValidated(<HTMLElement>controlToValidate, validatorValidationStatus);
          if (!validatorValidationStatus) {
            // Validation failed
            validationStatus = false;
            validationMsgTab.push(<string>validators[i].dataset.message);
          }
        }
      }
    }

    return validationStatus;
  }

  /**
   * Validate common validators
   * @param     pValidator            Validator
   * @param     pControlToValidate    Control to validate
   * @returns                         Validation status (true if succes, otherwise false)
   */
  protected validateCommon(pValidator: HTMLElement, pControlToValidate: HTMLElement|null) {
    let returnValue: boolean = true;
    switch (pValidator.dataset.validate) {
      case "required":
        returnValue = this.validateRequired(<HTMLElement>pControlToValidate);
        break;
      case "regexp":
        returnValue = this.validateRegexp(<HTMLElement>pControlToValidate, pValidator);
        break;
      case "int":
        returnValue = this.validateInt(<HTMLElement>pControlToValidate, pValidator);
        break;
      case "float":
        returnValue = this.validateFloat(<HTMLElement>pControlToValidate, pValidator);
        break;
      case "date":
        returnValue = this.validateDate(<HTMLElement>pControlToValidate, pValidator);
        break;
      case "email":
        returnValue = this.validateEmailAddress(<HTMLElement>pControlToValidate);
        break;
    }
    return returnValue;
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
   * Custom async validation
   * @param   pValidatorElt Element corresponding to the validator
   * @returns               Result promise : custom validation arguments
   */
  protected validateCustomAsync(pValidatorElt: HTMLElement): Promise<CustomValidatorArguments> {
    return new Promise<CustomValidatorArguments>((resolve, reject) => {
      try {
        if(!("function" in pValidatorElt.dataset)) {
          throw new Error("You must define the data-function attribute in a custom validator.");
        }
        let cbFunction = new Function("resolve", "reject", pValidatorElt.dataset.function + "(resolve, reject);");
        cbFunction(resolve, reject);
      }
      catch(error) {
        reject(error);
      }
    });
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
      if (!(/^-?[0-9]+$/.test(this.getControlValidationValue(pElt)))) {
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
        if (!(/^-?[0-9]+$/.test(<string>compareValue))) {
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
      if (!(/^-?[0-9]+(\.[0-9]+)?$/.test(controlValue))) {
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
        if (!(/^-?[0-9]+(\.[0-9]+)?$/.test(<string>compareValue))) {
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
      if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(this.getControlValidationValue(pElt)))) {
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
    // Try to parse the input date
    let dateTester = moment(pInputValue, [
      moment.ISO_8601,  // ISO Format
      moment.HTML5_FMT.DATETIME_LOCAL_SECONDS,  //  YYYY-MM-DDTHH:mm:ss
      moment.HTML5_FMT.DATETIME_LOCAL,          //  YYYY-MM-DDTHH:mm
      moment.HTML5_FMT.DATE + " " + moment.HTML5_FMT.TIME_SECONDS,  // YYYY-MM-DD HH:mm:ss
      moment.HTML5_FMT.DATE + " " + moment.HTML5_FMT.TIME,          // YYYY-MM-DD HH:mm
      moment.HTML5_FMT.DATE,                                        // YYYY-MM-DD
      "L LTS",    // Locale DateTime with seconds
      "L LT",     // Locale DateTime
      "L"         // Locale Date
    ], true);

    if(!dateTester.isValid()) {
      // Fail, return undefined
      return undefined;
    }

    // Success, return a Date object
    return dateTester.toDate();
  }

}

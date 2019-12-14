/**
 * MIS validators models module
 * @author Frederic BAYLE
 */

/**
 * Custom validator arguments
 */
export class CustomValidatorArguments {

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
 * Validation begining event type
 */
export type onValidationBeginType = () => void;

/**
 * Input control Validation event type
 * @param pControlToValidate Input control to validate JQuery object
 * @param pValidationStatus  True on success, otherwise false
 */
export type onControlValidatedType = (pControlToValidate: HTMLElement, pValidationStatus: boolean) => void;

/**
 * Validation ending event type
 * @param pValidationStatus True on success, otherwise false
 * @param pValidationMsgTab Validation messages array
 */
export type onValidationEndType = (pValidationStatus: boolean, pValidationMsgTab: string[]) => void;

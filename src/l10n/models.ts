/**
 * MIS validators localization models module
 * @author Frederic BAYLE
 */

/**
 * TDate format regexp capture groups data type
 */
export type DateFormatGroupsType = {
  days: number,
  months: number,
  years: number,
  hours: number,
  minutes: number,
  seconds: number
};

/**
 * Localization parameters data type
 */
export type L10nParametersType = {
  dateFormat?: RegExp,
  dateFormatGroups?: DateFormatGroupsType,
  decimalSeparator?: string
};


/**
 * Localization parameters data
 */
export class L10nParameters {

  /**
   * Date format regexp
   */
  public dateFormat: RegExp = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/;

  /**
   * Date format regexp capture groups
   */
  public dateFormatGroups: DateFormatGroupsType = { days: 2, months: 1, years: 3, hours: 5, minutes: 6, seconds: 8 };

  /**
   * Decimal separator
   */
  public decimalSeparator: string = ".";

  /**
   * Create localization parameters from an object
   * @param     pObject   Input data
   * @returns             Localization parameters
   */
  public static fromObject(pObject: L10nParametersType) {
    let returnValue = new L10nParameters();
    for(let key in pObject) {
      (<any>returnValue)[key] = (<any>pObject)[key];
    }
    return returnValue;
  }

}

/**
 * MIS validators localization data module
 * @author Frederic BAYLE
 */

import { L10nParameters } from "./models";

/**
 * Localization data
 */
export const l10nData = {

  /**
   * Default : en-US
   */
  "en-US": new L10nParameters(),

  /**
   * French 
   */
  "fr": L10nParameters.fromObject({
    dateFormat: /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/,
    dateFormatGroups: { days: 1, months: 2, years: 3, hours: 5, minutes: 6, seconds: 8 },
    decimalSeparator: ","  
  })

};

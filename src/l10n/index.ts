/**
 * MIS validators localization utilities module
 * @author Frederic BAYLE
 */

import { L10nParameters } from "./models";
import { l10nData } from "./data";

/**
 * Localization utilities class
 */
export class L10n {

  /**
   * Current Localization
   */
  protected _currentLocale: string = "en-US";

  /**
   * Available locale
   */
  public _locales: {[key: string]: L10nParameters};

  /**
   * Class constructor
   */
  constructor() {
    this._locales = l10nData;
  }

  /**
   * Add a custom locale
   * @param pLocale                   Locale name
   * @param pLocalizationParameters   Localization parameters
   */
  public addCustomLocale(pLocale: string, pLocalizationParameters: L10nParameters) {
    this._locales[pLocale] = pLocalizationParameters;
  }

  /**
   * Get current localization parameters
   * @returns Current localization parameters
   */
  public get currentLocale(): L10nParameters {
    return this._locales[this._currentLocale];
  }

  /**
   * Set the locale to use
   * 
   * @param pLocale Locale to use
   */
  public setCurrentLocale(pLocale: string) {
    this._currentLocale = pLocale;
  }

}

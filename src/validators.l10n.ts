/**
 * Validators localization script
 * 
 * @author Frederic BAYLE
 */

namespace Validators.L10n {
  /**
   * Class that represents the date format regex groups
   */
  export class DateFormatGroups {
    public day: number = 2;
    public month: number = 1;
    public year: number = 3
    public hour: number = 5;
    public minutes: number = 6;
    public seconds: number = 8;
  }

  /**
   * Class that contains localization data
   */
  export class LocalizationData {
    /**
     * Locale name
     */
    public get name(): string { return this._name; }
    protected _name: string;

    /**
     * DateTime format
     */
    public dateFormat: RegExp = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/;

    /**
     * DateTime format regex groups
     */
    public dateFormatGroups: DateFormatGroups;

    /**
     * Decimal separator
     */
    public decimalSeparator: string = ".";

    /**
     * Class constructor
     * 
     * @param pName Name of the localization data
     */
    public constructor(pName: string) {
      // Initializations
      this.dateFormatGroups = new DateFormatGroups();
      this._name = pName;
    }
  }

  /**
   * Current Localization
   */
  export var currentLocale: LocalizationData;

  /**
   * Collection of localization data
   */
  export var locales: { [Key: string]: LocalizationData } = {};

  /**
   * Set the current application locale to use
   * 
   * @param pLocale Locale to use
   */
  export function setCurrentLocale(pLocale: string) {
    currentLocale = locales[pLocale];
  }
}

// Create the default locale (en)
Validators.L10n.locales["en"] = new Validators.L10n.LocalizationData("en");
Validators.L10n.setCurrentLocale("en");

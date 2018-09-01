/// <reference types="jquery" />
/**
 * Validators localization script
 *
 * @author Frederic BAYLE
 */
declare namespace Validators.L10n {
    /**
     * Class that represents the date format regex groups
     */
    class DateFormatGroups {
        day: number;
        month: number;
        year: number;
        hour: number;
        minutes: number;
        seconds: number;
    }
    /**
     * Class that contains localization data
     */
    class LocalizationData {
        /**
         * Locale name
         */
        readonly name: string;
        protected _name: string;
        /**
         * DateTime format
         */
        dateFormat: RegExp;
        /**
         * DateTime format regex groups
         */
        dateFormatGroups: DateFormatGroups;
        /**
         * Decimal separator
         */
        decimalSeparator: string;
        /**
         * Class constructor
         *
         * @param pName Name of the localization data
         */
        constructor(pName: string);
    }
    /**
     * Current Localization
     */
    var currentLocale: LocalizationData;
    /**
     * Collection of localization data
     */
    var locales: {
        [Key: string]: LocalizationData;
    };
    /**
     * Set the current application locale to use
     *
     * @param pLocale Locale to use
     */
    function setCurrentLocale(pLocale: string): void;
}
/**
 * Validators main script
 *
 * @author Frederic BAYLE
 */
declare namespace Validators {
    /**
     * Validation begining event
     *
     * This function must be overrided
     *
     * @event
     */
    var onValidationBegin: () => void;
    /**
     * Input control Validation event
     *
     * This function must be overrided
     *
     * @param pControlToValidate Input control to validate JQuery object
     * @param pValidationStatus  True on success, otherwise false
     * @event
     */
    var onControlValidated: (pControlToValidate: JQuery, pValidationStatus: boolean) => void;
    /**
     * Validation ending event
     *
     * This function must be overrided
     *
     * @param pValidationStatus True on success, otherwise false
     * @param pValidationMsgTab Validation messages array
     * @event
     */
    var onValidationEnd: (pValidationStatus: boolean, pValidationMsgTab: string[]) => void;
    /**
     * Validate input controls
     *
     * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
     * @returns                  True on success, otherwise false
     */
    function validate(pValidationGroup?: string): boolean;
    /**
     * Try to convert a string to a Date object
     *
     * @param    pInputValue String to convert
     * @returns              Date object on success, otherwise undefined
     */
    function parseDate(pInputValue: string): Date | undefined;
}
/**
 * Validators French localization script
 *
 * @author Frederic BAYLE
 */

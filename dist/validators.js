"use strict";
/**
 * Validators localization script
 *
 * @author Frederic BAYLE
 */
var Validators;
(function (Validators) {
    var L10n;
    (function (L10n) {
        /**
         * Class that represents the date format regex groups
         */
        var DateFormatGroups = /** @class */ (function () {
            function DateFormatGroups() {
                this.day = 2;
                this.month = 1;
                this.year = 3;
                this.hour = 5;
                this.minutes = 6;
                this.seconds = 8;
            }
            return DateFormatGroups;
        }());
        L10n.DateFormatGroups = DateFormatGroups;
        /**
         * Class that contains localization data
         */
        var LocalizationData = /** @class */ (function () {
            /**
             * Class constructor
             *
             * @param pName Name of the localization data
             */
            function LocalizationData(pName) {
                /**
                 * DateTime format
                 */
                this.dateFormat = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/;
                /**
                 * Decimal separator
                 */
                this.decimalSeparator = ".";
                // Initializations
                this.dateFormatGroups = new DateFormatGroups();
                this._name = pName;
            }
            Object.defineProperty(LocalizationData.prototype, "name", {
                /**
                 * Locale name
                 */
                get: function () { return this._name; },
                enumerable: true,
                configurable: true
            });
            return LocalizationData;
        }());
        L10n.LocalizationData = LocalizationData;
        /**
         * Collection of localization data
         */
        L10n.locales = {};
        /**
         * Set the current application locale to use
         *
         * @param pLocale Locale to use
         */
        function setCurrentLocale(pLocale) {
            L10n.currentLocale = L10n.locales[pLocale];
        }
        L10n.setCurrentLocale = setCurrentLocale;
    })(L10n = Validators.L10n || (Validators.L10n = {}));
})(Validators || (Validators = {}));
// Create the default locale (en)
Validators.L10n.locales["en"] = new Validators.L10n.LocalizationData("en");
Validators.L10n.setCurrentLocale("en");
/**
 * Validators main script
 *
 * @author Frederic BAYLE
 */
/// <reference path="validators.l10n.ts" />
var Validators;
(function (Validators) {
    /**
     * Custom validator arguments
     */
    var CustomValidatorArguments = /** @class */ (function () {
        function CustomValidatorArguments() {
            /**
             * Validation status
             */
            this.isValid = true;
            /**
             * Message to display on validation fail
             */
            this.message = undefined;
        }
        return CustomValidatorArguments;
    }());
    /**
     * Validation begining event
     *
     * This function must be overrided
     *
     * @event
     */
    Validators.onValidationBegin = function () {
    };
    /**
     * Input control Validation event
     *
     * This function must be overrided
     *
     * @param pControlToValidate Input control to validate JQuery object
     * @param pValidationStatus  True on success, otherwise false
     * @event
     */
    Validators.onControlValidated = function (pControlToValidate, pValidationStatus) {
    };
    /**
     * Validation ending event
     *
     * This function must be overrided
     *
     * @param pValidationStatus True on success, otherwise false
     * @param pValidationMsgTab Validation messages array
     * @event
     */
    Validators.onValidationEnd = function (pValidationStatus, pValidationMsgTab) {
    };
    /**
     * Validate input controls
     *
     * @param   pValidationGroup Validation group, if no validation group specified, all controls will be validated
     * @returns                  True on success, otherwise false
     */
    function validate(pValidationGroup) {
        // Initialize validation group
        if (pValidationGroup === undefined) {
            pValidationGroup = "";
        }
        // Other initializations
        var validationMsgTab = [];
        var validationStatus = true;
        // Validation begining event
        Validators.onValidationBegin();
        // For each validator
        $('*[data-validate]').each(function () {
            // Get the control to validate if not a custom validator
            var controlToValidate = $();
            if ($(this).data("validate") != "custom") {
                controlToValidate = $("#" + $(this).data("control"));
                if (controlToValidate.length == 0) {
                    throw "Unable to find the control to validate : " + $(this).data("control") + ".";
                }
            }
            // Check if we must validate this control
            var validateControl = false;
            if ($.trim(pValidationGroup) === "") {
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
            // Check if validator is enabled or not
            if ($(this).data("enabled") == "false" || $(this).data("enabled") == false) {
                validateControl = false;
            }
            var ctrlValidationStatus = true;
            // Custom validation
            if ($(this).data("validate") === "custom" && validateControl === true) {
                var customArguments = new CustomValidatorArguments();
                validateCustom(customArguments, $(this));
                if (!customArguments.isValid) {
                    validationStatus = false;
                    if (customArguments.message) {
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
            Validators.onControlValidated(controlToValidate, ctrlValidationStatus);
        });
        // Validation ending event
        Validators.onValidationEnd(validationStatus, validationMsgTab);
        return validationStatus;
    }
    Validators.validate = validate;
    ;
    /**
     * Get a string representation of an input control value
     *
     * @param   pJQueryObj JQuery object corresponding to the input control to validate
     * @returns            String value
     */
    function getControlValidationValue(pJQueryObj) {
        // Use the value attribute by default
        var returnValue = pJQueryObj.val();
        if (pJQueryObj.prop("tagName").toLowerCase() === "input") {
            if (pJQueryObj.prop("type").toLowerCase() === "checkbox" ||
                pJQueryObj.prop("type").toLowerCase() === "radio") {
                // For checkboxes or radiobuttons, return empty if unchecked
                returnValue = pJQueryObj.is(":checked") === true ? pJQueryObj.attr("value") : "";
            }
        }
        // Ensure that returnValue is a string
        if (returnValue === undefined) {
            returnValue = "";
        }
        else if (typeof (returnValue) == "number") {
            returnValue = returnValue.toString();
        }
        else if (returnValue instanceof Array) {
            returnValue = returnValue.join(",");
        }
        return returnValue;
    }
    ;
    /**
     * Required field validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @returns             True if not empty, otherwise false
     */
    function validateRequired(pJQueryObj) {
        if (getControlValidationValue(pJQueryObj) == "") {
            return false;
        }
        return true;
    }
    ;
    /**
     * Custom validation
     *
     * @param   pArgs         Custom validator arguments
     * @param   pValidatorObj JQuery object corresponding to the validator
     */
    function validateCustom(pArgs, pValidatorObj) {
        if (!$(pValidatorObj).data("function")) {
            throw "You must define the data-function attribute in a custom validator.";
        }
        var cbFunction = new Function("pArgs", pValidatorObj.data('function') + "(pArgs);");
        cbFunction(pArgs);
    }
    ;
    /**
     * Regular expression validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @param   pValidatorObj JQuery object corresponding to the validator
     * @returns               True on success, otherwise false
     */
    function validateRegexp(pJQueryObj, pValidatorObj) {
        if (!$(pValidatorObj).data("pattern")) {
            throw "You must define the data-pattern attribute in a regexp validator.";
        }
        if (getControlValidationValue(pJQueryObj) != "") {
            var rxValidation = new RegExp(pValidatorObj.data('pattern'));
            if (!rxValidation.test(getControlValidationValue(pJQueryObj))) {
                return false;
            }
        }
        return true;
    }
    ;
    /**
     * Int number validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @param   pValidatorObj JQuery object corresponding to the validator
     * @returns               True on success, otherwise false
     */
    function validateInt(pJQueryObj, pValidatorObj) {
        if (getControlValidationValue(pJQueryObj) != "") {
            var controlValue = undefined;
            if (!/^-?[0-9]+$/.test(getControlValidationValue(pJQueryObj))) {
                return false;
            }
            controlValue = parseInt(getControlValidationValue(pJQueryObj), 10);
            // We must compare the value
            if (pValidatorObj.data("operator")) {
                if ($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
                    throw "You must define the data-comparecontrol or the data-comparevalue attribute in an int validator.";
                }
                var compareValue = undefined;
                if (pValidatorObj.data('comparecontrol')) {
                    compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol')));
                }
                else {
                    compareValue = pValidatorObj.data('comparevalue');
                }
                if (!/^-?[0-9]+$/.test(compareValue)) {
                    return false;
                }
                compareValue = parseInt(compareValue, 10);
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
                        if ($(pValidatorObj).data("comparemaxvalue") === undefined) {
                            throw "You must define the data-comparemaxvalue attribute in an int range validator.";
                        }
                        var compareMaxValue = parseInt(pValidatorObj.data('comparemaxvalue'), 10);
                        return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
                    default:
                        throw "Unknown validator operator";
                }
            }
        }
        return true;
    }
    ;
    /**
     * Float number validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @param   pValidatorObj JQuery object corresponding to the validator
     * @returns               True on success, otherwise false
     */
    function validateFloat(pJQueryObj, pValidatorObj) {
        if (getControlValidationValue(pJQueryObj) != "") {
            var controlValue = getControlValidationValue(pJQueryObj).replace(/[\.,]/g, ".");
            if (!/^-?[0-9]+(\.[0-9]+)?$/.test(controlValue)) {
                return false;
            }
            controlValue = parseFloat(controlValue);
            // We must compare the value
            if (pValidatorObj.data("operator")) {
                if ($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
                    throw "You must define the data-comparecontrol or the data-comparevalue attribute in a float number validator.";
                }
                var compareValue = undefined;
                if (pValidatorObj.data('comparecontrol')) {
                    compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol'))).replace(/[\.,]/g, '.');
                }
                else {
                    compareValue = (pValidatorObj.data('comparevalue') + "").replace(/[\.,]/g, '.');
                }
                if (!/^-?[0-9]+(\.[0-9]+)?$/.test(compareValue)) {
                    return false;
                }
                compareValue = parseFloat(compareValue);
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
                        if ($(pValidatorObj).data("comparemaxvalue") === undefined) {
                            throw "You must define the data-comparemaxvalue attribute in a float number range validator.";
                        }
                        var compareMaxValue = parseFloat((pValidatorObj.data('comparemaxvalue') + "").replace(/[\.,]/g, '.'));
                        return (controlValue >= compareValue) && (controlValue <= compareMaxValue);
                    default:
                        throw "Unknown validator operator";
                }
            }
        }
        return true;
    }
    ;
    /**
     * Date validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @param   pValidatorObj JQuery object corresponding to the validator
     * @returns               True on success, otherwise false
     */
    function validateDate(pJQueryObj, pValidatorObj) {
        if (getControlValidationValue(pJQueryObj) != "") {
            var controlValue = parseDate(getControlValidationValue(pJQueryObj));
            if (controlValue === undefined) {
                return false;
            }
            // We must compare the value
            if (pValidatorObj.data("operator")) {
                if ($(pValidatorObj).data("comparecontrol") === undefined && $(pValidatorObj).data("comparevalue") === undefined) {
                    throw "You must define the data-comparecontrol or the data-comparevalue attribute in a date validator.";
                }
                var compareValue = undefined;
                if (pValidatorObj.data('comparecontrol')) {
                    compareValue = getControlValidationValue($("#" + pValidatorObj.data('comparecontrol')));
                }
                else {
                    compareValue = pValidatorObj.data('comparevalue');
                }
                compareValue = parseDate(compareValue);
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
                        if ($(pValidatorObj).data("comparemaxvalue") === undefined) {
                            throw "You must define the data-comparemaxvalue attribute in a date range validator.";
                        }
                        var compareMaxValue = parseDate(pValidatorObj.data('comparemaxvalue'));
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
    }
    ;
    /**
     * Email address validation
     *
     * @param   pJQueryObj    JQuery object corresponding to the input control to validate
     * @returns               True on success, otherwise false
     */
    function validateEmailAddress(pJQueryObj) {
        if (getControlValidationValue(pJQueryObj) != "") {
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(getControlValidationValue(pJQueryObj))) {
                return false;
            }
        }
        return true;
    }
    ;
    /**
     * Try to convert a string to a Date object
     *
     * @param    pInputValue String to convert
     * @returns              Date object on success, otherwise undefined
     */
    function parseDate(pInputValue) {
        // International format yyyy-mm-dd
        var rxTester = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?$/;
        var rxGroups = { day: 3, month: 2, year: 1, hour: 5, minutes: 6, seconds: 8 };
        var nbDaysMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        // First, check the international date pattern
        if (!rxTester.test(pInputValue)) {
            // Fail, check french format
            rxTester = Validators.L10n.currentLocale.dateFormat;
            rxGroups = Validators.L10n.currentLocale.dateFormatGroups;
            if (!rxTester.test(pInputValue)) {
                return undefined;
            }
        }
        // Extract date parts
        var rxResult = rxTester.exec(pInputValue);
        var month = parseInt(rxResult[rxGroups.month], 10) - 1;
        var day = parseInt(rxResult[rxGroups.day], 10);
        var year = parseInt(rxResult[rxGroups.year], 10);
        var hour = 0;
        var minutes = 0;
        var seconds = 0;
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
    }
    Validators.parseDate = parseDate;
    ;
})(Validators || (Validators = {}));
/**
 * Validators French localization script
 *
 * @author Frederic BAYLE
 */
/// <reference path="../validators.l10n.ts" />
// Create the French locale (fr)
Validators.L10n.locales["fr"] = new Validators.L10n.LocalizationData("fr");
Validators.L10n.locales["fr"].dateFormat = /^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4,})(\s+([0-9]{1,2}):([0-9]{1,2})(:([0-9]{1,2}))?)?/;
Validators.L10n.locales["fr"].dateFormatGroups = { day: 1, month: 2, year: 3, hour: 5, minutes: 6, seconds: 8 };
Validators.L10n.locales["fr"].decimalSeparator = ",";

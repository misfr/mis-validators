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

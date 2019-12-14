/**
 * MIS validators bundle entry point
 * @author Frederic BAYLE
 */

import { Validators } from "../src";

let validators = new Validators();

// Export the validators instance the to window ojbect to make it accessible from navigator
(<any>window).validators = validators;

/**
 * MIS validators bundle entry point
 * @author Frederic BAYLE
 */

import { Validators } from "./";

// Export the validators instance the to window ojbect to make it accessible from navigator
(<any>window).validators = new Validators();

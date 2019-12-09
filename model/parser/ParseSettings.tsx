import {VoidValidator} from "../interfaces/ValidationError";

export default class ParseSettings {

    static readonly FAIL_ON_UNKNOWN_PARSE_KEY = true;

    public static unknownParseKey(key: string, element: string): VoidValidator {
        if( ParseSettings.FAIL_ON_UNKNOWN_PARSE_KEY ){
            return {
                hasErrors: true,
                errors: [{
                    message: "Unknown value to parse " + key,
                    element: element,
                    attribute: "unexpected"
                }]
            }
        }
        /**
         * Case the settings were changed to ignore errors,
         * it should return no errors instead.
         *
         * Since is a final value, this case can not be cover by tests
         * But must be defined to the type checking
         */
        /* istanbul ignore next */
        return { hasErrors: false }
    }
}
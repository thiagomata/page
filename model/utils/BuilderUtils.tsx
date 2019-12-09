import {ValidationResult} from "../interfaces/ValidationError";

export class BuilderException extends Error {
}
export default class BuilderUtils {

    /**
     * Get a T object or fails throwing an Exception
     * @param validationResult
     * @throws BuilderException
     */
    public static buildOrFail<T>(validationResult: ValidationResult<T>): T {
        if ( validationResult.hasErrors ) {
            const message = validationResult.errors.map(
                error => {
                    return `Validation error in the ${error.attribute} of the ${error.element}: ${error.message}.`
                }
            ).join("\n");
            throw new BuilderException(message);
        }
        return validationResult.result;
    }
}
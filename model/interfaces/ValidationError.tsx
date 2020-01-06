export interface ValidationError {
    element: string,
    attribute: string,
    message: string
}

export type ValidationErrors = {
    hasErrors: true,
    errors: ValidationError[]
}

export type Validated<T> = {
    hasErrors: false,
    result: T
};


export type ValidatedVoid = {
    hasErrors: false
}

export const ValidVoid: ValidatedVoid = {
    hasErrors: false
};

export type VoidValidator = ValidationErrors | ValidatedVoid

export type ValidationResult<T> = Validated<T> | ValidationErrors
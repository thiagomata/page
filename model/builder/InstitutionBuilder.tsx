import {Image} from "../interfaces/Image";
import {Institution} from "../interfaces/Publication";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import BuilderUtils from "../utils/BuilderUtils";

export default class InstitutionBuilder {
    name?: string;
    abbreviation?: string;
    email?: string;
    link?: string;
    icon?: Image;

    public withName(name: string): InstitutionBuilder {
        this.name = name;
        return this;
    }

    public withAbbreviation(abbreviation: string): InstitutionBuilder {
        this.abbreviation = abbreviation;
        return this;
    }
    public withEmail(email: string): InstitutionBuilder {
        this.email = email;
        return this;
    }

    public withLink(link: string): InstitutionBuilder {
        this.link = link;
        return this;
    }

    public withIcon(icon: Image): InstitutionBuilder {
        this.icon = icon;
        return this;
    }

    /**
     * Build or throws an Exception
     * @throws BuilderException
     */
    public buildOrFail(): Institution {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<Institution> {

        let errors: ValidationError[] = [];

        if (!this.name) {
            errors.push(
                {
                    element: "Institution",
                    attribute: "name",
                    message: "Name is required"
                }
            );
        }

        if (errors.length) {
            return {
                hasErrors: true,
                errors: errors
            }
        }

        /**
         * Checking again the required fields, throwing an error
         * if any is missing to make the typescript type checking happy.
         *
         * This exception should never happening
         */
        if (!this.name) {
            /* istanbul ignore next */
            throw new Error("Unexpected missing fields after validation");
        }

        let institution: Institution = {
            name: this.name,
            email: this.email,
            link: this.link,
            icon: this.icon,
            abbreviation: this.abbreviation,
        };
        return {
            hasErrors: false,
            result: institution
        }
    }
}
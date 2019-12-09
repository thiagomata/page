import {Image} from "../interfaces/Image";
import {Magazine} from "../interfaces/Publication";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import BuilderUtils from "../utils/BuilderUtils";

export default class MagazineBuilder {
    name?: string;
    abbreviation?: string;
    email?: string;
    link?: string;
    icon?: Image;

    public withName(name: string): MagazineBuilder {
        this.name = name;
        return this;
    }

    public withAbbreviation(abbreviation: string): MagazineBuilder {
        this.abbreviation = abbreviation;
        return this;
    }
    public withEmail(email: string): MagazineBuilder {
        this.email = email;
        return this;
    }

    public withLink(link: string): MagazineBuilder {
        this.link = link;
        return this;
    }

    public withIcon(icon: Image): MagazineBuilder {
        this.icon = icon;
        return this;
    }

    /**
     * Build or throws an Exception
     * @throws BuilderException
     */
    public buildOrFail(): Magazine {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<Magazine> {

        let errors: ValidationError[] = [];

        if (!this.name) {
            errors.push(
                {
                    element: "Magazine",
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

        let Magazine: Magazine = {
            name: this.name,
            link: this.link,
            icon: this.icon,
            abbreviation: this.abbreviation,
        };
        return {
            hasErrors: false,
            result: Magazine
        }
    }
}
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import {createCheckers, ICheckerSuite} from "ts-interface-checker";
import {About} from "../interfaces/About";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";

export default class ProfileBuilder {
    name?: string;
    username?: string;
    link?: string;

    public withName(name: string): ProfileBuilder {
        this.name = name;
        return this;
    }

    public withUsername(username: string): ProfileBuilder {
        this.username = username;
        return this;
    }

    public withLink(link: string): ProfileBuilder {
        this.link = link;
        return this;
    }

    public build(): ValidationResult<Profile> {

        let errors: ValidationError[] = [];

        if (!this.name) {
            errors.push(
                {
                    element: "Profile",
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
            throw new Error("Unexpected missing fields after validation");
        }

        let profile: Profile = {
            name: this.name,
            username: this.username,
            link: this.link
        };
        return {
            hasErrors: false,
            result: profile
        }
    }
}
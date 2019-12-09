import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import {About} from "../interfaces/About";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import BuilderUtils from "../utils/BuilderUtils";

export default class AboutBuilder {
    name?: string;
    fullName?: string;
    label?: string;
    picture?: Image;
    email?: string;
    phone?: string;
    website?: string;
    summary?: string;
    location?: string;
    profiles?: Profile[];

    public withName(name?: string): AboutBuilder {
        this.name = name;
        return this;
    }

    public withFullName(fullName?: string): AboutBuilder {
        this.fullName = fullName;
        return this;
    }

    public withLabel(label?: string): AboutBuilder {
        this.label = label;
        return this;
    }

    public withPicture(picture?: Image): AboutBuilder {
        this.picture = picture;
        return this;
    }

    public withEmail(email?: string): AboutBuilder {
        this.email = email;
        return this;
    }

    public withPhone(phone?: string): AboutBuilder {
        this.phone = phone;
        return this;
    }

    public withWebsite(website?: string): AboutBuilder {
        this.website = website;
        return this;
    }

    public withSummary(summary?: string): AboutBuilder {
        this.summary = summary;
        return this;
    }

    public withLocation(location?: string): AboutBuilder {
        this.location = location;
        return this;
    }

    public withProfiles(profiles?: Profile[]): AboutBuilder {
        this.profiles = profiles;
        return this;
    }

    /**
     * Build or throws an Exception
     * @throws BuilderException
     */
    public buildOrFail(): About {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<About> {
        let errors: ValidationError[] = [];

        if (!this.name) {
            errors.push({
                element: "About",
                attribute: "name",
                message: "Name is required"
            });
        }
        if (!this.fullName) {
            errors.push({
                element: "About",
                attribute: "fullName",
                message: "Full name is required"
            });
        }
        if (!this.label) {
            errors.push({
                element: "About",
                attribute: "label",
                message: "Label is required"
            });
        }
        if (!this.picture) {
            errors.push({
                element: "About",
                attribute: "picture",
                message: "Picture is required"
            });
        }
        if (!this.summary) {
            errors.push({
                element: "About",
                attribute: "summary",
                message: "Summary is required"
            });
        }
        if (!this.website) {
            errors.push({
                element: "About",
                attribute: "website",
                message: "Website is required"
            });
        }

        if ( errors.length ) {
            return {
                hasErrors: true,
                errors
            };
        }

        /**
         * Checking again the required fields, throwing an error
         * if any is missing to make the typescript type checking happy.
         *
         * This exception should never happening
         */
        if (
            !this.name     ||
            !this.fullName ||
            !this.label    ||
            !this.picture  ||
            !this.summary  ||
            !this.website
        ) {
            /* istanbul ignore next */
            throw new Error("Unexpected missing fields after validation");
        }

        let about: About = {
            name: this.name,
            fullName: this.fullName,
            label: this.label,
            picture: this.picture,
            summary: this.summary,
            email: this.email,
            website: this.website,
            profiles: this.profiles,
            location: this.location,
            phone: this.phone
        };
        return {
            hasErrors: false,
            result: about
        }
    }
}
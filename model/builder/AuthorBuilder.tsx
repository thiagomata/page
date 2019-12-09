import {Image} from "../interfaces/Image";
import {Author, Institution} from "../interfaces/Publication";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import {Profile} from "../interfaces/Profile";
import BuilderUtils from "../utils/BuilderUtils";

export default class AuthorBuilder {
    name?: string;
    abbreviation?: string;
    email?: string;
    link?: string;
    avatar?: Image;
    institution?: Institution;
    profiles?: Profile[];

    public withName(name: string): AuthorBuilder {
        this.name = name;
        return this;
    }

    public withAbbreviation(abbreviation: string): AuthorBuilder {
        this.abbreviation = abbreviation;
        return this;
    }
    public withEmail(email: string): AuthorBuilder {
        this.email = email;
        return this;
    }

    public withLink(link: string): AuthorBuilder {
        this.link = link;
        return this;
    }

    public withAvatar(avatar: Image): AuthorBuilder {
        this.avatar = avatar;
        return this;
    }

    public withInstitution(institution: Institution): AuthorBuilder {
        this.institution = institution;
        return this;
    }

    public withProfiles(profiles: Profile[]): AuthorBuilder {
        this.profiles = profiles;
        return this
    }

    /**
     * Build or throws an Exception
     * @throws BuilderException
     */
    public buildOrFail(): Author {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<Author> {

        let errors: ValidationError[] = [];

        if (!this.name) {
            errors.push(
                {
                    element: "Author",
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

        let author: Author = {
            name: this.name,
            email: this.email,
            link: this.link,
            avatar: this.avatar,
            abbreviation: this.abbreviation,
            institution: this.institution,
            profiles: this.profiles
        };
        return {
            hasErrors: false,
            result: author
        }
    }
}
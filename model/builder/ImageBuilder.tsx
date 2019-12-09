import {Image} from "../interfaces/Image";
import {createCheckers, ICheckerSuite} from "ts-interface-checker";

import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import BuilderUtils from "../utils/BuilderUtils";

export default class ImageBuilder {
    title?: string;
    link?: string;
    width?: number;
    height?: number;

    public withTitle(title: string): ImageBuilder {
        this.title = title;
        return this;
    }

    public withWidth(width: number): ImageBuilder {
        this.width = width;
        return this;
    }

    public withHeight(height: number): ImageBuilder {
        this.height = height;
        return this;
    }

    public withLink(link: string): ImageBuilder {
        this.link = link;
        return this;
    }

    /**
     * Build or throws an Exception
     * @throws BuilderException
     */
    public buildOrFail(): Image {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<Image> {

        let errors: ValidationError[] = [];

        if (!this.link) {
            errors.push(
                {
                    element: "Image",
                    attribute: "link",
                    message: "Link is required"
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
        if (!this.link) {
            /* istanbul ignore next */
            throw new Error("Unexpected missing fields after validation");
        }

        let Image: Image = {
            title: this.title,
            link: this.link,
            width: this.width,
            height: this.height
        };
        return {
            hasErrors: false,
            result: Image
        }
    }
}
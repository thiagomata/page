import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import {About} from "../interfaces/About";
import ProfileParser from "./ProfileParser";
import {isValidElement} from "react";
import AboutBuilder from "../builder/AboutBuilder";
import {
    ValidationError,
    ValidationResult,
    ValidationErrors,
    VoidValidator,
    ValidVoid
} from "../interfaces/ValidationError";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";

export default class AboutParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_FULL_NAME = 'full name';
    static readonly PARSE_LABEL = 'label';
    static readonly PARSE_PICTURE = 'picture';
    static readonly PARSE_EMAIL = [ 'email', 'e-mail' ];
    static readonly PARSE_PHONE = 'phone';
    static readonly PARSE_WEBSITE = 'website';
    static readonly PARSE_SUMMARY = 'summary';
    static readonly PARSE_LOCATION = 'location';
    static readonly PARSE_PROFILES = 'profiles';

    builder: AboutBuilder = new AboutBuilder();

    parse(content: string): ValidationResult<About> {
        let titleTree: ParseElement = TitleParser.parse(content);
        return this.parseElement(titleTree);
    }

    parseElement(titleTree: ParseElement): ValidationResult<About> {
        let parseErrors: ValidationError[] = [];
        for (let key in titleTree.elements) {
            let parseResult = this.parseElementKey(key, titleTree.elements[key]);
            if (parseResult.hasErrors) {
                parseErrors = parseErrors.concat(parseResult.errors)
            }
        }
        if (parseErrors.length) {
            return {
                hasErrors: true,
                errors: parseErrors
            };
        }
        return this.build();
    }

    private parseElementKey(key: string, element: ParseElement): VoidValidator {
        let parseKey = key.trim().toLowerCase();
        if (parseKey == AboutParser.PARSE_NAME) {
            this.builder.withName(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_FULL_NAME) {
            this.builder.withFullName(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_LABEL) {
            this.builder.withLabel(element.content);
            return ValidVoid;
        }
        if (AboutParser.PARSE_EMAIL.includes(parseKey)) {
            this.builder.withEmail(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_PHONE) {
            this.builder.withPhone(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_WEBSITE) {
            this.builder.withWebsite(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_SUMMARY) {
            this.builder.withSummary(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_LOCATION) {
            this.builder.withLocation(element.content);
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_PROFILES) {
            let profileResult: ValidationResult<Profile[]> = ProfileParser.getProfilesFromParseElement(element);
            if (profileResult.hasErrors) {
                return profileResult;
            } else {
                this.builder.withProfiles(profileResult.result);
            }
            return ValidVoid;
        }
        if (parseKey == AboutParser.PARSE_PICTURE) {
            let pictureResult: ValidationResult<Image> = ImageParser.parseElement(element);
            if (pictureResult.hasErrors) {
                return pictureResult;
            }
            this.builder.withPicture(pictureResult.result);
            return ValidVoid;
        }
        return ParseSettings.unknownParseKey(parseKey,"about");
    }

    private build(): ValidationResult<About> {
        return this.builder.build();
    }
}
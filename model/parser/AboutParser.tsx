import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import {About} from "../interfaces/About";
import ProfileParser from "./ProfileParser";
import {isValidElement} from "react";
import AboutBuilder from "../builder/AboutBuilder";
import {ValidationError, ValidationResult, ValidationErrors, VoidValidator} from "../interfaces/ValidationError";

export default class AboutParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_FULL_NAME = 'full name';
    static readonly PARSE_LABEL = 'label';
    static readonly PARSE_PICTURE = 'picture';
    static readonly PARSE_EMAIL = 'email';
    static readonly PARSE_PHONE = 'phone';
    static readonly PARSE_WEBSITE = 'website';
    static readonly PARSE_SUMMARY  = 'summary';
    static readonly PARSE_LOCATION = 'location';
    static readonly PARSE_PROFILES = 'profiles';

    builder: AboutBuilder = new AboutBuilder();

    parse(content: string): ValidationResult<About> {
        let titleTree = TitleParser.parse(content);
        let parseErrors: ValidationError[] = [];
        for( let key in titleTree.elements ) {
            let parseResult = this.parseElementKey(key,titleTree.elements[key]);
            if ( parseResult.hasErrors ) {
                parseErrors = parseErrors.concat( parseResult.errors )
            }
        }
        if ( parseErrors.length ) {
            return {
                hasErrors: true,
                errors: parseErrors
            };
        }
        return this.build();
    }

    // static parseElement( key, pa)
    private parseElementKey(key: string, element: ParseElement): VoidValidator {
        let parseKey = key.trim().toLowerCase();
        if ( parseKey == AboutParser.PARSE_NAME ) {
            this.builder.withName(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_FULL_NAME ) {
            this.builder.withFullName(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_LABEL ) {
            this.builder.withLabel(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_EMAIL ) {
            this.builder.withEmail(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_PHONE ) {
            this.builder.withPhone(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_WEBSITE ) {
            this.builder.withWebsite(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_SUMMARY ) {
            this.builder.withSummary(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_LOCATION ) {
            this.builder.withLocation(element.content);
            return { hasErrors: false};
        }
        if ( parseKey == AboutParser.PARSE_PROFILES ) {
            let profiles: ValidationResult<Profile[]> = ProfileParser.getProfilesFromParseElement(element);
            if (profiles.hasErrors ) {
                return {
                    hasErrors: true,
                    errors: profiles.errors
                };
            } else {
                this.builder.withProfiles(profiles.result);
            }
            return { hasErrors: false};
        }
        return { hasErrors: false};
    }

    private build(): ValidationResult<About> {
        return this.builder.build();
    }
}
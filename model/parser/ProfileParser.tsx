import TitleParser, {ParseElement} from "./TitleParser";
import {Profile} from "../interfaces/Profile";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import ProfileBuilder from "../builder/ProfileBuilder";
import LinkParser from "./LinkParser";

export default class ProfileParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_LINK = 'link';
    static readonly PARSE_USERNAME = 'username';

    profileBuilder: ProfileBuilder = new ProfileBuilder();

    parse(content: string): ValidationResult<Profile> {

        let titleTree = TitleParser.parse(content);

        return this.getProfileFromParseElement(titleTree);
    }

    public getProfileFromParseElement(titleTree: ParseElement): ValidationResult<Profile> {
        if( titleTree.content ) {
            let profileHeader = LinkParser.parse(titleTree.content);
            this.profileBuilder.withUsername(profileHeader.title);
            if (profileHeader.link) {
                this.profileBuilder.withLink(profileHeader.link);
            }
        }
        for( let key in titleTree.elements ) {
            this.parseElementKey(key,titleTree.elements[key])
        }
        return this.profileBuilder.build();
    }

    private parseElementKey(key: string, element: ParseElement) {
        let parseKey = key.trim().toLowerCase();
        if ( parseKey == ProfileParser.PARSE_NAME && element.content ) {
            let profileHeader = LinkParser.parse(element.content);
            this.profileBuilder.withName(profileHeader.title);
            if (profileHeader.link) {
                this.profileBuilder.withLink(profileHeader.link);
            }
            return;
        }
        if ( parseKey == ProfileParser.PARSE_LINK && element.content ) {
            this.profileBuilder.withLink(element.content);
            return;
        }
        if ( parseKey == ProfileParser.PARSE_USERNAME && element.content ) {
            let profileHeader = LinkParser.parse(element.content);
            this.profileBuilder.withUsername(profileHeader.title);
            if (profileHeader.link) {
                this.profileBuilder.withLink(profileHeader.link);
            }
            return;
        }
    }

    public static getProfilesFromParseElement(profilesElement: ParseElement): ValidationResult<Profile[]> {
        let profiles: Profile[] = [];
        let allErrors: ValidationError[] = [];
        for( let profileElementKey in profilesElement.elements ) {
            let profileParser:ProfileParser = new ProfileParser();
            let profileHeader = LinkParser.parse(profileElementKey);
            profileParser.profileBuilder.withName(profileHeader.title);
            if (profileHeader.link) {
                profileParser.profileBuilder.withLink(profileHeader.link);
            }
            let parseElement = profileParser.getProfileFromParseElement( profilesElement.elements[ profileElementKey]);

            if ( parseElement.hasErrors ) {
                allErrors = allErrors.concat(parseElement.errors);
            } else {
                profiles.push(parseElement.result);
            }
        }
        if ( allErrors.length ) {
            return {
                hasErrors: true,
                errors: allErrors
            }
        }
        return {
            hasErrors: false,
            result: profiles
        };
    }
}
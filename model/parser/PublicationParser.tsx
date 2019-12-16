import TitleParser, {ParseElement} from "./TitleParser";
import {Publication} from "../interfaces/Publication";
import {ValidationError, ValidationResult, VoidValidator} from "../interfaces/ValidationError";
import PublicationBuilder from "../builder/PublicationBuilder";
import LinkParser from "./LinkParser";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";
import StringUtils from "../utils/StringUtils";
import EventParser from "./EventParser";
import MagazineParser from "./MagazineParser";
import AuthorParser from "./AuthorParser";

export default class PublicationParser {

    static readonly PARSE_RELEVANCE = 'relevance';
    static readonly PARSE_TITLE = 'title';
    static readonly PARSE_SUMMARY = 'link';
    static readonly PARSE_AUTHORS = 'username';
    static readonly PARSE_RELEASE_DATE = 'icon';
    static readonly PARSE_EVENT = 'event';
    static readonly PARSE_MAGAZINE = 'magazine';
    static readonly PARSE_KEYWORDS = 'keywords';
    static readonly PARSE_THUMBNAIL = 'thumbnail';
    static readonly PARSE_LINK = 'link';

    publicationBuilder: PublicationBuilder = new PublicationBuilder();

    public static parse(content: string): ValidationResult<Publication> {
        return new PublicationParser().parse(content);
    }

    public static parseElement(titleTree: ParseElement): ValidationResult<Publication> {
        return new PublicationParser().parseElement( titleTree );
    }

    parse(content: string): ValidationResult<Publication> {

        let titleTree = TitleParser.parse(content);
        return this.parseElement(titleTree);
    }

    public parseElement(titleTree: ParseElement): ValidationResult<Publication> {
        if( titleTree.content ) {
            let PublicationHeader = LinkParser.parse(titleTree.content);
            this.publicationBuilder.withTitle(PublicationHeader.title);
            if (PublicationHeader.link) {
                this.publicationBuilder.withLink(PublicationHeader.link);
            }
        }
        for( let key in titleTree.elements ) {
            let parseResult = this.parseElementKey(key,titleTree.elements[key])
            if( parseResult.hasErrors ) {
                return parseResult;
            }
        }
        return this.publicationBuilder.build();
    }

    private parseElementKey(key: string, element: ParseElement): VoidValidator {
        let parseKey = key.trim().toLowerCase();
        if ( parseKey == PublicationParser.PARSE_RELEVANCE && element.content ) {
            this.publicationBuilder.withRelevance(
                StringUtils.castToNumber(element.content)
            );
            return {
                hasErrors: false
            };
        }
        if ( parseKey == PublicationParser.PARSE_TITLE && element.content ) {
            let PublicationHeader = LinkParser.parse(element.content);
            this.publicationBuilder.withTitle(PublicationHeader.title);
            if (PublicationHeader.link) {
                this.publicationBuilder.withLink(PublicationHeader.link);
            }
            return {
                hasErrors: false
            };
        }
        if ( parseKey == PublicationParser.PARSE_SUMMARY && element.content ) {
            this.publicationBuilder.withSummary(element.content);
            return {
                hasErrors: false
            };
        }
        if ( parseKey == PublicationParser.PARSE_RELEASE_DATE && element.content ) {
            /**
             * @todo create a better cast to date
             */
            const date = new Date( element.content );
            this.publicationBuilder.withReleaseDate(date);
            return {
                hasErrors: false
            };
        }
        if ( parseKey == PublicationParser.PARSE_EVENT ) {
            const eventValidated = EventParser.parseElement( element );
            if ( eventValidated.hasErrors ) {
                return eventValidated;
            }
            this.publicationBuilder.withEvent( eventValidated.result );
        }
        if( parseKey == PublicationParser.PARSE_MAGAZINE ) {
            const magazineValidated = MagazineParser.parseElement(element);
            if ( magazineValidated.hasErrors ) {
                return magazineValidated;
            }
            this.publicationBuilder.withMagazine( magazineValidated.result );
            return {
                hasErrors: false
            };
        }
        if( parseKey == PublicationParser.PARSE_KEYWORDS && element.content ) {
            const keywords = element.content
                .toLowerCase()
                .trim()
                .split(",")
                .map(
                    keyword => keyword.trim()
                );

            const uniqueKeywords = keywords.filter(
                (keyword,index) => keywords.indexOf(keyword) == index
            );

            this.publicationBuilder.withKeywords(uniqueKeywords);
        }
        if( parseKey == PublicationParser.PARSE_THUMBNAIL ) {
            const imageValidated = ImageParser.parseElement( element );
            if( imageValidated.hasErrors ) {
                return imageValidated;
            }
            this.publicationBuilder.withThumbnail( imageValidated.result );
            return {
                hasErrors: false
            };
        }
        if ( parseKey == PublicationParser.PARSE_LINK && element.content ) {
            this.publicationBuilder.withLink(element.content);
            return {
                hasErrors: false
            };
        }
        if( parseKey == PublicationParser.PARSE_AUTHORS ) {
            const authorsValidated = AuthorParser.parseElementToList( element );
            if ( authorsValidated.hasErrors ) {
                return authorsValidated;
            }
            this.publicationBuilder.withAuthors( authorsValidated.result);
            return {
                hasErrors: false
            };
        }
        return ParseSettings.unknownParseKey(parseKey,"Publication")
    }

    public static parseElementToList(publicationsElement: ParseElement): ValidationResult<Publication[]> {
        let publications: Publication[] = [];
        let allErrors: ValidationError[] = [];
        for( let publicationElementKey in publicationsElement.elements ) {
            const parseElement = PublicationParser.parseElement( publicationsElement.elements[ publicationElementKey] );

            if ( parseElement.hasErrors ) {
                allErrors = allErrors.concat(parseElement.errors);
            } else {
                publications.push(parseElement.result);
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
            result: publications
        };
    }
}
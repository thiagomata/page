import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import ProfileParser from "./ProfileParser";
import EventBuilder from "../builder/EventBuilder";
import {ValidationError, ValidationResult, VoidValidator} from "../interfaces/ValidationError";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";
import {Event} from "../interfaces/Publication";

export default class EventParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_ABBREVIATION = 'abbreviation';
    static readonly PARSE_LINK = 'link';
    static readonly PARSE_ICON = 'icon';

    builder: EventBuilder = new EventBuilder();

    public static parse(content: string): ValidationResult<Event> {
        return new EventParser().parse(content);
    }

    public static parseElement(titleTree: ParseElement): ValidationResult<Event> {
        return new EventParser().parseElement(titleTree);
    }

    public parse(content: string): ValidationResult<Event> {
        const titleTree: ParseElement = TitleParser.parse(content);
        return this.parseElement(titleTree);
    }

    public parseElement(titleTree: ParseElement): ValidationResult<Event> {
        let parseErrors: ValidationError[] = [];
        for (let key in titleTree.elements) {
            const parseResult = this.parseElementKey(key, titleTree.elements[key]);
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
        const parseKey = key.toLowerCase().trim();
        if (parseKey == EventParser.PARSE_NAME && element.content ) {
            this.builder.withName(element.content);
            return {hasErrors: false};
        }
        if (parseKey == EventParser.PARSE_ABBREVIATION && element.content ) {
            this.builder.withAbbreviation(element.content);
            return {hasErrors: false};
        }
        if (parseKey == EventParser.PARSE_LINK && element.content ) {
            this.builder.withLink(element.content);
            return {hasErrors: false};
        }
        if (parseKey == EventParser.PARSE_ICON) {
            const pictureResult: ValidationResult<Image> = ImageParser.parseElement(element);
            if (pictureResult.hasErrors) {
                return pictureResult;
            }
            this.builder.withIcon(pictureResult.result);
            return {hasErrors: false};
        }
        return ParseSettings.unknownParseKey(parseKey,"Event");
    }

    private build(): ValidationResult<Event> {
        return this.builder.build();
    }
}
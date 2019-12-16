import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import ProfileParser from "./ProfileParser";
import MagazineBuilder from "../builder/MagazineBuilder";
import {ValidationError, ValidationResult, VoidValidator} from "../interfaces/ValidationError";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";
import {Magazine} from "../interfaces/Publication";

export default class MagazineParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_ABBREVIATION = 'abbreviation';
    static readonly PARSE_LINK = 'link';
    static readonly PARSE_ICON = 'icon';

    builder: MagazineBuilder = new MagazineBuilder();

    public static parse(content: string): ValidationResult<Magazine> {
        return new MagazineParser().parse(content);
    }

    public static parseElement(titleTree: ParseElement): ValidationResult<Magazine> {
        return new MagazineParser().parseElement(titleTree);
    }

    public parse(content: string): ValidationResult<Magazine> {
        const titleTree: ParseElement = TitleParser.parse(content);
        return this.parseElement(titleTree);
    }

    public parseElement(titleTree: ParseElement): ValidationResult<Magazine> {
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
        if (parseKey == MagazineParser.PARSE_NAME && element.content ) {
            this.builder.withName(element.content);
            return {hasErrors: false};
        }
        if (parseKey == MagazineParser.PARSE_ABBREVIATION && element.content ) {
            this.builder.withAbbreviation(element.content);
            return {hasErrors: false};
        }
        if (parseKey == MagazineParser.PARSE_LINK && element.content ) {
            this.builder.withLink(element.content);
            return {hasErrors: false};
        }
        if (parseKey == MagazineParser.PARSE_ICON) {
            const pictureResult: ValidationResult<Image> = ImageParser.parseElement(element);
            if (pictureResult.hasErrors) {
                return pictureResult;
            }
            this.builder.withIcon(pictureResult.result);
            return {hasErrors: false};
        }
        return ParseSettings.unknownParseKey(parseKey,"Magazine");
    }

    private build(): ValidationResult<Magazine> {
        return this.builder.build();
    }
}
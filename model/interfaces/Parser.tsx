import {ValidationResult, VoidValidator} from "./ValidationError";
import {Profile} from "./Profile";
import {ParseElement} from "../parser/TitleParser";

export interface Parser<T> {
    parse(content: string): ValidationResult<T>,

    parseElementKey(key: string, element: ParseElement): VoidValidator,
}
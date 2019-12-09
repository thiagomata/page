import {ParseElement} from "./TitleParser";
import {ValidationError, ValidationErrors, ValidationResult} from "../interfaces/ValidationError";

const regex = /[ ]+([^"=]*)="([^"=]*)"/gm;
const xml2js = require('xml2js');

export interface ParseTagElement {
    elements?: { [key: string]: ParseTagElement }
    attributes?: { [key: string]: string }
    tagName: string;
}

export default class TagParser {

    public static parseToTagElement(content: string): ValidationResult<ParseTagElement> {
        let parser = new xml2js.Parser();
        let errors: ValidationError[] = [];
        let xml = null;
        parser.parseString(content, (err?: Error, result?: any) => {
            if (err) {
                errors.push({
                    message: err.message.split("\n")[0] + " on " + content,
                    attribute: "xml",
                    element: "xml"
                });
            } else {
                xml = result;
            }
        });
        if ( ! xml ) {
            return {
                hasErrors: true,
                errors: errors
            };
        } else {
            let root = TagParser.xmlToParseTagElement( xml );

            return {
                result: root,
                hasErrors: false,
            };
        }
    }

    public static parse(content: string): ValidationResult<ParseElement> {
        let parser = new xml2js.Parser();
        let errors: ValidationError[] = [];
        let xml = null;
        parser.parseString(content, (err?: Error, result?: any) => {
            if (err) {
                errors.push({
                    message: err.message.split("\n")[0] + " on " + content,
                    attribute: "xml",
                    element: "xml"
                });
            } else {
                xml = result;
            }
        });
        if ( !xml ) {
            return {
                hasErrors: true,
                errors: errors
            };
        } else {
            let root = TagParser.xmlToParseElement( xml );

            return {
                result: root,
                hasErrors: false,
            };
        }
    }

    public static xmlToParseElement(xml: any): ParseElement {
        let root: ParseElement = {
            elements: {}
        };
        if ( xml.$ ) {
            for (let attribute in xml.$ ) {
                /**
                 * Safe checking to invalid xml attributes.
                 * This comes out from the xml lib, and we are not covering internal failures with tests
                 * But the ready to deal with the potential failures, ignoring the bad attributes
                 */
                if( ! xml.$.hasOwnProperty(attribute) ) {
                    /* istanbul ignore next */
                    continue;
                }
                let attributeElement: ParseElement = {
                    elements: {}
                };
                let value = xml.$[ attribute ];
                root.elements[ attribute ] = {
                    elements: {},
                    content: value
                };
            }
        }
        for (let key in xml ) {
            if ( !xml.hasOwnProperty(key) || key == "$" ) {
                continue;
            }
            let xmlElement = xml[key];
            root.elements[ key ] = this.xmlToParseElement(xmlElement);
        }
        return root;
    }

    public static xmlToParseTagElement(xml: any, tagName: string = "document" ): ParseTagElement {
        let root: ParseTagElement = {
            tagName: tagName
        };
        if ( xml.$ ) {
            root.attributes = {};
            for (let attribute in xml.$ ) {
                /**
                 * Safe checking to invalid xml attributes.
                 * This comes out from the xml lib, and we are not covering internal failures with tests
                 * But the ready to deal with the potential failures, ignoring the bad attributes
                 */
                if( ! xml.$.hasOwnProperty(attribute) ) {
                    /* istanbul ignore next */
                    continue;
                }
                let value = xml.$[ attribute ];
                root.attributes[ attribute ] = "" + value;
            }
        }
        for (let key in xml ) {
            if ( key == '$' ) {
                continue;
            }
            /**
             * Safe checking to invalid xml key.
             * This comes out from the xml lib, and we are not covering internal failures with tests
             * But the ready to deal with the potential failures, ignoring the bad attributes
             */
            if( ! xml.hasOwnProperty(key) ) {
                /* istanbul ignore next */
                continue;
            }
            let child = xml[key];
            if ( child instanceof Object ) {
                this.evaluateXmlKey("" + key, xml, root);
            }
        }
        return root;
    }

    private static evaluateXmlKey(key: string, xml: any, root: ParseTagElement) {
        /**
         * Safe checking to invalid xml attributes.
         * This comes out from the xml lib, and we are not covering internal failures with tests
         * But the ready to deal with the potential failures, ignoring the bad attributes
         */
        if (!xml.hasOwnProperty(key)) {
            /* istanbul ignore next */
            return;
        }
        if (!root.elements) {
            root.elements = {}
        }
        let xmlElement = xml[key];
        root.elements[key] = this.xmlToParseTagElement(xmlElement, key);
    }
}
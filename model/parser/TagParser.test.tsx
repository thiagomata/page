import {ParseElement} from "./TitleParser";
import TagParser, {ParseTagElement} from "./TagParser";
import {ValidationResult} from "../interfaces/ValidationError";

describe('parse tags', function() {
    it('parsing deep tags as parseElements', function() {
        let result = TagParser.parse(`
            <a>
                <b x="1">
                </b>
                <b x="2">
                </b>
            </a>
        `);

        let expected: ValidationResult<ParseElement> = {
            hasErrors: false,
            result: {
                elements: {
                    a: {
                        elements: {
                            b: {
                                elements: {
                                    0: {
                                        elements: {
                                            x: {
                                                content: "1",
                                                elements: {}
                                            }
                                        }
                                    },
                                    1: {
                                        elements: {
                                            x: {
                                                content: "2",
                                                elements: {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        expect(result).toStrictEqual(expected);
    });

    it('parsing deep tags as parseTagElements', function() {
        let result = TagParser.parseToTagElement(`
            <a>
                <b x="1">
                </b>
                <b x="2">
                </b>
            </a>
        `);

        let expected: ValidationResult<ParseTagElement> = {
            hasErrors: false,
            result: {
                tagName: "document",
                elements: {
                    a: {
                        tagName: "a",
                        elements: {
                            b: {
                                tagName: "b",
                                elements: {
                                    0: {
                                        tagName: "0",
                                        attributes: {
                                            "x": "1"
                                        }
                                    },
                                    1: {
                                        tagName: "1",
                                        attributes: {
                                            "x": "2"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        expect(result).toStrictEqual(expected);
    });

    it('parsing valid image', function() {
        let result = TagParser.parse(`
        <img src="http://myimage.com/test.png" width="123" alt="My test"/>
        `);
        let expected: ValidationResult<ParseElement> = {
            hasErrors:false,
            result: {
                elements: {
                    img: {
                        elements: {
                            src: {
                                content: "http://myimage.com/test.png",
                                elements: {}
                            },
                            width: {
                                content: "123",
                                elements: {}
                            },
                            alt: {
                                content: "My test",
                                elements: {}
                            }
                        }
                    }
                }
            }
        };

        expect(result).toStrictEqual(expected);
    });

    it('parse invalid tag', function() {
        let result = TagParser.parse(`<a>ops</b>`);
        let expected: ValidationResult<ParseElement> = {
            hasErrors: true,
            errors: [{
                element: "xml",
                attribute: "xml",
                message: "Unexpected close tag on <a>ops</b>"
            }]
        };

        expect(result).toStrictEqual(expected);

    });

    it('parse to tag element - invalid tag', function() {
        let result = TagParser.parseToTagElement(`<a>ops</b>`);
        let expected: ValidationResult<ParseElement> = {
            hasErrors: true,
            errors: [{
                element: "xml",
                attribute: "xml",
                message: "Unexpected close tag on <a>ops</b>"
            }]
        };

        expect(result).toStrictEqual(expected);

    });
});
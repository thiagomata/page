import TitleParser, {ParseElement} from "./TitleParser";

describe('parse titles', function() {
    it('sibling nodes', function() {
        let result = TitleParser.parse(`
        ### a
        inside a
        ### b
        inside b
        ### c
        inside c
        ### d
        inside d
        `);
        let expected: ParseElement = {
            elements: {
                "a": {
                    content: "inside a",
                    elements: {}
                },
                "b": {
                    content: "inside b",
                    elements: {}
                },
                "c": {
                    content: "inside c",
                    elements: {}
                },
                "d": {
                    content: "inside d",
                    elements: {}
                }
            }
        };

        expect(result).toStrictEqual(expected);
    });

    it('not linear deep', function() {
        let result = TitleParser.parse(`
        # a
        inside a
        ### a3
        inside a3
        ##### a5
        inside a5
        ## a2
        inside a2
        `);
        let expected: ParseElement = {
            elements: {
                "a": {
                    content: "inside a",
                    elements: {
                        "a3": {
                            content: "inside a3",
                            elements: {
                                "a5": {
                                    content: "inside a5",
                                    elements: {}
                                }
                            }
                        },
                        "a2": {
                            content: "inside a2",
                            elements: {}
                        }
                    }
                },
            }
        };

        expect(result).toStrictEqual(expected);

    });


    it('child nodes', function() {
        let result = TitleParser.parse(`
        # a
        inside a
            ## a1
            inside a1
                ### a1.1
                inside a1.1
                ### a1.2
                inside a1.2
        # b
        inside b
            ## b1
            inside b1
            ## b2
            inside b2
                ### b2.1
                inside b2.1
                    #### b2.1.1
                    inside b2.1.1
        `);
        let expected: ParseElement = {
            elements: {
                "a": {
                    content: "inside a",
                    elements: {
                        "a1": {
                            content: "inside a1",
                            elements: {
                                "a1.1": {
                                    content: "inside a1.1",
                                    elements: {}
                                },
                                "a1.2": {
                                    content: "inside a1.2",
                                    elements: {}
                                }
                            }
                        }
                    }
                },
                "b": {
                    content: "inside b",
                    elements: {
                        "b1": {
                            content: "inside b1",
                            elements: {}
                        },
                        "b2": {
                            content: "inside b2",
                            elements: {
                                "b2.1": {
                                    content: "inside b2.1",
                                    elements: {
                                        "b2.1.1": {
                                            content: "inside b2.1.1",
                                            elements: {}
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        };

        expect(result).toStrictEqual(expected);

    });


    it('missing parent', function() {
        let result = TitleParser.parse(`
        # a1
        inside a1
        #### a4
            inside a4
        ### a2
            inside a2
        `);
        let expected: ParseElement = {
            elements: {
                "a1": {
                    content: "inside a1",
                    elements: {
                        "a4": {
                            content: "inside a4",
                            elements: {}
                        },
                        "a2": {
                            content: "inside a2",
                            elements: {}
                        }
                    }
                }
            }
        };

        expect(result).toStrictEqual(expected);

    });

    it('same level', function() {
        let result = TitleParser.parse(`
        # a1
        inside a1
        
        # a2
        inside a2
        `);
        let expected: ParseElement = {
            elements: {
                "a1": {
                    content: "inside a1",
                    elements: {}
                },
                "a2": {
                    content: "inside a2",
                    elements: {}
                }
            }
        };

        expect(result).toStrictEqual(expected);

    });

});
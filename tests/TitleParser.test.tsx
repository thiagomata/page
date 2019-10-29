import TitleParser from "../model/parser/TitleParser";

describe('parse nodes', function() {
    it('sibling nodes', function() {
        let result = TitleParser.parser(`
        # a
        inside a
        # b
        inside b
        `);
        // @ts-ignore
        let expected: ParseElement = {
            elements: {
                "a": {
                    content: "inside a",
                    elements: {}
                },
                "b": {
                    content: "inside b",
                    elements: {}
                }
            }
        };

        expect(result).toStrictEqual(expected);
    });

    it('not linear deep', function() {
        let result = TitleParser.parser(`
        # a
        inside a
        ### a3
        inside a3
        ##### a5
        inside a5
        ## a2
        inside a2
        `);
        // @ts-ignore
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
        let result = TitleParser.parser(`
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
        // @ts-ignore
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
});
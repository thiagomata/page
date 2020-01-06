import AuthorParser from "./AuthorParser";
import TitleParser, {ParseElement} from "./TitleParser";
import AuthorBuilderTestHelper from "../builder/AuthorBuilder.test";
import ProfileParser from "./ProfileParser";
import ParseSettings from "./ParseSettings";

describe('author parser tests', function () {
    it('author with invalid image', function () {
        let result = AuthorParser.parse(`
            ## Name
            
            Bob
            
            ## Avatar
            
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('author with invalid institution', function () {
        let result = AuthorParser.parse(`
            ## Name
            
            Bob
            
            ## Institution
            
            #### Icon
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('author with invalid profile', function () {
        let result = AuthorParser.parse(`
            ## Name
            
            Bob
            
            ## Profiles
            
            ### My Social Network
            
            #### Icon
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('reduced case', function () {
        let result = AuthorParser.parse(`
            [Thiago Mata](https://thiagomata.com)
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "Thiago Mata",
                link: "https://thiagomata.com",
            }
        };
        expect(result).toEqual(expected);
    });

    it('full case', function () {
        let result = AuthorParser.parse(`
            ## Name
            
            Thiago Mata
            
            ## Abbreviation
            
            THR Mata
            
            ## Institution
            
            UnB
            
            ## Avatar
            
            ![photo](./images/thiago_face.jpg)
            
            ## E-mail
            
            thiago.henrique.mata@gmail.com
            
            ## Link
            
            https://thiagomata.com
            
            ## Profiles
            
            ### Twitter
            
            [@thiagomata](http://twitter.com/thiagomata)
            
            #### Icon
            
            <img src="http://www.thiagomata.com/icons/twitter.svg" alt="twitter logo" width="100" height="200px"/>
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "Thiago Mata",
                abbreviation: "THR Mata",
                email: "thiago.henrique.mata@gmail.com",
                institution: {
                    name: "UnB",
                },
                link: "https://thiagomata.com",
                avatar: {
                    height: undefined,
                    width: undefined,
                    link: "./images/thiago_face.jpg",
                    title: "photo"
                },
                profiles: [{
                    link: "http://twitter.com/thiagomata",
                    name: "Twitter",
                    username: "@thiagomata",
                    icon: {
                        link: "http://www.thiagomata.com/icons/twitter.svg",
                        title: "twitter logo",
                        width: 100,
                        height: 200
                    }
                }],
            }
        };
        expect(result).toEqual(expected);
    });

    it('simple parse element case', function () {
        let result = AuthorParser.parseElement( TitleParser.parse(`
            ## Name
            
            Thiago Mata
            
            ## Abbreviation
            
            THR Mata            
        `));
        let expected = {
            hasErrors: false,
            result: {
                name: "Thiago Mata",
                abbreviation: "THR Mata",
            }
        };
        expect(result).toEqual(expected);
    });

    it('list case', function () {
        const tree: ParseElement = TitleParser.parse(`
            # Authors
                ## Thiago
                ## Bob
                ## Joe
        `);
        const list = tree.elements["Authors"];
        let result = AuthorParser.parseElementToList( list );
        let expected = {
            hasErrors: false,
            result: [
                {
                    name: "Thiago"
                },{
                    name: "Bob"
                },{
                    name: "Joe"
                }
            ]
        };
        expect(result).toEqual(expected);
    });

    it('error case - unknown title', function() {
        let result = new AuthorParser().parse( `
        # Name
        
        Bob
        
        # hey
        ## joe
        what are you doing
        `);

        expect(result.hasErrors).toStrictEqual(ParseSettings.FAIL_ON_UNKNOWN_PARSE_KEY);
    });

    it('errors on list case', function () {
        const tree: ParseElement = TitleParser.parse(`
            # Authors
                ## Thiago
                    ### Icon
a                       <invalidtag/>
                ## Bob
                   ### Icon
a                       <invalidtag/>
                ## Joe
                   ### Icon
a                       <invalidtag/>
        `);
        const list = tree.elements["Authors"];
        let result = AuthorParser.parseElementToList( list );
        expect(result.hasErrors).toEqual(true);
        if( result.hasErrors ) {
            expect( result.errors.length ).toEqual(3);
        } else {
            fail("expecting errors");
        }
    });
});


import ProfileParser from "./ProfileParser";
import TitleParser from "./TitleParser";
import ProfileBuilderTestHelper from "../builder/ProfileBuilder.test";
import ParseSettings from "./ParseSettings";

describe('profile parser tests', function() {
    it('simple case', function() {
        let profileParser: ProfileParser = new ProfileParser();
        let result = profileParser.parse(`
        ## Name
        Twitter
        
        ## Link
        http://twitter.com/thiagomata
        
        ## Username
        @thiagomata
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata",
                icon: undefined,
            }
        };
        expect(result).toStrictEqual(expected);
    });

    it('link on tag name', function() {
        let profileParser: ProfileParser = new ProfileParser();
        let result = profileParser.parse(`
        ## Name
        [Twitter](http://twitter.com/thiagomata)
                
        ## Username
        @thiagomata
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata",
                icon: undefined,
            }
        };
        expect(result).toStrictEqual(expected);
    });

    it('name and link on title - one profile', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # [Twitter](http://twitter.com/thiagomata)
        
        @thiagomata
        `));
        let expected = {
            hasErrors: false,
            result: [{
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata"
            }]
        };
        expect(result).toEqual(expected);
    });

    it('name on title and link on username - one profile', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # Twitter
        
        ## Username
        [@thiagomata](http://twitter.com/thiagomata)
        `));
        let expected = {
            hasErrors: false,
            result: [{
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata"
            }]
        };
        expect(result).toEqual(expected);
    });

    it('complex case - many profiles', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # [Twitter](http://twitter.com/thiagomata)
        
        ## Username
        @thiagomata

        ## Icon
        <img src="http://www.thiagomata.com/images/twitter.svg" alt="twitter"/>
        
        # Linkedin
        
        [thiagomata](https://www.linkedin.com/in/thiagomata)
        
        ## Icon
        [linkedin](http://www.thiagomata.com/images/linkedin.svg)
        
        `));
        let expected = {
            hasErrors: false,
            result: [{
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata",
                icon: {
                    link: "http://www.thiagomata.com/images/twitter.svg",
                    title: "twitter"
                }
            },{
                link: "https://www.linkedin.com/in/thiagomata",
                name: "Linkedin",
                username: "thiagomata",
                icon: {
                    link: "http://www.thiagomata.com/images/linkedin.svg",
                    title: "linkedin",
                }
            }]
        };
        expect(result).toEqual(expected);
    });

    it('error case - missing name', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        #        
        `));
        let expected = ProfileBuilderTestHelper.getErrorMissingRequired();
        expect(result).toStrictEqual(expected);
    });

    it('error case - invalid image', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # bob
        ## icon
         <button>something</button>
        `));
        let expected = {
            hasErrors: true,
            errors: [{
                attribute: "xml",
                element: "image",
                message: "Unable to find Image in the XML <button>something</button>"
            }]
        }
        expect(result).toStrictEqual(expected);
    });

    it('error case - unknown title', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # hey
        ## joe
        what are you doing
        `));

        expect(result.hasErrors).toStrictEqual(ParseSettings.FAIL_ON_UNKNOWN_PARSE_KEY);
    });
});
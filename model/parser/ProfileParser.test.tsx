import ProfileParser from "./ProfileParser";
import TitleParser from "./TitleParser";
import ProfileBuilderTestHelper from "../builder/ProfileBuilder.test";

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
                username: "@thiagomata"
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
                username: "@thiagomata"
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
        expect(result).toStrictEqual(expected);
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
        expect(result).toStrictEqual(expected);
    });

    it('complex case - many profiles', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        # [Twitter](http://twitter.com/thiagomata)
        
        ## Username
        @thiagomata

        # Linkedin
        
        [thiagomata](https://www.linkedin.com/in/thiagomata/)
        `));
        let expected = {
            hasErrors: false,
            result: [{
                name: "Twitter",
                link: "http://twitter.com/thiagomata",
                username: "@thiagomata"
            },{
                name: "Linkedin",
                link: "https://www.linkedin.com/in/thiagomata/",
                username: "thiagomata"
            }]
        };
        expect(result).toStrictEqual(expected);
    });

    it('error case - missing name', function() {
        let result = ProfileParser.getProfilesFromParseElement( TitleParser.parse(`
        #        
        `));
        let expected = ProfileBuilderTestHelper.getErrorMissingRequired();
        expect(result).toStrictEqual(expected);
    });
});
import AboutParser from "./AboutParser";
import TitleParser from "./TitleParser";
import AboutBuilderTestHelper from "../builder/AboutBuilder.test";
import ProfileParser from "./ProfileParser";
import ParseSettings from "./ParseSettings";

describe('about parser tests', function () {
    it('about with invalid image', function () {
        let aboutParser: AboutParser = new AboutParser();
        let result = aboutParser.parse(`
            ## Name
            
            Bob
            
            ## Full Name
            
            Bob B
            
            ## Picture
            
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });
    it('about with invalid profile', function () {
        let aboutParser: AboutParser = new AboutParser();
        let result = aboutParser.parse(`
            ## Name
            
            Bob
            
            ## Full Name
            
            Bob B
            
            ## Profiles
            
            ### My Social Network
            
            #### Icon
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });    it('simple case', function () {
        let aboutParser: AboutParser = new AboutParser();
        let result = aboutParser.parse(`
            ## Name
            
            Thiago Mata
            
            ## Full Name
            
            Thiago Henrique Ramos da Mata
            
            ## Label
            
            Software Engineer
            
            ## Picture
            
            ![photo](./images/thiago_face.jpg)
            
            ## E-mail
            
            thiago.henrique.mata@gmail.com
            
            ## Phone
            
            +61 0413 065 180
            
            ## Website
            
            https://thiagomata.com
            
            ## Summary
            
            Software developer for many years.
            In the last years, I have learning and worked with Cloud Computing, Big Data and Machine Learning.
            
            ## Location
            
            Chatswood, Sydney, Australia
            
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
                fullName: "Thiago Henrique Ramos da Mata",
                label: "Software Engineer",
                picture: {
                    height: undefined,
                    width: undefined,
                    link: "./images/thiago_face.jpg",
                    title: "photo"
                },
                email: "thiago.henrique.mata@gmail.com",
                location: "Chatswood, Sydney, Australia",
                phone: "+61 0413 065 180",
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
                summary: "Software developer for many years." +
                    " In the last years, I have learning and worked with Cloud Computing, Big Data and Machine Learning.",
                website: "https://thiagomata.com"
            }
        };
        expect(result).toEqual(expected);
    });
    it('error case - unknown title', function() {
        let result = new AboutParser().parse( `
        # Name
        
        Bob
        
        # Full Name
        
        Bob B
        
        # hey
        ## joe
        what are you doing
        `);

        expect(result.hasErrors).toStrictEqual(ParseSettings.FAIL_ON_UNKNOWN_PARSE_KEY);
    });});
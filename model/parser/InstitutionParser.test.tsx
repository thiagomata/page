import InstitutionParser from "./InstitutionParser";
import TitleParser from "./TitleParser";
import ParseSettings from "./ParseSettings";

describe('institution parser tests', function () {
    it('institution with invalid image', function () {
        let result = InstitutionParser.parse(`
            ## Name
            
            UnB
            
            ## Icon
            
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('reduced case', function () {
        let result = InstitutionParser.parse(`
            [UnB](https://unb.gov.br)
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "UnB",
                link: "https://unb.gov.br",
            }
        };
        expect(result).toEqual(expected);
    });

    it('full case', function () {
        let result = InstitutionParser.parse(`
            ## Name
            
            Universidade de Brasilia
            
            ## Abbreviation
            
            UnB
                        
            ## Icon
            
            ![photo](./images/unb_logo.jpg)
            
            ## E-mail
            
            unb@unb.gov.br
            
            ## Link
            
            https://unb.gov.br            
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "Universidade de Brasilia",
                abbreviation: "UnB",
                email: "unb@unb.gov.br",
                link: "https://unb.gov.br",
                icon: {
                    link: "./images/unb_logo.jpg",
                    title: "photo"
                },
            }
        };
        expect(result).toEqual(expected);
    });

    it('simple parse element case', function () {
        let result = InstitutionParser.parseElement( TitleParser.parse(`
            ## Name
            
            Institution Name
            
            ## Abbreviation
            
            IN            
        `));
        let expected = {
            hasErrors: false,
            result: {
                name: "Institution Name",
                abbreviation: "IN",
            }
        };
        expect(result).toEqual(expected);
    });

    it('error case - unknown title', function() {
        let result = new InstitutionParser().parse( `
        # Name
        
        Institution
        
        # hey
        ## joe
        what are you doing
        `);

        expect(result.hasErrors).toStrictEqual(ParseSettings.FAIL_ON_UNKNOWN_PARSE_KEY);
    });
});


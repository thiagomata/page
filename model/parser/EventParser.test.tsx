import EventParser from "./EventParser";
import TitleParser, {ParseElement} from "./TitleParser";
import ParseSettings from "./ParseSettings";

describe('event parser tests', function () {
    it('event with invalid image', function () {
        let result = EventParser.parse(`
            ## Name
            
            My Event
            
            ## Icon
            
            <invalidtag/>            
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('event with invalid tag', function () {
        let result = EventParser.parse(`
            ## Name
            
            My Event
            
            ## Something
            
            else
        `);

        expect(result.hasErrors).toEqual(true);
        if (result.hasErrors) {
            expect(result.errors.length).toEqual(1);
        }
    });

    it('reduced case', function () {
        let result = EventParser.parse(`
            [My Event](https://myevent.com)
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "My Event",
                link: "https://myevent.com",
            }
        };
        expect(result).toEqual(expected);
    });

    it('full case', function () {
        let result = EventParser.parse(`
            ## Name
            
            My Event 2019
            
            ## Abbreviation
            
            ME 2019
            
            ## Icon
            
            ![photo](./images/myevent2019.jpg)
            
            ## Link
            
            https://myevent.org/2019            
        `);
        let expected = {
            hasErrors: false,
            result: {
                name: "My Event 2019",
                abbreviation: "ME 2019",
                link: "https://myevent.org/2019",
                icon: {
                    link: "./images/myevent2019.jpg",
                    title: "photo"
                }
            }
        };
        expect(result).toEqual(expected);
    });

    it('simple parse element case', function () {
        let result = EventParser.parseElement( TitleParser.parse(`
            ## Name
            
            My Event 2015
            
            ## Abbreviation
            
            ME 2015        
        `));
        let expected = {
            hasErrors: false,
            result: {
                name: "My Event 2015",
                abbreviation: "ME 2015",
            }
        };
        expect(result).toEqual(expected);
    });
});


import EventBuilder from "./EventBuilder";
import {ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import {Image} from "../interfaces/Image";
import {Event} from "../interfaces/Publication";
import ImageBuilderTestHelper from "./ImageBuilder.test";
import AuthorBuilder from "./AuthorBuilder";
import AuthorBuilderTestHelper from "./AuthorBuilder.test";

export default class EventBuilderTestHelper {

    static readonly TEST_NAME: string = "Stark Meet up";
    static readonly TEST_ABBREVIATION: string = "Start M";
    static readonly TEST_LINK: string = "http://meetup.stark.com";
    static readonly TEST_EMAIL: string = "meetup@stark.com";

    static readonly TEST_ICON = ImageBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withLink("http://meetup.stark.com/icon.png")
        .withTitle("Stark Meet up Icon")
        .buildOrFail();

    public static getBuilderWithAllAttributes(): EventBuilder {
        return new EventBuilder()
            .withName(EventBuilderTestHelper.TEST_NAME)
            .withAbbreviation(EventBuilderTestHelper.TEST_ABBREVIATION)
            .withEmail(EventBuilderTestHelper.TEST_EMAIL)
            .withIcon(EventBuilderTestHelper.TEST_ICON)
            .withLink(EventBuilderTestHelper.TEST_LINK)
    }

    public static getWithAllAttributes(): Event {
        return {
            name: EventBuilderTestHelper.TEST_NAME,
            abbreviation: EventBuilderTestHelper.TEST_ABBREVIATION,
            icon: EventBuilderTestHelper.TEST_ICON,
            link: EventBuilderTestHelper.TEST_LINK
        }
    }

    public static getBuilderWithRequired(): EventBuilder {
        return new EventBuilder()
            .withName(EventBuilderTestHelper.TEST_NAME);
    }

    public static getWithRequired(): Event {
        return {
            name: EventBuilderTestHelper.TEST_NAME
        }
    }

    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Event",
                    attribute: "name",
                    message: "Name is required"
                },
            ]
        };
    }
}

describe('test Event Builder', function() {
    it('check missing all', function() {
        let result = new EventBuilder().build();
        let expected: ValidationErrors = EventBuilderTestHelper.getErrorMissingRequired();

        expect(result).toEqual(expected);
    });
    it('check having all', function() {
        let result:ValidationResult<Event> = EventBuilderTestHelper.getBuilderWithAllAttributes().build();
        let expected = {
            hasErrors: false,
            result: EventBuilderTestHelper.getWithAllAttributes()
        };

        expect(result).toEqual(expected);
    });
    it('check having required', function() {
        let result:ValidationResult<Event> = EventBuilderTestHelper.getBuilderWithRequired().build();
        let expected = {
            hasErrors: false,
            result: EventBuilderTestHelper.getWithRequired()
        };

        expect(result).toEqual(expected);
    });
    it('check missing exception', function() {
        expect(()=>{
            new EventBuilder().buildOrFail();
        }).toThrow();
    });
    it('check required not throw exception', function() {
        expect((()=>{
            return EventBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( EventBuilderTestHelper.getWithRequired() )
    });
});
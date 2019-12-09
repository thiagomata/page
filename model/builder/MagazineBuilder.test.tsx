import MagazineBuilder from "./MagazineBuilder";
import {ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import {Magazine} from "../interfaces/Publication";
import ImageBuilderTestHelper from "./ImageBuilder.test";

export default class MagazineBuilderTestHelper {

    static readonly TEST_NAME: string = "Stark Meet up";
    static readonly TEST_ABBREVIATION: string = "Start M";
    static readonly TEST_LINK: string = "http://meetup.stark.com";
    static readonly TEST_EMAIL: string = "meetup@stark.com";

    static readonly TEST_ICON = ImageBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withLink("http://meetup.stark.com/icon.png")
        .withTitle("Stark Meet up Icon")
        .buildOrFail();

    public static getBuilderWithAllAttributes(): MagazineBuilder {
        return new MagazineBuilder()
            .withName(MagazineBuilderTestHelper.TEST_NAME)
            .withAbbreviation(MagazineBuilderTestHelper.TEST_ABBREVIATION)
            .withEmail(MagazineBuilderTestHelper.TEST_EMAIL)
            .withIcon(MagazineBuilderTestHelper.TEST_ICON)
            .withLink(MagazineBuilderTestHelper.TEST_LINK)
    }

    public static getWithAllAttributes(): Magazine {
        return {
            name: MagazineBuilderTestHelper.TEST_NAME,
            abbreviation: MagazineBuilderTestHelper.TEST_ABBREVIATION,
            icon: MagazineBuilderTestHelper.TEST_ICON,
            link: MagazineBuilderTestHelper.TEST_LINK
        }
    }

    public static getBuilderWithRequired(): MagazineBuilder {
        return new MagazineBuilder()
            .withName(MagazineBuilderTestHelper.TEST_NAME);
    }

    public static getWithRequired(): Magazine {
        return {
            name: MagazineBuilderTestHelper.TEST_NAME
        }
    }

    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Magazine",
                    attribute: "name",
                    message: "Name is required"
                },
            ]
        };
    }
}

describe('test Magazine Builder', function() {
    it('check missing all', function() {
        let result = new MagazineBuilder().build();
        let expected: ValidationErrors = MagazineBuilderTestHelper.getErrorMissingRequired();

        expect(result).toEqual(expected);
    });
    it('check having all', function() {
        let result:ValidationResult<Magazine> = MagazineBuilderTestHelper.getBuilderWithAllAttributes().build();
        let expected = {
            hasErrors: false,
            result: MagazineBuilderTestHelper.getWithAllAttributes()
        };

        expect(result).toEqual(expected);
    });
    it('check having required', function() {
        let result:ValidationResult<Magazine> = MagazineBuilderTestHelper.getBuilderWithRequired().build();
        let expected = {
            hasErrors: false,
            result: MagazineBuilderTestHelper.getWithRequired()
        };

        expect(result).toEqual(expected);
    });
    it('check missing exception', function() {
        expect(()=>{
            new MagazineBuilder().buildOrFail();
        }).toThrow();
    });
    it('check required not throw exception', function() {
        expect((()=>{
            return MagazineBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( MagazineBuilderTestHelper.getWithRequired() )
    });
});
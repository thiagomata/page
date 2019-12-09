import {ValidationErrors} from "../interfaces/ValidationError";
import InstitutionBuilder from "./InstitutionBuilder";
import {Institution} from "../interfaces/Publication";
import EventBuilder from "./EventBuilder";
import EventBuilderTestHelper from "./EventBuilder.test";

export default class InstitutionBuilderTestHelper {

    static readonly TEST_INSTITUTION_NAME = "University of the Test";
    static readonly TEST_INSTITUTION_ABBREVIATION = "UOTT";
    static readonly TEST_INSTITUTION_LINK = "http://universityofthetest.org";
    static readonly TEST_INSTITUTION_EMAIL = "contact@uoot.org";
    static readonly TEST_INSTITUTION_ICON = {
        title: "University of the Test Icon",
        link: "http://universityofthetest.org/icon.png",
        width: 333,
        height: 444
    };

    public static getBuilderWithAllAttributes(): InstitutionBuilder {
        return new InstitutionBuilder()
            .withName(InstitutionBuilderTestHelper.TEST_INSTITUTION_NAME)
            .withAbbreviation(InstitutionBuilderTestHelper.TEST_INSTITUTION_ABBREVIATION)
            .withLink(InstitutionBuilderTestHelper.TEST_INSTITUTION_LINK)
            .withIcon(InstitutionBuilderTestHelper.TEST_INSTITUTION_ICON)
            .withEmail(InstitutionBuilderTestHelper.TEST_INSTITUTION_EMAIL)
    }

    public static getWithAllAttributes(): Institution {
        return {
            name: InstitutionBuilderTestHelper.TEST_INSTITUTION_NAME,
            abbreviation: InstitutionBuilderTestHelper.TEST_INSTITUTION_ABBREVIATION,
            link: InstitutionBuilderTestHelper.TEST_INSTITUTION_LINK,
            icon: InstitutionBuilderTestHelper.TEST_INSTITUTION_ICON,
            email: InstitutionBuilderTestHelper.TEST_INSTITUTION_EMAIL
        }
    }

    public static getBuilderWithRequired(): InstitutionBuilder {
        return new InstitutionBuilder()
            .withName(InstitutionBuilderTestHelper.TEST_INSTITUTION_NAME);
    }

    public static getWithRequired(): Institution {
        return {
            name: InstitutionBuilderTestHelper.TEST_INSTITUTION_NAME
        }
    }
    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Institution",
                    attribute: "name",
                    message: "Name is required"
                }
            ]
        };
    }
}

describe('test Institution Builder', function() {

    it('check missing all', function() {
        let result = new InstitutionBuilder().build();
        // @ts-ignore
        let expected = InstitutionBuilderTestHelper.getErrorMissingRequired();

        expect(result).toStrictEqual(expected);
    });

    it('check required', function() {
        let result = InstitutionBuilderTestHelper.getBuilderWithRequired().build();
        let expected = InstitutionBuilderTestHelper.getWithRequired();

        expect(result).toEqual({
            hasErrors: false,
            result: expected
        });
    });

    it('check having all', function() {
        let result = InstitutionBuilderTestHelper.getBuilderWithAllAttributes().build();
        let expected = InstitutionBuilderTestHelper.getWithAllAttributes();

        expect(result).toEqual({
            hasErrors:false,
            result: expected
        });
    });
    it('check missing exception', function() {
        expect(()=>{
            new InstitutionBuilder().buildOrFail();
        }).toThrow();
    });
    it('check required not throw exception', function() {
        expect((()=>{
            return InstitutionBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( InstitutionBuilderTestHelper.getWithRequired() )
    });
});
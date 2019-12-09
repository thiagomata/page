import AuthorBuilder from "./AuthorBuilder";
import {ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import ProfileBuilderTestHelper from "./ProfileBuilder.test";
import {Profile} from "../interfaces/Profile";
import {Image} from "../interfaces/Image";
import {Author} from "../interfaces/Publication";
import InstitutionBuilderTestHelper from "./InstitutionBuilder.test";
import ImageBuilderTestHelper from "./ImageBuilder.test";
import AboutBuilder from "./AboutBuilder";
import AboutBuilderTestHelper from "./AboutBuilder.test";

export default class AuthorBuilderTestHelper {

    static readonly TEST_NAME: string = "Steven Sea Goal";
    static readonly TEST_ABBREVIATION: string = "SS Goal";
    static readonly TEST_LINK: string = "http://stevenseagoal.com";
    static readonly TEST_EMAIL: string = "stevenseagoal@gmail.com";
    static readonly TEST_INSTITUTION = InstitutionBuilderTestHelper.getWithAllAttributes();

    static readonly TEST_AVATAR = ImageBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withLink("http://gravatar.com/myphoto.jpg")
        .withTitle("Steven Sea Goal Avatar")
        .buildOrFail();

    static readonly TEST_PROFILES: Profile[] = [ ProfileBuilderTestHelper.getWithRequired() ];

    public static getBuilderWithAllAttributes(): AuthorBuilder {
        return new AuthorBuilder()
            .withName(AuthorBuilderTestHelper.TEST_NAME)
            .withAbbreviation(AuthorBuilderTestHelper.TEST_ABBREVIATION)
            .withEmail(AuthorBuilderTestHelper.TEST_EMAIL)
            .withAvatar(AuthorBuilderTestHelper.TEST_AVATAR)
            .withInstitution(AuthorBuilderTestHelper.TEST_INSTITUTION)
            .withLink(AuthorBuilderTestHelper.TEST_LINK)
            .withProfiles(AuthorBuilderTestHelper.TEST_PROFILES)
    }

    public static getWithAllAttributes(): Author {
        return {
            name: AuthorBuilderTestHelper.TEST_NAME,
            abbreviation: AuthorBuilderTestHelper.TEST_ABBREVIATION,
            email: AuthorBuilderTestHelper.TEST_EMAIL,
            avatar: AuthorBuilderTestHelper.TEST_AVATAR,
            institution: AuthorBuilderTestHelper.TEST_INSTITUTION,
            link: AuthorBuilderTestHelper.TEST_LINK,
            profiles: AuthorBuilderTestHelper.TEST_PROFILES
        }
    }

    public static getBuilderWithRequired(): AuthorBuilder {
        return new AuthorBuilder()
            .withName(AuthorBuilderTestHelper.TEST_NAME);
    }

    public static getWithRequired(): Author {
        return {
            name: AuthorBuilderTestHelper.TEST_NAME
        }
    }

    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Author",
                    attribute: "name",
                    message: "Name is required"
                },
            ]
        };
    }
}

describe('test Author Builder', function() {
    it('check missing all', function() {
        let result = new AuthorBuilder().build();
        // @ts-ignore
        let expected: ValidationErrors = AuthorBuilderTestHelper.getErrorMissingRequired();

        expect(result).toEqual(expected);
    });
    it('check having all', function() {
        let result:ValidationResult<Author> = AuthorBuilderTestHelper.getBuilderWithAllAttributes().build();
        // @ts-ignore
        let expected = {
            hasErrors: false,
            result: AuthorBuilderTestHelper.getWithAllAttributes()
        };

        expect(result).toEqual(expected);
    });
    it('check required', function() {
        let result:ValidationResult<Author> = AuthorBuilderTestHelper.getBuilderWithRequired().build();
        // @ts-ignore
        let expected = {
            hasErrors: false,
            result: AuthorBuilderTestHelper.getWithRequired()
        };

        expect(result).toEqual(expected);
    });
    it('check missing exception', function() {
        expect(()=>{
            new AuthorBuilder().buildOrFail();
        }).toThrow();
    });
    it('check required not throw exception', function() {
        expect((()=>{
            return AuthorBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( AuthorBuilderTestHelper.getWithRequired() )
    });
});
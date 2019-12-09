import AboutBuilder from "./AboutBuilder";
import {ValidationError, ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import ProfileBuilder from "./ProfileBuilder";
import {Profile} from "../interfaces/Profile";
import ImageBuilderTestHelper from "./ImageBuilder.test";
import InstitutionBuilder from "./InstitutionBuilder";
import InstitutionBuilderTestHelper from "./InstitutionBuilder.test";

export default class ProfileBuilderTestHelper {

    static readonly TEST_PROFILE_NAME = "Some Profile Name";
    static readonly TEST_PROFILE_USERNAME = "Some Profile Username";
    static readonly TEST_PROFILE_LINK = "Some Profile Link";
    static readonly TEST_PROFILE_ICON = ImageBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withLink("http://profile.com/icon.png")
        .withTitle("Social Network Profile Picture")
        .buildOrFail();

    public static getBuilderWithAllAttributes(): ProfileBuilder {
        return new ProfileBuilder()
            .withName(ProfileBuilderTestHelper.TEST_PROFILE_NAME)
            .withUsername(ProfileBuilderTestHelper.TEST_PROFILE_USERNAME)
            .withLink(ProfileBuilderTestHelper.TEST_PROFILE_LINK)
            .withIcon(ProfileBuilderTestHelper.TEST_PROFILE_ICON)
    }

    public static getWithAllAttributes(): Profile {
        return {
            name: ProfileBuilderTestHelper.TEST_PROFILE_NAME,
            username: ProfileBuilderTestHelper.TEST_PROFILE_USERNAME,
            link: ProfileBuilderTestHelper.TEST_PROFILE_LINK,
            icon: ProfileBuilderTestHelper.TEST_PROFILE_ICON,
        }
    }

    public static getBuilderWithRequired(): ProfileBuilder {
        return new ProfileBuilder()
            .withName(ProfileBuilderTestHelper.TEST_PROFILE_NAME);
    }

    public static getWithRequired(): Profile {
        return {
            name: ProfileBuilderTestHelper.TEST_PROFILE_NAME
        }
    }
    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Profile",
                    attribute: "name",
                    message: "Name is required"
                }
            ]
        };
    }
}

describe('test Profile Builder', function() {

    it('check missing all', function() {
        let result = new ProfileBuilder().build();
        // @ts-ignore
        let expected = ProfileBuilderTestHelper.getErrorMissingRequired();

        expect(result).toStrictEqual(expected);
    });

    it('check required', function() {
        let result = ProfileBuilderTestHelper.getBuilderWithRequired().build();
        // @ts-ignore
        let expected = ProfileBuilderTestHelper.getWithRequired();

        expect(result).toEqual({
            hasErrors: false,
            result: expected
        });
    });

    it('check having all', function() {
        let result = ProfileBuilderTestHelper.getBuilderWithAllAttributes().build();

        // @ts-ignore
        let expected = ProfileBuilderTestHelper.getWithAllAttributes();

        expect(result).toEqual({
            hasErrors:false,
            result: expected
        });
    });
    it('check missing exception', function() {
        expect(()=>{
            new ProfileBuilder().buildOrFail();
        }).toThrow();
    });
    it('check required not throw exception', function() {
        expect((()=>{
            return ProfileBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( ProfileBuilderTestHelper.getWithRequired() )
    });
});
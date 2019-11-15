import AboutBuilder from "./AboutBuilder";
import {ValidationError, ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import ProfileBuilder from "./ProfileBuilder";
import {Profile} from "../interfaces/Profile";

export default class ProfileBuilderTestHelper {

    static readonly TEST_PROFILE_NAME = "Some Profile Name";
    static readonly TEST_PROFILE_USERNAME = "Some Profile Username";
    static readonly TEST_PROFILE_LINK = "Some Profile Link";

    public static getBuilderWithAllAttributes(): ProfileBuilder {
        return new ProfileBuilder()
            .withName(ProfileBuilderTestHelper.TEST_PROFILE_NAME)
            .withUsername(ProfileBuilderTestHelper.TEST_PROFILE_USERNAME)
            .withLink(ProfileBuilderTestHelper.TEST_PROFILE_LINK)
    }

    public static getWithAllAttributes(): Profile {
        return {
            name: ProfileBuilderTestHelper.TEST_PROFILE_NAME,
            username: ProfileBuilderTestHelper.TEST_PROFILE_USERNAME,
            link: ProfileBuilderTestHelper.TEST_PROFILE_LINK
        }
    }

    public static getBuilderWithRequired(): ProfileBuilder {
        return new ProfileBuilder()
            .withName("Some Profile Name");
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
});
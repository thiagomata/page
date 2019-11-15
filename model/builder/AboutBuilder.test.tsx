import AboutBuilder from "./AboutBuilder";
import {ValidationError, ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import ProfileBuilder from "./ProfileBuilder";
import ProfileBuilderTestHelper from "./ProfileBuilder.test";
import {Profile} from "../interfaces/Profile";
import {Image} from "../interfaces/Image";
import {About} from "../interfaces/About";

export default class AboutBuilderTestHelper {

    static readonly TEST_ABOUT_NAME: string = "Some About Name";
    static readonly TEST_FULL_NAME: string = "Some About Full Name";
    static readonly TEST_WEBSITE: string = "Some About Website";
    static readonly TEST_SUMMARY: string = "Some About Summary";
    static readonly TEST_LOCATION: string = "Some About Location";
    static readonly TEST_EMAIL: string = "Some About Email";
    static readonly TEST_LABEL: string = "Some About Label";
    static readonly TEST_PHONE: string = "Some About Phone";
    static readonly TEST_PROFILES: Profile[] = [ ProfileBuilderTestHelper.getWithRequired() ];

    // @todo replace by a call to the ImageTestHelper
    // @see ImageTestHelper
    static readonly TEST_PICTURE: Image = {
        link: "Some About Image Link"
    };

    public static getBuilderWithAllAttributes(): AboutBuilder {
        return new AboutBuilder()
            .withName(AboutBuilderTestHelper.TEST_ABOUT_NAME)
            .withFullName(AboutBuilderTestHelper.TEST_FULL_NAME)
            .withWebsite(AboutBuilderTestHelper.TEST_WEBSITE)
            .withSummary(AboutBuilderTestHelper.TEST_SUMMARY)
            .withLocation(AboutBuilderTestHelper.TEST_LOCATION)
            .withEmail(AboutBuilderTestHelper.TEST_EMAIL)
            .withLabel(AboutBuilderTestHelper.TEST_LABEL)
            .withPhone(AboutBuilderTestHelper.TEST_PHONE)
            .withProfiles(AboutBuilderTestHelper.TEST_PROFILES)
            .withPicture(AboutBuilderTestHelper.TEST_PICTURE)
    }

    public static getWithAllAttributes(): About {
        return {
            name: AboutBuilderTestHelper.TEST_ABOUT_NAME,
            fullName: AboutBuilderTestHelper.TEST_FULL_NAME,
            website: AboutBuilderTestHelper.TEST_WEBSITE,
            summary: AboutBuilderTestHelper.TEST_SUMMARY,
            location: AboutBuilderTestHelper.TEST_LOCATION,
            email: AboutBuilderTestHelper.TEST_EMAIL,
            label: AboutBuilderTestHelper.TEST_LABEL,
            phone: AboutBuilderTestHelper.TEST_PHONE,
            profiles: AboutBuilderTestHelper.TEST_PROFILES,
            picture: AboutBuilderTestHelper.TEST_PICTURE
        }
    }

    public static getBuilderWithRequired(): AboutBuilder {
        return new AboutBuilder()
            .withName(AboutBuilderTestHelper.TEST_ABOUT_NAME);
    }

    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "About",
                    attribute: "name",
                    message: "Name is required"
                },
                {
                    element: "About",
                    attribute: "fullName",
                    message: "Full name is required"
                },
                {
                    element: "About",
                    attribute: "label",
                    message: "Label is required"
                },
                {
                    element: "About",
                    attribute: "picture",
                    message: "Picture is required"
                },
                {
                    element: "About",
                    attribute: "summary",
                    message: "Summary is required"
                },
                {
                    element: "About",
                    attribute: "website",
                    message: "Website is required"
                }
            ]
        };
    }
}

describe('test About Builder', function() {
    it('check missing all', function() {
        let result = new AboutBuilder().build();
        // @ts-ignore
        let expected: ValidationErrors = AboutBuilderTestHelper.getErrorMissingRequired();

        expect(result).toEqual(expected);
    });
    it('check having all', function() {
        let result:ValidationResult<About> = AboutBuilderTestHelper.getBuilderWithAllAttributes().build();
        // @ts-ignore
        let expected = {
            hasErrors: false,
            result: AboutBuilderTestHelper.getWithAllAttributes()
        };

        expect(result).toEqual(expected);
    });
});
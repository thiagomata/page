import AboutBuilder from "./AboutBuilder";
import {ValidationError, ValidationErrors, ValidationResult} from "../interfaces/ValidationError";
import ImageBuilder from "./ImageBuilder";
import {Image} from "../interfaces/Image";

export default class ImageBuilderTestHelper {

    static readonly TEST_IMAGE_TITLE = "Some Image Title";
    static readonly TEST_IMAGE_WIDTH = 100;
    static readonly TEST_IMAGE_HEIGHT = 200;
    static readonly TEST_IMAGE_LINK = "http://somelink.com/my-image.png";

    public static getBuilderWithAllAttributes(): ImageBuilder {
        return new ImageBuilder()
            .withTitle(ImageBuilderTestHelper.TEST_IMAGE_TITLE)
            .withWidth(ImageBuilderTestHelper.TEST_IMAGE_WIDTH)
            .withHeight(ImageBuilderTestHelper.TEST_IMAGE_HEIGHT)
            .withLink(ImageBuilderTestHelper.TEST_IMAGE_LINK)
    }

    public static getWithAllAttributes(): Image {
        return {
            title: ImageBuilderTestHelper.TEST_IMAGE_TITLE,
            link: ImageBuilderTestHelper.TEST_IMAGE_LINK,
            width: ImageBuilderTestHelper.TEST_IMAGE_WIDTH,
            height: ImageBuilderTestHelper.TEST_IMAGE_HEIGHT,
        }
    }

    public static getBuilderWithRequired(): ImageBuilder {
        return new ImageBuilder()
            .withLink(ImageBuilderTestHelper.TEST_IMAGE_LINK);
    }

    public static getWithRequired(): Image {
        return {
            link: ImageBuilderTestHelper.TEST_IMAGE_LINK
        }
    }
    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Image",
                    attribute: "link",
                    message: "Link is required"
                }
            ]
        };
    }
}

describe('test Image Builder', function() {

    it('check missing all', function() {
        let result = new ImageBuilder().build();
        // @ts-ignore
        let expected = ImageBuilderTestHelper.getErrorMissingRequired();

        expect(result).toStrictEqual(expected);
    });

    it('check required', function() {
        let result = ImageBuilderTestHelper.getBuilderWithRequired().build();
        // @ts-ignore
        let expected = ImageBuilderTestHelper.getWithRequired();

        expect(result).toEqual({
            hasErrors: false,
            result: expected
        });
    });

    it('check having all', function() {
        let result = ImageBuilderTestHelper.getBuilderWithAllAttributes().build();

        // @ts-ignore
        let expected = ImageBuilderTestHelper.getWithAllAttributes();

        expect(result).toEqual({
            hasErrors:false,
            result: expected
        });
    });
});
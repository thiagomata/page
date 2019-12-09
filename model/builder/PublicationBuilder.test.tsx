import {ValidationErrors} from "../interfaces/ValidationError";
import PublicationBuilder from "./PublicationBuilder";
import {Publication} from "../interfaces/Publication";
import ImageBuilderTestHelper from "./ImageBuilder.test";
import AuthorBuilderTestHelper from "./AuthorBuilder.test";
import EventBuilderTestHelper from "./EventBuilder.test";
import InstitutionBuilderTestHelper from "./InstitutionBuilder.test";
import MagazineBuilderTestHelper from "./MagazineBuilder.test";

export default class PublicationBuilderTestHelper {

    static readonly TEST_PUBLICATION_TITLE = "Some Publication Title";
    static readonly TEST_PUBLICATION_SUMMARY = "This is some gourmet publication";
    static readonly TEST_PUBLICATION_LINK = "http://publicationlink.edu/mypaper.md";
    static readonly TEST_PUBLICATION_RELEASE_DATE = new Date();
    static readonly TEST_PUBLICATION_RELEVANCE = 3;

    static readonly TEST_PUBLICATION_ICON = ImageBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withLink("http://Publication.com/icon.png")
        .withTitle("Social Network Publication Picture")
        .buildOrFail();

    static readonly TEST_PUBLICATION_AUTHOR = AuthorBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withName("Publication Author")
        .withEmail( "author@publication.org" )
        .buildOrFail();

    static readonly TEST_PUBLICATION_EVENT = EventBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withName("Publication Event")
        .withEmail("event@publication.org")
        .buildOrFail();

    static readonly TEST_PUBLICATION_MAGAZINE = MagazineBuilderTestHelper
        .getBuilderWithAllAttributes()
        .withName("Publication Event")
        .withEmail("event@publication.org")
        .buildOrFail();

    static readonly TEST_PUBLICATION_KEYWORDS = [ "some", "keyword", "test" ];

    public static getBuilderWithAllAttributes(): PublicationBuilder {
        return new PublicationBuilder()
            .withTitle(PublicationBuilderTestHelper.TEST_PUBLICATION_TITLE)
            .withSummary(PublicationBuilderTestHelper.TEST_PUBLICATION_SUMMARY)
            .withReleaseDate(PublicationBuilderTestHelper.TEST_PUBLICATION_RELEASE_DATE)
            .withAuthors([ PublicationBuilderTestHelper.TEST_PUBLICATION_AUTHOR ] )
            .withThumbnail(PublicationBuilderTestHelper.TEST_PUBLICATION_ICON)
            .withKeywords(PublicationBuilderTestHelper.TEST_PUBLICATION_KEYWORDS)
            .withRelevance(PublicationBuilderTestHelper.TEST_PUBLICATION_RELEVANCE)
            .withEvent(PublicationBuilderTestHelper.TEST_PUBLICATION_EVENT)
            .withMagazine(PublicationBuilderTestHelper.TEST_PUBLICATION_MAGAZINE)
            .withLink(PublicationBuilderTestHelper.TEST_PUBLICATION_LINK);
    }

    public static getWithAllAttributes(): Publication {
        return {
            title: PublicationBuilderTestHelper.TEST_PUBLICATION_TITLE,
            summary: PublicationBuilderTestHelper.TEST_PUBLICATION_SUMMARY,
            releaseDate: PublicationBuilderTestHelper.TEST_PUBLICATION_RELEASE_DATE,
            authors: [PublicationBuilderTestHelper.TEST_PUBLICATION_AUTHOR],
            thumbnail: PublicationBuilderTestHelper.TEST_PUBLICATION_ICON,
            keywords: PublicationBuilderTestHelper.TEST_PUBLICATION_KEYWORDS,
            relevance: PublicationBuilderTestHelper.TEST_PUBLICATION_RELEVANCE,
            event: PublicationBuilderTestHelper.TEST_PUBLICATION_EVENT,
            magazine: PublicationBuilderTestHelper.TEST_PUBLICATION_MAGAZINE,
            link: PublicationBuilderTestHelper.TEST_PUBLICATION_LINK
        }
    }

    public static getBuilderWithRequired(): PublicationBuilder {
        return new PublicationBuilder()
            .withTitle(PublicationBuilderTestHelper.TEST_PUBLICATION_TITLE)
            .withReleaseDate(PublicationBuilderTestHelper.TEST_PUBLICATION_RELEASE_DATE)
            .withSummary(PublicationBuilderTestHelper.TEST_PUBLICATION_SUMMARY)
            .withAuthors([ PublicationBuilderTestHelper.TEST_PUBLICATION_AUTHOR ] )
        ;
    }

    public static getWithRequired(): Publication {
        return {
            title: PublicationBuilderTestHelper.TEST_PUBLICATION_TITLE,
            releaseDate: PublicationBuilderTestHelper.TEST_PUBLICATION_RELEASE_DATE,
            summary: PublicationBuilderTestHelper.TEST_PUBLICATION_SUMMARY,
            authors: [ PublicationBuilderTestHelper.TEST_PUBLICATION_AUTHOR ],
        }
    }
    public static getErrorMissingRequired(): ValidationErrors {
        return {
            hasErrors: true,
            errors: [
                {
                    element: "Publication",
                    attribute: "title",
                    message: "Title is required"
                },
                {
                    element: "Publication",
                    attribute: "summary",
                    message: "Summary is required"
                },
                {
                    element: "Publication",
                    attribute: "authors",
                    message: "Authors are required"
                },
                {
                    element: "Publication",
                    attribute: "releaseDate",
                    message: "Release Date is required"
                },
            ]
        };
    }
}

describe('test Publication Builder', function() {

    it('check missing all', function() {
        let result = new PublicationBuilder().build();
        let expected = PublicationBuilderTestHelper.getErrorMissingRequired();

        expect(result).toEqual(expected);
    });

    it('check required', function() {
        let result = PublicationBuilderTestHelper.getBuilderWithRequired().build();
        let expected = PublicationBuilderTestHelper.getWithRequired();

        expect(result).toEqual({
            hasErrors: false,
            result: expected
        });
    });

    it('check having all', function() {
        let result = PublicationBuilderTestHelper.getBuilderWithAllAttributes().build();
        let expected = PublicationBuilderTestHelper.getWithAllAttributes();

        expect(result).toEqual({
            hasErrors:false,
            result: expected
        });
    });

    it('check missing exception', function() {
        expect(()=>{
            new PublicationBuilder().buildOrFail();
        }).toThrow();
    });

    it('check required not throw exception', function() {
        expect((()=>{
            return PublicationBuilderTestHelper.getBuilderWithRequired().buildOrFail()
        })()).toEqual( PublicationBuilderTestHelper.getWithRequired() )
    });
});
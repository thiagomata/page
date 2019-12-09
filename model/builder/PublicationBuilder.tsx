import {Image} from "../interfaces/Image";
import {Author, Event, Magazine, Publication} from "../interfaces/Publication";
import {ValidationError, ValidationResult} from "../interfaces/ValidationError";
import BuilderUtils from "../utils/BuilderUtils";

export default class PublicationBuilder {

    static readonly PUBLICATION = "Publication";

    private relevance?: number;
    private title?: string;
    private summary?: string;
    private authors?: Author[];
    private releaseDate?: Date;
    private event?: Event;
    private magazine?: Magazine;
    private keywords?: string[];
    private thumbnail?: Image;
    private link?: string;

    public withRelevance(relevance: number): PublicationBuilder {
        this.relevance = relevance;
        return this;
    }

    public withTitle(title: string): PublicationBuilder {
        this.title = title;
        return this;
    }

    public withSummary(summary: string): PublicationBuilder {
        this.summary = summary;
        return this;
    }

    public withLink(link: string): PublicationBuilder {
        this.link = link;
        return this;
    }

    public withAuthors(authors: Author[]): PublicationBuilder {
        this.authors = authors;
        return this;
    }

    public withReleaseDate(releaseDate: Date): PublicationBuilder {
        this.releaseDate = releaseDate;
        return this;
    }

    public withEvent(event: Event): PublicationBuilder {
        this.event = event;
        return this;
    }

    public withMagazine(magazine: Magazine): PublicationBuilder {
        this.magazine = magazine;
        return this;
    }

    public withKeywords(keywords: string[]): PublicationBuilder {
        this.keywords = keywords;
        return this;
    }

    public withThumbnail(thumbnail: Image): PublicationBuilder {
        this.thumbnail = thumbnail;
        return this;
    }

    public buildOrFail(): Publication {
        return BuilderUtils.buildOrFail(this.build());
    }

    public build(): ValidationResult<Publication> {

        let errors: ValidationError[] = [];

        if (!this.title) {
            errors.push(
                {
                    element: PublicationBuilder.PUBLICATION,
                    attribute: "title",
                    message: "Title is required"
                }
            );
        }

        if (!this.summary) {
            errors.push(
                {
                    element: PublicationBuilder.PUBLICATION,
                    attribute: "summary",
                    message: "Summary is required"
                }
            );
        }

        if (!this.authors) {
            errors.push(
                {
                    element: PublicationBuilder.PUBLICATION,
                    attribute: "authors",
                    message: "Authors are required"
                }
            );
        }

        if (!this.releaseDate) {
            errors.push(
                {
                    element: PublicationBuilder.PUBLICATION,
                    attribute: "releaseDate",
                    message: "Release Date is required"
                }
            );
        }

        if (errors.length) {
            return {
                hasErrors: true,
                errors: errors
            }
        }

        /**
         * Checking again the required fields, throwing an error
         * if any is missing to make the typescript type checking happy.
         *
         * This exception should never happening
         */
        if (
            !this.title ||
            !this.summary ||
            !this.authors ||
            !this.releaseDate
        ) {
            /* istanbul ignore next */
            throw new Error("Unexpected missing fields after validation");
        }

        let publication: Publication = {
            title: this.title,
            summary: this.summary,
            authors: this.authors,
            releaseDate: this.releaseDate,
            relevance: this.relevance,
            event: this.event,
            magazine: this.magazine,
            keywords: this.keywords,
            thumbnail: this.thumbnail,
            link: this.link
        };

        return {
            hasErrors: false,
            result: publication
        }
    }
}
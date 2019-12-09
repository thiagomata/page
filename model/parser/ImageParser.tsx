import TagParser, { ParseTagElement } from "./TagParser";
import { ValidationResult } from "../interfaces/ValidationError";
import { Image } from "../interfaces/Image";
import ImageBuilder from "../builder/ImageBuilder";
import TitleParser, { ParseElement } from "./TitleParser";
import Link from "next/link";
import LinkParser from "./LinkParser";
import StringUtils from "../utils/StringUtils";

export default class ImageParser {
  static readonly PARSE_WIDTH = "width";

  static readonly PARSE_HEIGHT = "height";

  static readonly PARSE_TITLE = "title";

  static readonly PARSE_SRC = "src";

  static readonly PARSE_ALT = "alt";

  public static parse(content: string): ValidationResult<Image> {
    let trimContent = content.trim();
    if (trimContent.charAt(0) == "<") {
      return ImageParser.parseStringAsXml(trimContent);
    } else {
      return ImageParser.parseStringAsMarkdown(trimContent);
    }
  }

  public static parseElement(
    parseElement: ParseElement
  ): ValidationResult<Image> {
    if (parseElement.content && parseElement.content.charAt(0) == "<") {
      return ImageParser.parseStringAsXml(parseElement.content);
    } else {
      return ImageParser.parseElementAsMarkdown(parseElement);
    }
  }

  private static parseStringAsMarkdown(
    content: string
  ): ValidationResult<Image> {
    let rootElement: ParseElement = TitleParser.parse(content);
    return ImageParser.parseElementAsMarkdown(rootElement);
  }

  private static parseElementAsMarkdown(
    rootElement: ParseElement
  ): ValidationResult<Image> {
    let builder = new ImageBuilder();
    if (rootElement.content) {
      let titleElement: { title: string; link?: string } = LinkParser.parse(
        rootElement.content
      );
      if (titleElement.link) {
        ImageParser.setAttributeToTheBuilder(
          builder,
          ImageParser.PARSE_TITLE,
          titleElement.title
        );
        ImageParser.setAttributeToTheBuilder(
          builder,
          ImageParser.PARSE_SRC,
          titleElement.link
        );
      } else {
        /* default behavior is link only */
        ImageParser.setAttributeToTheBuilder(
          builder,
          ImageParser.PARSE_SRC,
          titleElement.title
        );
      }
    }
    for (let attributeName in rootElement.elements) {
      if (!rootElement.elements.hasOwnProperty(attributeName)) {
        /* istanbul ignore next */
        continue;
      }
      let currentElement = rootElement.elements[attributeName];
      if (!currentElement.content) {
        continue;
      }
      ImageParser.setAttributeToTheBuilder(
        builder,
        attributeName,
        currentElement.content
      );
    }
    return builder.build();
  }

  private static parseStringAsXml(content: string): ValidationResult<Image> {
    let img: ParseTagElement | null = null;
    let builder = new ImageBuilder();
    let tagParseResult = TagParser.parseToTagElement(content);
    if (tagParseResult.hasErrors) {
      return tagParseResult;
    }
    let doc: ParseTagElement = tagParseResult.result;
    let test = doc.elements;
    if( test && doc.elements ) {
      let test2 = doc.elements["img"];
    }
    if (doc.elements && doc.elements.hasOwnProperty("img")) {
      img = doc.elements.img;
    }
    if (!img) {
      return {
        hasErrors: true,
        errors: [
          {
            attribute: "xml",
            element: "image",
            message: "Unable to find Image in the XML " + content
          }
        ]
      };
    }
    for (let attributeName in img.attributes) {
      if (!img.attributes.hasOwnProperty(attributeName)) {
        /* istanbul ignore next */
        continue;
      }
      ImageParser.setAttributeToTheBuilder(
        builder,
        attributeName,
        img.attributes[attributeName]
      );
    }
    return builder.build();
  }

  private static setAttributeToTheBuilder(
    builder: ImageBuilder,
    attributeName: string,
    attributeValue: string
  ) {
    let lowerAttribute: string = attributeName.toLowerCase();
    if (lowerAttribute == ImageParser.PARSE_WIDTH) {
      builder.withWidth(StringUtils.castToNumber(attributeValue));
    }
    if (lowerAttribute == ImageParser.PARSE_HEIGHT) {
      builder.withHeight(StringUtils.castToNumber(attributeValue));
    }
    if (lowerAttribute == ImageParser.PARSE_SRC) {
      builder.withLink(attributeValue);
    }
    if (
      lowerAttribute == ImageParser.PARSE_ALT ||
      lowerAttribute == ImageParser.PARSE_TITLE
    ) {
      builder.withTitle(attributeValue);
    }
  }
}

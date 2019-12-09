import ImageParser from "./ImageParser";
import LinkParser from "./LinkParser";
import { Image } from "../interfaces/Image";
import {ValidationErrors} from "../interfaces/ValidationError";

describe("image parser tests", function() {
  it("simple case", function() {
    let result = ImageParser.parse(
        '<img src="http://something.com/me.png" alt="this is me" width="123" height="456"/>'
    );
    let expectedImage: Image = {
      link: "http://something.com/me.png",
      title: "this is me",
      width: 123,
      height: 456
    };
    let expected = {
      hasErrors: false,
      result: expectedImage
    };
    expect(result).toEqual(expected);
  });

  it("ignored case", function() {
    let result = ImageParser.parse(
        `
        <img src="http://something.com/me.png" alt="this is me" width="123" height="456"/>
        <img src="http://www.ignored.com" alt="ignored"/>
        `
    );
    let expectedImage: Image = {
      link: "http://something.com/me.png",
      title: "this is me",
      width: 123,
      height: 456
    };
    let expected = {
      hasErrors: false,
      result: expectedImage
    };
    expect(result).toEqual(expected);
  });

  it("unclosed case", function() {
    let result = ImageParser.parse(
        '<img src="http://something.com/me.png" alt="this is me" width="123" height="456">'
    );
    expect(result.hasErrors).toEqual(true);
  });

  it("wrong xml tag case", function() {
    let result = ImageParser.parse(
        '<something src="http://something.com/me.png" alt="this is me" width="123" height="456"/>'
    );
    let expected: ValidationErrors = {
      hasErrors: true,
      errors: [
        {
          attribute: "xml",
          element: "image",
          message: 'Unable to find Image in the XML <something src="http://something.com/me.png" alt="this is me" width="123" height="456"/>'
        }
      ]
    };
    expect(result).toEqual(expected);
  });

  it("markdown all elements example", function() {
    let result = ImageParser.parse(`
        # Title
        this is me
        # Src
        http://something.com/me.png
        # Width
        123
        # Height
        456
            `);
    let expectedImage: Image = {
      link: "http://something.com/me.png",
      title: "this is me",
      width: 123,
      height: 456
    };
    let expected = {
      hasErrors: false,
      result: expectedImage
    };
    expect(result).toEqual(expected);
  });

  it("markdown compact example", function() {
    let result = ImageParser.parse(`
        [this is me](http://something.com/me.png)
        ## Width
        123
        ## Height
        456
            `);
    let expectedImage: Image = {
      link: "http://something.com/me.png",
      title: "this is me",
      width: 123,
      height: 456
    };
    let expected = {
      hasErrors: false,
      result: expectedImage
    };
    expect(result).toEqual(expected);
  });

  it("markdown empty example", function() {
    let result = ImageParser.parse(`
        ## Link
            `);
    expect(result.hasErrors).toEqual(true);
  });

  it("link only example", function() {
    let result = ImageParser.parse(`
        http://something.com/me.png
    `);
    let expectedImage: Image = {
      link: "http://something.com/me.png",
    };
    let expected = {
      hasErrors: false,
      result: expectedImage
    };
    expect(result).toEqual(expected);
  });});

import LinkParser from "./LinkParser";

describe('link parser tests', function() {
    it('simple case', function() {
        let result = LinkParser.parse('[@thiagomata](http://twitter.com/thiagomata)');
        let expected = {
            title: "@thiagomata",
            link: "http://twitter.com/thiagomata"
        };
        expect(result).toStrictEqual(expected);
    });

    it('not a link', function() {
        let result = LinkParser.parse('something');
        // @ts-ignore
        let expected = {
            title: "something"
        };

        expect(result).toStrictEqual(expected);
    });

    it('dealing with spaces', function() {
        let result = LinkParser.parse('[hello world](we do not validate links here)');
        let expected = {
            title: "hello world",
            link: "we do not validate links here"
        };
        expect(result).toStrictEqual(expected);
    });
});
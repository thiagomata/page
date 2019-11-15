const regex = /\[([^\]]*)\]\(([^\)]*)\)/;

export default class LinkParser {

    public static parse(content: string): {
        title: string,
        link?: string
    } {
        let matches;

        if ((matches = regex.exec(content)) !== null) {

            let result: {
                title: string,
                link?: string
            } = {
                title: ""
            };
            // The result can be accessed through the `m`-variable.
            matches.forEach((match: string, groupIndex: number) => {
                if (groupIndex == 1 ) {
                    result.title = match;
                }
                if (groupIndex == 2 ) {
                    result.link = match;
                }
            });
            return result;
        }
        return {
            title: content
        };
    }
}
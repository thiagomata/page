export interface ParseElement {
    elements: { [key: string]: ParseElement }
    content?: string;
}

export default class TitleParser {

    static setElementContent(element: ParseElement, content: string) {
        let trim_content = content.trim();
        if (trim_content.length == 0) {
            return;
        }
        element.content = trim_content;
    }

    static parse(content: string) {

        let element: ParseElement = {
            elements: {}
        };
        let root = element;
        let stack = [element];
        let lines: string[] = content.split("\n");
        let acc = [];
        for (let line_pos in lines) {
            let line = lines[line_pos];
            let trim_line: string = line.trim();
            if (trim_line.length == 0) {
                continue;
            }
            let is_header = trim_line[0] == "#";
            if (is_header) {
                this.setElementContent(element, acc.join(' '));
                let deep = (trim_line.match(/#*/) || [])[0].length;
                let title = trim_line.substr(deep).trim();
                let newElement: ParseElement = {
                    elements: {}
                };
                let parentDeep = deep - 1;
                /* safe approach to deal when parent does not exists */
                while (stack[parentDeep] == null) {
                    parentDeep -= 1
                }
                let parent = stack[parentDeep];
                this.addChildElement(parent, title, newElement);

                stack[deep] = newElement;
                stack.splice(deep + 1);
                element = newElement;
                acc = []
            } else {
                acc.push((" " + trim_line).trim())
            }
        }
        this.setElementContent(element, acc.join(' '));
        return root;
    }

    private static addChildElement(parent: ParseElement, title: string, newElement: ParseElement) {
        parent.elements[title] = newElement;
    }
}
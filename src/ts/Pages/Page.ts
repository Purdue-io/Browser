export class Page {
    protected readonly templateId: string;
    protected readonly urlSegment: string;
    protected readonly _content: Node;

    protected constructor(templateId: string, urlSegment: string) {
        this.templateId = templateId;
        this.urlSegment = urlSegment;
        if (templateId === "") {
            // For tests to run with mock pages
            this._content = document.createElement("div");
        } else {
            this._content = this.loadTemplate(this.templateId);
        }
    }

    public get content(): Node {
        return this._content;
    }

    private loadTemplate(templateId: string): Node {
        let templateElement = document.querySelector(`#${templateId}`) as HTMLTemplateElement;
        if (templateElement === null) {
            throw new Error(`Cannot find template element with id '${templateId}'`);
        }
        let container = document.createElement("div") as HTMLDivElement;
        for (let child of templateElement.content.childNodes)
        {
            container.appendChild(child.cloneNode(true));
        }
        return container;
    }
}
import { LinkCallback } from "../Application";

export class Page
{
    protected readonly templateId: string;
    protected readonly linkCallback: LinkCallback;
    protected readonly _content: HTMLElement;

    protected constructor(templateId: string, linkCallback: LinkCallback)
    {
        this.templateId = templateId;
        this.linkCallback = linkCallback;
        if (templateId === "") {
            // For tests to run with mock pages
            this._content = document.createElement("div");
        } else {
            this._content = this.loadTemplate(`${this.templateId}Template`);
        }
    }

    public async showAsync(): Promise<HTMLElement>
    {
        return this._content;
    }

    public async getTitleAsync(): Promise<string>
    {
        return "Purdue.io";
    }

    private loadTemplate(templateId: string): HTMLElement
    {
        let templateElement = document.querySelector(`#${templateId}`) as HTMLTemplateElement;
        if (templateElement === null) {
            throw new Error(`Cannot find template element with id '${templateId}'`);
        }
        let container = document.createElement("div") as HTMLDivElement;
        container.classList.add("page");
        container.classList.add(this.templateId);
        for (let child of templateElement.content.childNodes)
        {
            container.appendChild(child.cloneNode(true));
        }
        return container;
    }
}
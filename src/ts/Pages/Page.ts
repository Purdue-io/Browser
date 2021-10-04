import { NavigateCallback } from "../Application";

export class Page
{
    protected readonly templateId: string;
    protected readonly navigateCallback: NavigateCallback;
    protected readonly _content: HTMLElement;

    protected constructor(templateId: string, navigateCallback: NavigateCallback)
    {
        this.templateId = templateId;
        this.navigateCallback = navigateCallback;
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
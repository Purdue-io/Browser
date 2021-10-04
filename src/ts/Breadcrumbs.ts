import { NavigateCallback } from "./Application";
import { SegmentPage } from "./Router";

export class Breadcrumbs
{
    private readonly breadcrumbsListElement: HTMLElement;
    private readonly navigateCallback: NavigateCallback;

    constructor(breadcrumbsListElement: HTMLElement, navigateCallback: NavigateCallback)
    {
        this.breadcrumbsListElement = breadcrumbsListElement;
        this.navigateCallback = navigateCallback;
    }

    public updateBreadcrumbs(pageStack: SegmentPage[]): void
    {
        let listItemElements = this.breadcrumbsListElement.querySelectorAll("li");
        for (let i = 0; i < pageStack.length; ++i)
        {
            let pageSegment = pageStack[i];
            let absolutePath = "/";
            for (let j = 1; j <= i; ++j)
            {
                absolutePath += `${pageStack[j].segment.segmentValue}`;
                if (j !== i)
                {
                    absolutePath += "/";
                }
            }
            if (i < listItemElements.length)
            {
                let linkElement = listItemElements[i].querySelector("a");
                if (linkElement === null)
                {
                    throw new Error("Malformed breadcrumb element - could not find anchor element");
                }
                if (linkElement.href !== absolutePath)
                {
                    linkElement.href = absolutePath;
                    linkElement.textContent = pageSegment.segment.segmentValue;
                    pageSegment.page.getTitleAsync().then((title) => {
                        if (linkElement !== null)
                        {
                            linkElement.textContent = title;
                        }
                    });
                }
            }
            else
            {
                let newListElement = document.createElement("li");
                let linkElement = document.createElement("a");
                linkElement.href = absolutePath;
                linkElement.textContent = pageSegment.segment.segmentValue;
                linkElement.addEventListener("click", (e) => {
                    e.preventDefault();
                    let link = e.target as HTMLAnchorElement;
                    this.navigateCallback(link.getAttribute("href") as string);
                });
                pageSegment.page.getTitleAsync().then((title) => {
                    if (linkElement !== null)
                    {
                        linkElement.textContent = title;
                    }
                });
                newListElement.appendChild(linkElement);
                this.breadcrumbsListElement.appendChild(newListElement);
            }
        }

        listItemElements = this.breadcrumbsListElement.querySelectorAll("li");
        for (let i = listItemElements.length - 1; i > pageStack.length - 1; --i)
        {
            this.breadcrumbsListElement.removeChild(listItemElements[i]);
        }
    }
}
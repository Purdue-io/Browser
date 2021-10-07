import { Breadcrumbs } from "./Breadcrumbs";
import { IDataSource } from "./Data/IDataSource";
import { PurdueApiDataSource } from "./Data/PurdueApiDataSource";
import { CoursePage } from "./Pages/CoursePage";
import { LandingPage } from "./Pages/LandingPage";
import { Page } from "./Pages/Page";
import { SubjectPage } from "./Pages/SubjectPage";
import { TermPage } from "./Pages/TermPage";
import { PageFactory, PageHints, Router, SegmentPage } from "./Router";

export type LinkCallback = (originPage: Page, nextSegment: string, hints: PageHints) => void;
export type NavigateCallback = (absolutePath: string) => void;

export class Application
{
    private readonly dataSource: IDataSource;
    private readonly router: Router;
    private readonly pageElement: HTMLElement;
    private readonly breadcrumbs: Breadcrumbs;

    public static run(): Application
    {
        let dataSource = new PurdueApiDataSource("https://new-api.purdue.io/odata");
        let returnVal = new Application(dataSource);
        returnVal.start();
        return returnVal;
    }

    public start(): void
    {
        window.addEventListener("popstate", (e) => {
            this.router.navigatePath(document.location.pathname);
        });
        this.router.navigatePath(document.location.pathname);
    }

    private constructor(dataSource: IDataSource)
    {
        this.dataSource = dataSource;
        this.router = new Router([
            {
                pageFactory: (context) => new LandingPage(this.dataSource,
                    this.pageLink.bind(this)),
                segmentName: "root",
            },
            {
                pageFactory: (context) => new TermPage(this.dataSource,
                    this.pageLink.bind(this), context),
                segmentName: "term",
            },
            {
                pageFactory: (context) => new SubjectPage(this.dataSource, this.pageLink.bind(this),
                    context.parentPages[0].segment.segmentValue, context.segment.segmentValue),
                segmentName: "subject",
            },
            {
                pageFactory: (context) => new CoursePage(this.dataSource, this.pageLink.bind(this),
                    context),
                segmentName: "course",
            },
        ], this.pageStackUpdated.bind(this));
        this.pageElement = document.body.querySelector("main") as HTMLElement;
        let breadcrumbsListElement = document.body.querySelector("nav ul") as HTMLUListElement;
        this.breadcrumbs = new Breadcrumbs(breadcrumbsListElement, this.navigate.bind(this));
    }

    private pageStackUpdated(pageStack: SegmentPage[]): void
    {
        let currentPageSegment = pageStack[pageStack.length - 1];
        let newContentPromise = currentPageSegment.page.showAsync();
        this.pageElement.replaceChildren();
        newContentPromise.then((content) => {
            this.pageElement.appendChild(content);
        });
        this.breadcrumbs.updateBreadcrumbs(pageStack);
    }

    private pageLink(originPage: Page, nextSegment: string, hints: PageHints): void
    {
        let absolutePath = this.router.pushSegment(nextSegment, hints);
        let url = `${window.location.origin}${absolutePath}`;
        window.history.pushState(null, "", url);
    }

    private navigate(absolutePath: string): void
    {
        this.router.navigatePath(absolutePath);
        let url = `${window.location.origin}${absolutePath}`;
        window.history.pushState(null, "", url);
    }
}
import { Animator } from "./Animator";
import { Breadcrumbs } from "./Breadcrumbs";
import { IDataSource } from "./Data/IDataSource";
import { PurdueApiDataSource } from "./Data/PurdueApiDataSource";
import { DomHelpers } from "./DomHelpers";
import { LoadingCurtain, LoadingTicket } from "./LoadingCurtain";
import { ClassPage } from "./Pages/ClassPage";
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
    private readonly loadingCurtain: LoadingCurtain;
    private pendingPageTransitions: Promise<HTMLElement>[];
    private processingPageTransition: boolean = false;
    private pageTransitionLoadingTicket: LoadingTicket | null = null;

    public static run(): Application
    {
        const apiUrl = process.env.API_URL || "https://api.purdue.io/odata";
        let dataSource = new PurdueApiDataSource(apiUrl);
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
            {
                pageFactory: (context) => new ClassPage(this.dataSource, this.pageLink.bind(this),
                    context),
                segmentName: "class",
            },
        ], this.pageStackUpdated.bind(this));
        this.pageElement = document.body.querySelector("main") as HTMLElement;
        let breadcrumbsListElement = document.body.querySelector("nav ul") as HTMLUListElement;
        this.breadcrumbs = new Breadcrumbs(breadcrumbsListElement, this.navigate.bind(this));
        this.loadingCurtain = new LoadingCurtain();
        this.pendingPageTransitions = [];
    }

    private queuePageTransition(newContentPromise: Promise<HTMLElement>): void
    {
        this.pendingPageTransitions.push(newContentPromise);
        this.startPendingPageTransition();
    }
    
    private startPendingPageTransition(): void
    {
        if (this.processingPageTransition)
        {
            return;
        }
        
        if (this.pendingPageTransitions.length > 0)
        {
            this.processingPageTransition = true;
            this.pageTransitionLoadingTicket = this.loadingCurtain.setLoading();
            let pageContainer = this.pageElement.firstElementChild;
            if (pageContainer !== null)
            {
                Animator.RunAnimation(pageContainer as HTMLElement, "anim-page-out").then(() => {
                    this.finishPendingPageTransition();
                });
            }
            else
            {
                this.finishPendingPageTransition();
            }
        }
    }

    private finishPendingPageTransition(): void
    {
        if (!this.processingPageTransition)
        {
            return;
        }

        if (this.pendingPageTransitions.length > 0)
        {
            let latestContentPromise = 
                this.pendingPageTransitions[this.pendingPageTransitions.length - 1];
            this.pendingPageTransitions.length = 0;
            DomHelpers.clearChildren(this.pageElement);
            latestContentPromise.then((content) => {
                // Scroll to the top for now
                // eventually maybe we'll work to restore scroll position
                this.pageElement.appendChild(content);
                window.scroll(0, 0);
                Animator.RunAnimation(content, "anim-page-in");
                this.processingPageTransition = false;
                if (this.pageTransitionLoadingTicket !== null)
                {
                    this.pageTransitionLoadingTicket.clear();
                    this.pageTransitionLoadingTicket = null;
                }

                // Process any transitions that occurred since we started
                this.startPendingPageTransition();
            });
        }
    }

    private pageStackUpdated(pageStack: SegmentPage[]): void
    {
        this.breadcrumbs.updateBreadcrumbs(pageStack);
        let newPageSegment = pageStack[pageStack.length - 1];
        
        let newContentPromise = newPageSegment.page.showAsync();
        this.queuePageTransition(newContentPromise);
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
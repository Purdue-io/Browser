import { LandingPage } from "./Pages/LandingPage";
import { Page } from "./Pages/Page";
import { SubjectPage } from "./Pages/SubjectPage";
import { TermPage } from "./Pages/TermPage";
import { PageFactory, Router } from "./Router";

export class Application
{
    private readonly router: Router;
    private readonly pageElement: HTMLElement;

    public static run(): Application
    {
        let returnVal = new Application();
        returnVal.start();
        return returnVal;
    }

    public start(): void
    {
        this.router.navigatePath(document.location.pathname);
    }

    private constructor()
    {
        this.router = new Router([
            {
                pageFactory: (context) => new LandingPage(),
                segmentName: "root",
            },
            {
                pageFactory: (context) => new TermPage(context.segment.segmentValue),
                segmentName: "term",
            },
            {
                pageFactory: (context) => new SubjectPage(
                    context.parentPages[0].segment.segmentValue, context.segment.segmentValue),
                segmentName: "subject",
            },
        ], this.showPage.bind(this));
        this.pageElement = document.body.querySelector("main") as HTMLElement;
    }

    private showPage(page: Page): void
    {
        while (this.pageElement.firstChild)
        {
            this.pageElement.removeChild(this.pageElement.lastChild as Node);
        }
        this.pageElement.appendChild(page.content);
    }
}
import { LandingPage } from "./Pages/LandingPage";
import { Page } from "./Pages/Page";
import { PageFactory, Router, RouterNavigationContext } from "./Router";

export class Application {
    private readonly rootElement: HTMLElement;
    private readonly router: Router;
    private navigationContext: RouterNavigationContext;

    public static start(rootElement: HTMLElement): Application {
        let returnVal = new Application(rootElement);
        return returnVal;
    }

    private constructor(rootElement: HTMLElement) {
        let rootPageFactory: PageFactory = 
            (pathSegment) => new LandingPage(pathSegment);
        this.rootElement = rootElement;
        this.router = Router.create(rootPageFactory, []);
        this.navigationContext = this.router.navigate(document.location.pathname);
        this.presentNavigationContext();
    }

    private presentNavigationContext(): void {
        while (this.rootElement.firstChild)
        {
            this.rootElement.removeChild(this.rootElement.lastChild as Node);
        }
        this.rootElement.appendChild(this.navigationContext.currentNode.page.content);
    }
}
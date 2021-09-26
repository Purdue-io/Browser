import { LandingPage } from "./Pages/LandingPage";
import { Page } from "./Pages/Page";
import { Router } from "./Router";

export class Application {
    private rootElement: HTMLElement;
    private router: Router;

    public static start(rootElement: HTMLElement): Application
    {
        let returnVal = new Application(rootElement);
        returnVal.initialize();
        return returnVal;
    }

    private constructor(rootElement: HTMLElement) {
        let pageFactories: ((pathSegment: string) => Page)[] = [
            (pathSegment) => LandingPage.create(pathSegment) // //app/
        ];
        this.rootElement = rootElement;
        this.router = Router.create(pageFactories);
    }

    private initialize(): void {
        this.router.navigate(document.location.pathname);
    }
}
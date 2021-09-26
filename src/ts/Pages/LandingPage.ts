import { Page } from "./Page";

export class LandingPage extends Page {
    public static create(urlPathSegment: string): Page {
        console.log("I'm the landing page!");
        return new LandingPage();
    }
}
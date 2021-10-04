import { NavigateCallback } from "../Application";
import { Page } from "./Page";

export class TermPage extends Page
{
    private termCode: string;

    constructor(navigateCallback: NavigateCallback, termCode: string)
    {
        super("TermPage", navigateCallback);
        this.termCode = termCode;
        console.log(termCode);
    }
}
import { Page } from "./Page";

export class TermPage extends Page
{
    private termCode: string;

    constructor(termCode: string)
    {
        super("TermPage");
        this.termCode = termCode;
        console.log(termCode);
    }
}
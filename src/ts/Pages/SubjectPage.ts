import { NavigateCallback } from "../Application";
import { Page } from "./Page";

export class SubjectPage extends Page
{
    private termCode: string;
    private subjectCode: string;

    constructor(navigateCallback: NavigateCallback, termCode: string, subjectCode: string)
    {
        super("SubjectPage", navigateCallback);
        this.termCode = termCode;
        this.subjectCode = subjectCode;
        console.log(`${termCode}: ${subjectCode}`);
    }
}
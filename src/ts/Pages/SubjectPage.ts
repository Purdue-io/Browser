import { Page } from "./Page";

export class SubjectPage extends Page
{
    private termCode: string;
    private subjectCode: string;

    constructor(termCode: string, subjectCode: string)
    {
        super("SubjectPage");
        this.termCode = termCode;
        this.subjectCode = subjectCode;
        console.log(`${termCode}: ${subjectCode}`);
    }
}
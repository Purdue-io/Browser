import { LinkCallback } from "../Application";
import { Page } from "./Page";

export class SubjectPage extends Page
{
    private termCode: string;
    private subjectCode: string;

    constructor(linkCallback: LinkCallback, termCode: string, subjectCode: string)
    {
        super("SubjectPage", linkCallback);
        this.termCode = termCode;
        this.subjectCode = subjectCode;
        console.log(`${termCode}: ${subjectCode}`);
    }

    public override async getTitleAsync(): Promise<string>
    {
        return this.subjectCode;
    }
}
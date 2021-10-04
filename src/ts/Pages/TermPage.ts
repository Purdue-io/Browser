import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { Page } from "./Page";

export class TermPage extends Page
{
    private readonly dataSource: IDataSource;
    private termCode: string;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback, termCode: string)
    {
        super("TermPage", linkCallback);
        this.dataSource = dataSource;
        this.termCode = termCode;
        console.log(termCode);
    }

    public override async showAsync(): Promise<HTMLElement>
    {
        await this.updateSubjectsAsync();
        return this._content;
    }

    public override async getTitleAsync(): Promise<string>
    {
        return this.termCode;
    }

    private async updateSubjectsAsync(): Promise<void>
    {
        let subjectListElement = this._content.querySelector("ul.subjects");
        if (subjectListElement === null)
        {
            console.error("Could not update subject list, " +
                "element 'ul.subjects' could not be found");
            return;
        }

        let subjects = await this.dataSource.getSubjectsAsync(this.termCode);
        subjects.sort((a, b) => {
            return a.Abbreviation.localeCompare(b.Abbreviation);
        });

        subjectListElement.replaceChildren();
        let lastLetter: string = "";
        for (let subject of subjects)
        {
            let letter = subject.Abbreviation.charAt(0).toLowerCase();
            if (letter !== lastLetter)
            {
                let alphaListItem = document.createElement("li");
                alphaListItem.classList.add("alpha");
                alphaListItem.innerText = letter.toUpperCase();
                subjectListElement.appendChild(alphaListItem);
                lastLetter = letter;
            }
            let subjectListItem = document.createElement("li");
            subjectListItem.classList.add("subject");
            let subjectLink = document.createElement("a");
            subjectLink.href = `/${this.termCode}/${subject.Abbreviation}`;
            let subjectAbbreviation = document.createElement("div");
            subjectAbbreviation.classList.add("abbreviation");
            subjectAbbreviation.innerText = subject.Abbreviation;
            let subjectName = document.createElement("div");
            subjectName.classList.add("name");
            subjectName.innerText = subject.Name;
            subjectLink.appendChild(subjectAbbreviation);
            subjectLink.appendChild(subjectName);
            subjectLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.linkCallback(this, subject.Abbreviation);
            });
            subjectListItem.appendChild(subjectLink);
            subjectListElement.appendChild(subjectListItem);
        }
    }
}
import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { Page } from "./Page";

export class LandingPage extends Page
{
    private readonly dataSource: IDataSource;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback)
    {
        super("LandingPage", linkCallback);
        this.dataSource = dataSource;
    }

    public override async showAsync(): Promise<HTMLElement>
    {
        await this.updateTermsAsync();
        return this._content;
    }

    public override async getTitleAsync(): Promise<string>
    {
        return "Purdue.io";
    }

    private async updateTermsAsync(): Promise<void>
    {
        let termListElement = this._content.querySelector("ul.terms");
        if (termListElement === null)
        {
            console.error("Could not update term list, element 'ul.terms' could not be found");
            return;
        }

        let terms = await this.dataSource.getTermsAsync();
        terms.sort((a, b) => {
            // Sort undefined start dates to the bottom
            let minDate = new Date("0001-01-01T00:00:00Z");
            if ((a.StartDate === minDate) && (b.EndDate !== minDate))
            {
                return 1;
            }
            else if ((b.StartDate === minDate) && (a.EndDate !== minDate))
            {
                return -1;
            }

            let aGtB: number = (a.StartDate > b.StartDate) ? 1 : 0;
            let bGtA: number = (a.StartDate < b.StartDate) ? 1 : 0;
            return (bGtA - aGtB);
        });

        termListElement.replaceChildren();
        for (let term of terms)
        {
            let termListItem = document.createElement("li");
            let termLink = document.createElement("a");
            termLink.href = term.Code;
            termLink.textContent = term.Name;
            termLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.linkCallback(this, term.Code);
            });
            termListItem.appendChild(termLink);
            termListElement.appendChild(termListItem);
        }
    }
}
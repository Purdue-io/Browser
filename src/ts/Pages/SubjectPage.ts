import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { Page } from "./Page";

export class SubjectPage extends Page
{
    private readonly dataSource: IDataSource;
    private termCode: string;
    private subjectCode: string;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback, termCode: string,
        subjectCode: string)
    {
        super("SubjectPage", linkCallback);
        this.dataSource = dataSource;
        this.termCode = termCode;
        this.subjectCode = subjectCode;
    }

    public override async showAsync(): Promise<HTMLElement>
    {
        await this.updateCoursesAsync();
        return this._content;
    }

    public override async getTitleAsync(): Promise<string>
    {
        return this.subjectCode;
    }

    private async updateCoursesAsync(): Promise<void>
    {
        let courseListElement = this._content.querySelector("ul.courses");
        if (courseListElement === null)
        {
            throw new Error("Could not update subject list, " +
                "element 'ul.courses' could not be found");
        }

        let courses = await this.dataSource.getCoursesAsync(this.termCode, this.subjectCode);
        courses.sort((a, b) => {
            return a.Number.localeCompare(b.Number);
        });

        courseListElement.replaceChildren();
        let lastLevel = "";
        for (let course of courses)
        {
            let level = course.Number.charAt(0).toLowerCase();
            if (level !== lastLevel)
            {
                let levelListItem = document.createElement("li");
                levelListItem.classList.add("level");
                levelListItem.innerText = `${level.toUpperCase()}00`;
                courseListElement.appendChild(levelListItem);
                lastLevel = level;
            }
            let courseListItem = document.createElement("li");
            courseListItem.classList.add("course");
            let courseLink = document.createElement("a");
            courseLink.href = `/${this.termCode}/${this.subjectCode}/${course.Id}`;
            courseLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.linkCallback(this, course.Id, { title: course.Number });
            });
            let courseNum = document.createElement("div");
            courseNum.classList.add("number");
            courseNum.innerText = course.Number;
            let courseTitle = document.createElement("div");
            courseTitle.classList.add("title");
            courseTitle.innerText = course.Title;
            courseLink.appendChild(courseNum);
            courseLink.appendChild(courseTitle);
            courseListItem.appendChild(courseLink);
            courseListElement.appendChild(courseListItem);
        }
    }
}
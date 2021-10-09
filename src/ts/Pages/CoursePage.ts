import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { CourseClassDetails, SectionDetails, Utilities } from "../Data/Models";
import { PageContext } from "../Router";
import { Page } from "./Page";

export class CoursePage extends Page
{
    private readonly dataSource: IDataSource;
    private termCode: string;
    private subjectCode: string;
    private courseId: string;
    private title: string | null;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback, context: PageContext)
    {
        super("CoursePage", linkCallback);
        this.dataSource = dataSource;
        this.termCode = context.parentPages[1].segment.segmentValue;
        this.subjectCode = context.parentPages[0].segment.segmentValue;
        this.courseId = context.segment.segmentValue;
        if (context.hints === null)
        {
            this.title = null;
        }
        else
        {
            this.title = context.hints.title;
        }
    }

    public override async showAsync(): Promise<HTMLElement>
    {
        await this.updateCourseDetailsAsync();
        return this._content;
    }

    public override async getTitleAsync(): Promise<string>
    {
        if (this.title !== null)
        {
            return this.title;
        }
        try
        {
            this.title = await this.dataSource.getCourseNumberAsync(this.courseId);
            return this.title;
        }
        catch (error)
        {
            return "ERROR";
        }
    }

    private async updateCourseDetailsAsync(): Promise<void>
    {
        let classListElement = this._content.querySelector("ul.classes");
        if (classListElement === null)
        {
            throw new Error("Could not update class list, element 'ul.classes' could not be found");
        }
        classListElement.replaceChildren();

        let courseDetails = await this.dataSource.getTermCourseDetailsAsync(this.termCode,
            this.courseId);

        for (let classDetails of courseDetails.Classes)
        {
            let classListItem = this.createClassDetailsListElement(classDetails);
            classListElement.appendChild(classListItem);
        }
    }

    private createClassDetailsListElement(classDetails: CourseClassDetails): HTMLLIElement
    {
        let groupedSections = Utilities.getGroupedSections(classDetails.Sections);
        let classListItem = document.createElement("li");
        let link = document.createElement("a");
        link.href = `/${this.termCode}/${this.subjectCode}/${this.courseId}/${classDetails.Id}`;
        link.addEventListener("click", (e) => {
            e.preventDefault();
            this.linkCallback(this, classDetails.Id,
                { title: Utilities.getFriendlyClassTitle(groupedSections, true) });
        });
        link.appendChild(
            this.createClassDetailsListTitleElement(groupedSections));
        link.appendChild(this.getSectionTable(groupedSections));
        classListItem.appendChild(link);
        return classListItem;
    }

    private createClassDetailsListTitleElement(
        groupedSections: Map<string, SectionDetails[]>): HTMLDivElement
    {
        let titleElement = document.createElement("div");
        titleElement.classList.add("title");
        titleElement.innerText = Utilities.getFriendlyClassTitle(groupedSections);
        return titleElement;
    }

    private getSectionTable(groupedSections: Map<string, SectionDetails[]>): HTMLTableElement
    {
        let tableElement = document.createElement("table");
        let tableBodyElement = document.createElement("tbody");
        for (let type of Utilities.getOrderedKeys(groupedSections))
        {
            let sections = groupedSections.get(type) as SectionDetails[];
            let typeHeaderRow = document.createElement("tr");
            let typeHeaderCol = document.createElement("th");
            typeHeaderCol.setAttribute("colspan", "4");
            typeHeaderCol.innerText = type;
            typeHeaderRow.appendChild(typeHeaderCol);
            tableBodyElement.appendChild(typeHeaderRow);

            for (let section of sections)
            {
                for (let meeting of section.Meetings)
                {
                    let sectionRow = document.createElement("tr");
                    let instructorCol = document.createElement("td");
                    instructorCol.innerText = (meeting.Instructors.length > 0) ?
                        meeting.Instructors.map(i => i.Name).join(", ") : 
                        "-";
                    sectionRow.appendChild(instructorCol);
                    let locationCol = document.createElement("td");
                    locationCol.innerText = `${meeting.Room.Building.ShortCode}/${meeting.Room.Number}`;
                    sectionRow.appendChild(locationCol);
                    let daysCol = document.createElement("td");
                    daysCol.innerText = Utilities.getDaysOfWeek(meeting.DaysOfWeek).join("\u00a0");
                    sectionRow.appendChild(daysCol);
                    let timeCol = document.createElement("td");
                    timeCol.innerText = Utilities.getTimeString(new Date(meeting.StartTime));
                    sectionRow.appendChild(timeCol);
                    tableBodyElement.appendChild(sectionRow);
                }

            }
        }
        tableElement.appendChild(tableBodyElement);
        return tableElement;
    }

    
}
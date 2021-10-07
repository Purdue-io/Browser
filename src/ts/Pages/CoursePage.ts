import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { CourseClassDetails, SectionDetails } from "../Data/Models";
import { PageContext } from "../Router";
import { Page } from "./Page";

export class CoursePage extends Page
{
    private readonly dataSource: IDataSource;
    private termCode: string;
    private courseId: string;
    private title: string | null;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback, context: PageContext)
    {
        super("CoursePage", linkCallback);
        this.dataSource = dataSource;
        this.termCode = context.parentPages[1].segment.segmentValue;
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
        let groupedSections = this.getGroupedSections(classDetails.Sections);
        let classListItem = document.createElement("li");
        let link = document.createElement("a");
        link.appendChild(
            this.createClassDetailsListTitleElement(classDetails, groupedSections));
        link.appendChild(this.getSectionTable(groupedSections));
        classListItem.appendChild(link);
        return classListItem;
    }

    private createClassDetailsListTitleElement(classDetails: CourseClassDetails,
        groupedSections: Map<string, SectionDetails[]>): HTMLDivElement
    {
        let titleElement = document.createElement("div");
        titleElement.classList.add("title");
        titleElement.innerText = this.getClassTitle(groupedSections);
        return titleElement;
    }

    private getClassTitle(groupedSections: Map<string, SectionDetails[]>): string
    {
        if (groupedSections.has("Lecture"))
        {
            let lectureSections = groupedSections.get("Lecture") as SectionDetails[];
            if (lectureSections.length > 0)
            {
                let firstLectureSection = lectureSections[0];
                if (firstLectureSection.Meetings.length > 0)
                {
                    let firstLectureMeeting = firstLectureSection.Meetings[0];
                    if (firstLectureMeeting.Instructors.length > 1)
                    {
                        return `${firstLectureMeeting.Instructors[0].Name} ` +
                            `(+${firstLectureMeeting.Instructors.length - 1})`;
                    }
                    else if (firstLectureMeeting.Instructors.length > 0)
                    {
                        return firstLectureMeeting.Instructors[0].Name;
                    }
                }
            }
        }
        if (groupedSections.size === 1)
        {
            let onlySection = groupedSections.values().next().value[0] as SectionDetails;
            if (onlySection.Meetings.length > 0)
            {
                let onlyMeeting = onlySection.Meetings[0];
                if (onlyMeeting.Instructors.length > 0)
                {
                    return onlyMeeting.Instructors[0].Name;
                }
            }
        }
        return "Class";
    }

    private getGroupedSections(sections: SectionDetails[]): Map<string, SectionDetails[]>
    {
        let map = new Map<string, SectionDetails[]>();
        for (let section of sections)
        {
            if (!map.has(section.Type))
            {
                map.set(section.Type, []);
            }
            map.get(section.Type)?.push(section);
        }
        return map;
    }

    private getSectionTable(groupedSections: Map<string, SectionDetails[]>): HTMLTableElement
    {
        let tableElement = document.createElement("table");
        let tableBodyElement = document.createElement("tbody");
        for (let type of groupedSections.keys())
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
                    daysCol.innerText = this.getDaysOfWeek(meeting.DaysOfWeek).join("\u00a0");
                    sectionRow.appendChild(daysCol);
                    let timeCol = document.createElement("td");
                    timeCol.innerText = this.getTimeString(meeting.StartTime);
                    sectionRow.appendChild(timeCol);
                    tableBodyElement.appendChild(sectionRow);
                }

            }
        }
        tableElement.appendChild(tableBodyElement);
        return tableElement;
    }

    private getDaysOfWeek(daysOfWeek: string): string[]
    {
        let dayChars: string[] = [];
        if (daysOfWeek.indexOf("Monday") >= 0) { dayChars.push("M"); }
        if (daysOfWeek.indexOf("Tuesday") >= 0) { dayChars.push("T"); }
        if (daysOfWeek.indexOf("Wednesday") >= 0) { dayChars.push("W"); }
        if (daysOfWeek.indexOf("Thursday") >= 0) { dayChars.push("R"); }
        if (daysOfWeek.indexOf("Friday") >= 0) { dayChars.push("F"); }
        if (daysOfWeek.indexOf("Saturday") >= 0) { dayChars.push("S"); }
        if (daysOfWeek.indexOf("Sunday") >= 0) { dayChars.push("U"); }
        return dayChars;
    }

    private getTimeString(dateString: string): string
    {
        let date = new Date(dateString);
        return date.toLocaleTimeString(navigator.language, {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Indiana/Indianapolis" // HACK: Close enough.
        });
    }
}
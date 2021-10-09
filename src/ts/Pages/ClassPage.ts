import { LinkCallback } from "../Application";
import { IDataSource } from "../Data/IDataSource";
import { Instructor, SectionDetails, Utilities } from "../Data/Models";
import { DomHelpers } from "../DomHelpers";
import { PageContext } from "../Router";
import { Page } from "./Page";

export class ClassPage extends Page
{
    private readonly dataSource: IDataSource;
    private classId: string;
    private title: string | null;

    constructor(dataSource: IDataSource, linkCallback: LinkCallback, context: PageContext)
    {
        super("ClassPage", linkCallback);
        this.dataSource = dataSource;
        this.classId = context.segment.segmentValue;
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
        await this.updateClassDetailsAsync();
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
            let classDetails = await this.dataSource.getClassDetailsAsync(this.classId);
            this.title = Utilities.getFriendlyClassTitle(
                Utilities.getGroupedSections(classDetails.Sections), true);
            return this.title;
        }
        catch (error)
        {
            return "ERROR";
        }
    }

    private async updateClassDetailsAsync(): Promise<void>
    {
        let sectionListElement = this._content.querySelector("ul.sections");
        if (sectionListElement === null)
        {
            throw new Error("Could not update section list, " + 
                "element 'ul.sections' could not be found");
        }
        DomHelpers.clearChildren(sectionListElement);

        let classDetails = await this.dataSource.getClassDetailsAsync(this.classId);
        let groupedSections = Utilities.getGroupedSections(classDetails.Sections);
        for (let type of Utilities.getOrderedKeys(groupedSections))
        {
            let listHeaderElement = document.createElement("li");
            listHeaderElement.classList.add("sectionType");
            listHeaderElement.innerText = `${type}`;
            sectionListElement.appendChild(listHeaderElement);

            for (let sectionDetails of (groupedSections.get(type) as SectionDetails[]))
            {
                let sectionListItemElement = document.createElement("li");
                sectionListItemElement.classList.add("section");

                let crnElement = document.createElement("div");
                crnElement.classList.add("crn");
                crnElement.innerText = `${sectionDetails.Crn}`;
                sectionListItemElement.appendChild(crnElement);

                let instructorLabel = document.createElement("label");
                instructorLabel.innerText = "Instructor";
                sectionListItemElement.appendChild(instructorLabel);

                let instructorListElement = this.getInstructorListElement(sectionDetails);
                sectionListItemElement.appendChild(instructorListElement);

                let meetingLabel = document.createElement("label");
                meetingLabel.innerText = "Meeting";
                sectionListItemElement.appendChild(meetingLabel);

                let meetingTableElement = this.getMeetingTableElement(sectionDetails);
                sectionListItemElement.appendChild(meetingTableElement);

                let enrollmentLabel = document.createElement("label");
                enrollmentLabel.innerText = "Enrollment";
                sectionListItemElement.appendChild(enrollmentLabel);

                let capacityElement = document.createElement("div");
                capacityElement.classList.add("capacity");
                capacityElement.innerText = 
                    `${sectionDetails.Enrolled} / ${sectionDetails.Capacity}`;
                sectionListItemElement.appendChild(capacityElement);

                let waitListLabel = document.createElement("label");
                waitListLabel.innerText = "Waitlist";
                sectionListItemElement.appendChild(waitListLabel);

                let waitListElement = document.createElement("div");
                waitListElement.classList.add("waitList");
                waitListElement.innerText = 
                    `${sectionDetails.WaitListCount} / ${sectionDetails.WaitListCapacity}`;
                sectionListItemElement.appendChild(waitListElement);

                sectionListElement.appendChild(sectionListItemElement);
            }
        }
    }

    private getInstructorListElement(sectionDetails: SectionDetails): HTMLUListElement
    {
        let instructors = new Map<string, Instructor>();
        for (let meeting of sectionDetails.Meetings)
        {
            for (let meetingInstructor of meeting.Instructors)
            {
                if (!instructors.has(meetingInstructor.Email))
                {
                    instructors.set(meetingInstructor.Email, meetingInstructor);
                }
            }
        }

        let instructorListElement = document.createElement("ul");
        instructorListElement.classList.add("instructors");
        for (let email of instructors.keys())
        {
            let instructor = instructors.get(email) as Instructor;
            let instructorListItemElement = document.createElement("li");
            instructorListItemElement.innerText = instructor.Name;
            instructorListElement.appendChild(instructorListItemElement);
        }

        return instructorListElement;
    }

    private getMeetingTableElement(sectionDetails: SectionDetails): HTMLTableElement
    {
        let meetingTableElement = document.createElement("table");
        meetingTableElement.classList.add("meetings");
        let tbody = document.createElement("tbody");
        meetingTableElement.appendChild(tbody);

        for (let meeting of sectionDetails.Meetings)
        {
            let meetingRow = document.createElement("tr");
            tbody.appendChild(meetingRow);

            let buildingCol = document.createElement("td");
            buildingCol.innerText = meeting.Room.Building.ShortCode;
            meetingRow.appendChild(buildingCol);

            let roomCol = document.createElement("td");
            roomCol.innerText = meeting.Room.Number;
            meetingRow.appendChild(roomCol);

            let daysCol = document.createElement("td");
            daysCol.innerText = Utilities.getDaysOfWeek(meeting.DaysOfWeek).join("\u00a0");
            meetingRow.appendChild(daysCol);

            let timeCol = document.createElement("td");
            let startTime = Utilities.getTimeString(new Date(meeting.StartTime));
            let endTime = Utilities.getTimeString(
                Utilities.datePlusDuration(new Date(meeting.StartTime), meeting.Duration));
            timeCol.innerText = `${startTime} - ${endTime}`
            meetingRow.appendChild(timeCol);
        }

        return meetingTableElement;
    }
}
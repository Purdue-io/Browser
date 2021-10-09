export interface Term
{
    Id: string;
    Code: string;
    Name: string;
    StartDate: Date;
    EndDate: Date;
}

export interface Subject
{
    Id: string;
    Name: string;
    Abbreviation: string;
}

export interface Course
{
    Id: string;
    Number: string;
    Title: string;
    CreditHours: number;
    Description: number;
}

export interface CourseDetails
{
    Id: string;
    Number: string;
    SubjectId: string;
    Title: string;
    CreditHours: number;
    Description: string;
    Classes: CourseClassDetails[];
}

export interface CourseClassDetails
{
    Id: string;
    CourseId: string;
    TermId: string;
    CampusId: string;
    Sections: SectionDetails[];
}

export interface SectionDetails
{
    Id: string;
    Crn: string;
    ClassId: string;
    Type: string;
    RegistrationStatus: string;
    StartDate: string;
    EndDate: string;
    Capacity: number;
    Enrolled: number;
    RemainingSpace: number;
    WaitListCapacity: number;
    WaitListCount: number;
    WaitListSpace: number;
    Meetings: MeetingDetails[];
}

export interface MeetingDetails
{
    Id: string;
    SectionId: string;
    Type: string;
    StartDate: string;
    EndDate: string;
    DaysOfWeek: string;
    StartTime: string;
    Duration: string;
    RoomId: string;
    Instructors: Instructor[];
    Room: Room;
}

export interface Instructor
{
    Id: string;
    Name: string;
    Email: string;
}

export interface Room
{
    Id: string;
    Number: string;
    BuildingId: string;
    Building: Building;
}

export interface Building
{
    Id: string;
    CampusId: string;
    Name: string;
    ShortCode: string;
}

export class Utilities
{
    private static durationRegex = 
        /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;

    public static getGroupedSections(sections: SectionDetails[]): Map<string, SectionDetails[]>
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

    public static getOrderedKeys(groupedSections: Map<string, SectionDetails[]>): string[]
    {
        let keyOrder: { key: string, order: number }[] = [];
        for (let key of groupedSections.keys())
        {
            let order = 0;
            let sections = groupedSections.get(key) as SectionDetails[];
            if ((key.toUpperCase() != "LECTURE") && (key.toUpperCase() != "DISTANCE LEARNING"))
            {
                order = sections.length;
            }
            keyOrder.push({ key: key, order: order });
        }

        return keyOrder.sort((a, b) => (a.order - b.order)).map(k => k.key);
    }

    public static getFriendlyClassTitle(groupedSections: Map<string, SectionDetails[]>,
        short: boolean = false): string
    {
        let orderedKeys = Utilities.getOrderedKeys(groupedSections);
        if (orderedKeys.length > 0)
        {
            let sections = groupedSections.get(orderedKeys[0]) as SectionDetails[];
            if ((orderedKeys[0].toUpperCase() == "LECTURE") ||
                (orderedKeys[0].toUpperCase() == "DISTANCE LEARNING") ||
                (sections.length === 1))
            {
                if (sections.length > 0)
                {
                    if (sections[0].Meetings.length > 0)
                    {
                        if (sections[0].Meetings[0].Instructors.length > 0)
                        {
                            if (short)
                            {
                                let names = sections[0].Meetings[0].Instructors[0].Name.split(" ");
                                return names[names.length - 1];
                            }
                            return sections[0].Meetings[0].Instructors[0].Name;
                        }
                    }
                }
            }
        }
        return "Class";
    }

    public static getDaysOfWeek(daysOfWeek: string): string[]
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

    public static getTimeString(date: Date): string
    {
        return date.toLocaleTimeString(navigator.language, {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "America/Indiana/Indianapolis" // HACK: Close enough.
        });
    }

    public static datePlusDuration(date: Date, duration: string): Date
    {
        let matches = duration.match(Utilities.durationRegex);
        if (matches === null)
        {
            throw new Error("Could not parse Date");
        }
        let parsedDuration = {
            // Practically, we will not be dealing with durations beyond hours
            // years: parseFloat(matches[3]),
            // months: parseFloat(matches[5]),
            // weeks: parseFloat(matches[7]),
            // days: parseFloat(matches[9]),
            hours: matches[12] === undefined ? 0 : parseFloat(matches[12]),
            minutes: matches[14] === undefined ? 0 : parseFloat(matches[14]),
            seconds: matches[16] === undefined ? 0 : parseFloat(matches[16])
        };
        let offsetDate = new Date(date.getTime() + 
            (parsedDuration.hours * 3600000) + 
            (parsedDuration.minutes * 60000) + 
            (parsedDuration.seconds * 1000));
        return offsetDate;
    }
}
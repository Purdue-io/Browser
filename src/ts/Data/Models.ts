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
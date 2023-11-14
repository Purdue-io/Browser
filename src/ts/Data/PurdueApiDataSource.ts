import { IDataSource } from "./IDataSource";
import { Course, CourseClassDetails, CourseDetails, Subject, Term } from "./Models";

export class PurdueApiDataSource implements IDataSource
{
    private readonly odataRootUri: string;

    constructor(odataRootUri: string)
    {
        this.odataRootUri = odataRootUri;
    }

    async getTermsAsync(includeEmptyTerms: boolean = false): Promise<Term[]>
    {
        let response: Response;
        if (includeEmptyTerms)
        {
            response = await fetch(`${this.odataRootUri}/Terms`);
        }
        else
        {
            response = await fetch(`${this.odataRootUri}/Terms?$filter=(Classes/$count gt 0)`);
        }
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Terms: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data))
        {
            throw new Error(`Invalid response received when fetching Terms`);
        }
        return data.value as Term[];
    }

    async getTermNameAsync(termCode: string): Promise<string>
    {
        let response = await fetch(`${this.odataRootUri}/Terms?` + 
            `$filter=Code eq '${termCode}'&$select=Name`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Term name: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data))
        {
            throw new Error(`Invalid response received when fetching Term name`);
        }
        return data.value[0].Name as string;
    }

    async getSubjectsAsync(termCode: string): Promise<Subject[]>
    {
        let response = await fetch(`${this.odataRootUri}/Subjects?$filter=` + 
            `(Courses/any(c: c/Classes/any(cc: cc/Term/Code eq '${termCode}')))`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Subjects: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data))
        {
            throw new Error(`Invalid response received when fetching Subjects`);
        }
        return data.value as Subject[];
    }

    async getCoursesAsync(termCode: string, subjectAbbreviation: string): Promise<Course[]>
    {
        let response = await fetch(`${this.odataRootUri}/Courses?$filter=` +
            `(Classes/any(c: c/Term/Code eq '${termCode}')) and ` +
            `Subject/Abbreviation eq '${subjectAbbreviation}'`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Courses: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data))
        {
            throw new Error(`Invalid response received when fetching Courses`);
        }
        return data.value as Course[];
    }

    async getCourseNumberAsync(courseId: string): Promise<string>
    {
        let response = await fetch(`${this.odataRootUri}/Courses?` + 
            `$filter=Id eq ${courseId}&$select=Number`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Course number: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data))
        {
            throw new Error(`Invalid response received when fetching Course number`);
        }
        return data.value[0].Number as string;
    }

    async getTermCourseDetailsAsync(termCode: string, courseId: string): Promise<CourseDetails>
    {
        let response = await fetch(`${this.odataRootUri}/Courses?$filter=` + 
            `Id eq ${courseId}&$expand=Classes($filter=Term/Code eq '${termCode}';` + 
            `$expand=Sections($expand=Meetings($expand=Instructors,Room($expand=Building))))`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Course details: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data) || (data.value.length <= 0))
        {
            throw new Error(`Invalid response received when fetching Course details`);
        }
        return data.value[0] as CourseDetails;
    }

    async getClassDetailsAsync(classId: string): Promise<CourseClassDetails>
    {
        let response = await fetch(`${this.odataRootUri}/Classes?$filter=` + 
            `Id eq ${classId}&` + 
            `$expand=Sections($expand=Meetings($expand=Instructors,Room($expand=Building)))`);
        if (!response.ok)
        {
            throw new Error(`Received error response when fetching Class details: ` + 
                `${response.status}: ${response.statusText}`);
        }
        let data = await response.json();
        if (!('value' in data) || (data.value.length <= 0))
        {
            throw new Error(`Invalid response received when fetching Class details`);
        }
        return data.value[0] as CourseClassDetails;
    }
}
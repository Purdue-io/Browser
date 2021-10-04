import { Course, Subject, Term } from "./Models";

export interface IDataSource
{
    getTermsAsync(): Promise<Term[]>;
    getSubjectsAsync(termCode: string): Promise<Subject[]>;
    getCoursesAsync(termCode: string, subjectAbbreviation: string): Promise<Course[]>;
}
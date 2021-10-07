import { Course, CourseDetails, Subject, Term } from "./Models";

export interface IDataSource
{
    getTermsAsync(): Promise<Term[]>;
    getTermNameAsync(termCode: string): Promise<string>;
    getSubjectsAsync(termCode: string): Promise<Subject[]>;
    getCoursesAsync(termCode: string, subjectAbbreviation: string): Promise<Course[]>;
    getCourseNumberAsync(courseId: string): Promise<string>;
    getTermCourseDetailsAsync(termCode: string, courseId: string): Promise<CourseDetails>;
}
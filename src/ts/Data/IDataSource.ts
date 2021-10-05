import { Course, CourseDetails, Subject, Term } from "./Models";

export interface IDataSource
{
    getTermsAsync(): Promise<Term[]>;
    getSubjectsAsync(termCode: string): Promise<Subject[]>;
    getCoursesAsync(termCode: string, subjectAbbreviation: string): Promise<Course[]>;
    getTermCourseDetailsAsync(termCode: string, courseId: string): Promise<CourseDetails>;
}
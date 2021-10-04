import { Subject, Term } from "./Models";

export interface IDataSource
{
    getTermsAsync(): Promise<Term[]>;
    getSubjectsAsync(termCode: string): Promise<Subject[]>;
}
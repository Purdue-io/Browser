import { Term } from "./Models";

export interface IDataSource
{
    getTermsAsync(): Promise<Term[]>;
}
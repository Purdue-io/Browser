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
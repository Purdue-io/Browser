import { IDataSource } from "./IDataSource";
import { Term } from "./Models";

export class PurdueApiDataSource implements IDataSource
{
    private readonly odataRootUri: string;

    constructor(odataRootUri: string)
    {
        this.odataRootUri = odataRootUri;
    }

    async getTermsAsync(): Promise<Term[]>
    {
        let response = await fetch(`${this.odataRootUri}/Term`);
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
}
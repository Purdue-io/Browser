import { Page } from './Pages/Page';

export interface RouterNavigationContext {
    pathSegments: string[];
    pages: Page[];
    currentPage: Page;
}

export class Router {
    /**
     * The page list determines which page will handle each URL segment.
     * ex. https://purdue.io/TERMCODE/SUBJECTCODE/CLASSNUMBER
     *                     | |        |           ^ Page 3
     *                     | |        ^ Page 2
     *                     | ^ Page 1
     *                     ^ Page 0
     */
    private pageFactories: ((pathSegment: string) => Page)[];

    public static create(pageFactories: ((pathSegment: string) => Page)[]): Router {
        let returnVal = new Router(pageFactories);
        return returnVal;
    }

    private constructor(pageFactories: ((pathSegment: string) => Page)[]) {
        if (pageFactories.length <= 0) {
            throw new Error("Must provide at least one page factory to Router.");
        }
        this.pageFactories = pageFactories;
    }

    public navigate(path: string): RouterNavigationContext {
        let pathSegments = this.parsePathSegments(path);
        let pages = this.pathSegmentsToPages(pathSegments);
        return {
            pathSegments: pathSegments,
            pages: pages,
            currentPage: pages.at(pages.length - 1) as Page
        };
    }

    private parsePathSegments(path: string): string[] {
        if ((path.length <= 0) || 
            (path.length == 1 && path.charAt(0) == '/'))
        {
            return [];
        }
        path = this.stripLeadingAndTrailingSlashes(path);
        return path.split('/');
    }

    private stripLeadingAndTrailingSlashes(path: string): string {
        if (path.length <= 0)
        {
            return path;
        }
        if (path.charAt(0) == '/')
        {
            path = path.substring(1);
        }
        if ((path.length > 0) && path.charAt(path.length - 1) == '/')
        {
            path = path.substring(0, path.length - 1);
        }
        return path;
    }

    private pathSegmentsToPages(pathSegments: string[]): Page[]
    {
        // The first page factory is reserved for the root page,
        // so we begin processing path segments at page factory index 1
        let pages: Page[] = [];
        pages.push(this.pageFactories[0](""));
        if (pathSegments.length > (this.pageFactories.length - 1))
        {
            console.warn(`Could not process ${ pathSegments.length } path segments: ` + 
                `Router is only configured to handle ${ this.pageFactories.length - 1 }. ` + 
                `Falling back to root page.`);
            return pages;
        }
        for(let i = 0; i < pathSegments.length; ++i)
        {
            let page = this.pageFactories[i + 1](pathSegments[i]);
            pages.push(page);
        }
        return pages;
    }
}
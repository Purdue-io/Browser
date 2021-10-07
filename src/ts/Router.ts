/**
 * ROUTER
 * ---
 * The router handles navigating between Pages via the browser URL or via page navigations
 * triggered by user actions such as clicking on a link.
 * 
 * It operates on a hierarchy made up of "segments". Each portion of a URL delimited by
 * a forward slash is considered a segment, and each segment has a name and a Page associated
 * with it.
 * 
 * Ex. https://purdue.io/202210/CS/24000/{GUID}/12345
 *             |         |      |  |     |      ^ "CRN" segment
 *             |         |      |  |     ^ "Class ID" segment
 *             |         |      |  ^ "Course Number" segment
 *             |         |      ^ "Subject Abbreviation" segment
 *             |         ^ "Term ID" segment
 *             ^ Root segment
 * 
 * Each segment is associated with a Page via a list of segment names and Page factories
 * passed to the Router when it is created.
 * 
 * When a navigation occurs, the segment list is processed and Page instances are created.
 * Each page receives a copy of its segment name and segment value plus the segment names and
 * values of each parent page.
 */

import { Page } from './Pages/Page';

export interface Segment
{
    segmentName: string;
    segmentValue: string;
}

export interface SegmentPage
{
    page: Page;
    segment: Segment;
}

export interface PageContext
{
    segment: Segment;
    parentPages: SegmentPage[];
    hints: PageHints | null;
}

export interface PageHints
{
    title: string | null;
}

export type PageFactory = (pageContext: PageContext) => Page;

export interface SegmentPageFactory
{
    segmentName: string;
    pageFactory: PageFactory;
}

export type PageStackUpdatedCallback = (pageStack: SegmentPage[]) => void;

export class Router
{
    private pageFactories: SegmentPageFactory[];
    private pageStackUpdatedCallback: PageStackUpdatedCallback;
    private pageStack: SegmentPage[];

    public constructor(urlSegmentPageFactories: SegmentPageFactory[],
        pageStackUpdatedCallback: PageStackUpdatedCallback)
    {
        this.pageFactories = urlSegmentPageFactories;
        this.pageStackUpdatedCallback = pageStackUpdatedCallback;
        this.pageStack = [];
    }

    public pushSegment(segment: string, hints: PageHints): string
    {
        this.pushNewPageStackEntry(segment, hints);
        this.firePageStackUpdatedCallback();
        return this.getAbsolutePath();
    }

    public navigatePath(path: string): void
    {
        let newPathSegments = this.parsePathSegments(path);
        // Always include a root segment
        newPathSegments = [""].concat(newPathSegments);
        this.setPathSegments(newPathSegments);
    }

    private firePageStackUpdatedCallback(): void
    {
        let pageStackClone: SegmentPage[] = this.pageStack.map((v): SegmentPage => ({
            page: v.page,
            segment: v.segment,
        }));
        this.pageStackUpdatedCallback(pageStackClone);
    }

    private getAbsolutePath(): string
    {
        let pathSegments = this.pageStack.map(p => p.segment.segmentValue);
        return "/" + pathSegments.slice(1).join("/");
    }

    private setPathSegments(pathSegments: string[]): void
    {
        // If we have an invalid number of path segments, default to an empty path
        if (pathSegments.length > this.pageFactories.length)
        {
            pathSegments = [""];
        }
        this.updatePageStack(pathSegments);
        this.firePageStackUpdatedCallback();
    }

    private parsePathSegments(path: string): string[]
    {
        if ((path.length <= 0) ||
            (path.length == 1 && path.charAt(0) == '/'))
        {
            return [];
        }
        path = this.stripLeadingAndTrailingSlashes(path);
        let segments = path.split('/');
        return segments;
    }

    private stripLeadingAndTrailingSlashes(path: string): string
    {
        while ((path.length > 0) && (path.charAt(0) == '/'))
        {
            path = path.substring(1);
        }
        while ((path.length > 0) && (path.charAt(path.length - 1) == '/'))
        {
            path = path.substring(0, path.length - 1);
        }
        return path;
    }

    private updatePageStack(pathSegments: string[]): void
    {
        for (let i = 0; i < pathSegments.length; ++i)
        {
            let pathSegment = pathSegments[i];
            if (i < this.pageStack.length)
            {
                this.keepOrReplacePageStackEntry(i, pathSegment);
            }
            else
            {
                this.pushNewPageStackEntry(pathSegment, null);
            }
        }

        // If the path is smaller than the stack, shorten the stack to match
        if (this.pageStack.length > pathSegments.length)
        {
            this.pageStack.splice(pathSegments.length,
                (this.pageStack.length - pathSegments.length));
        }
    }

    private keepOrReplacePageStackEntry(entryIndex: number, newSegmentValue: string): void
    {
        let pageStackEntry = this.pageStack[entryIndex];
        if (entryIndex == 0)
        {
            // The root page never needs to be updated
            // because its segment value is always empty
            return;
        }

        if (pageStackEntry.segment === null)
        {
            throw new Error("Non-root pages must have a segment defined.");
        }
        let pageFactory = this.pageFactories[entryIndex];
        let stackSegment: Segment = pageStackEntry.segment;
        if ((stackSegment.segmentName === pageFactory.segmentName) &&
            (stackSegment.segmentValue === newSegmentValue))
        {
            // If the segment names and values haven't changed,
            // then no update is needed.
            return;
        }

        let newPageStackEntry = this.newPageStackEntry(entryIndex, newSegmentValue, null);
        this.pageStack[entryIndex] = newPageStackEntry;
    }

    private pushNewPageStackEntry(pathSegment: string, hints: PageHints | null): void
    {
        let newPageStackEntry = this.newPageStackEntry(this.pageStack.length, pathSegment, hints);
        this.pageStack.push(newPageStackEntry);
    }

    private newPageStackEntry(segmentIndex: number, segmentValue: string, hints: PageHints | null):
        SegmentPage
    {
        let pageFactory = this.pageFactories[segmentIndex];
        let segment: Segment =
        {
            segmentName: pageFactory.segmentName,
            segmentValue: segmentValue,
        };
        let pageContext: PageContext = 
        {
            parentPages: this.pageStack.slice(0, segmentIndex).reverse(),
            segment: segment,
            hints: hints
        };
        let newPage = pageFactory.pageFactory(pageContext);
        let newPageStackEntry: SegmentPage = 
        {
            page: newPage,
            segment: segment,
        };
        return newPageStackEntry;
    }

    private getSegmentPageFactories(pathSegments: string[]): SegmentPageFactory[]
    {
        let factories: SegmentPageFactory[] = [];
        if (pathSegments.length > this.pageFactories.length)
        {
            console.warn(`Could not process ${ pathSegments.length } URL path segments, ` + 
                `Router is only configured to handle ${ this.pageFactories.length }. ` + 
                `Falling back to root page.`);
            return factories;
        }
        for(let i = 0; i < pathSegments.length; ++i)
        {
            let pageFactory = this.pageFactories[i];
            factories.push(pageFactory);
        }
        return factories;
    }
}
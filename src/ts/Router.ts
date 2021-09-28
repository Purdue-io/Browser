import { Page } from './Pages/Page';

export type PageFactory = (pathSegment: string) => Page;

export interface RouterNavigationNode {
    segment: string;
    page: Page;
}

export interface RouterNavigationContext {
    nodes: RouterNavigationNode[];
    currentNode: RouterNavigationNode;
}

export class Router {
    /**
     * The page list determines which page will handle each URL segment.
     * ex. https://purdue.io/TERMCODE/SUBJECTCODE/CLASSNUMBER
     *                     | |        |           ^ Segment page 2
     *                     | |        ^ Segment page 1
     *                     | ^ Segment page 0
     *                     ^ Root page
     */
    private rootPageFactory: PageFactory;
    private urlSegmentPageFactories: PageFactory[];

    public static create(rootPageFactory: PageFactory,
        urlSegmentPageFactories: PageFactory[]): Router {
        let returnVal = new Router(rootPageFactory, urlSegmentPageFactories);
        return returnVal;
    }

    private constructor(rootPageFactory: PageFactory, urlSegmentPageFactories: PageFactory[]) {
        this.rootPageFactory = rootPageFactory;
        this.urlSegmentPageFactories = urlSegmentPageFactories;
    }

    public navigate(path: string): RouterNavigationContext {
        let pathSegments = this.parsePathSegments(path);
        let nodes = this.pathSegmentsToNavigationNodes(pathSegments);
        return {
            nodes: nodes,
            currentNode: nodes[nodes.length - 1]
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

    private pathSegmentsToNavigationNodes(pathSegments: string[]): RouterNavigationNode[]
    {
        let nodes: RouterNavigationNode[] = [];
        nodes.push({segment: "", page: this.rootPageFactory("")});
        if (pathSegments.length > this.urlSegmentPageFactories.length)
        {
            console.warn(`Could not process ${ pathSegments.length } URL path segments, ` + 
                `Router is only configured to handle ${ this.urlSegmentPageFactories.length }. ` + 
                `Falling back to root page.`);
            return nodes;
        }
        for(let i = 0; i < pathSegments.length; ++i)
        {
            let page = this.urlSegmentPageFactories[i](pathSegments[i]);
            nodes.push({segment: pathSegments[i], page: page});
        }
        return nodes;
    }
}
import { Page } from "../src/ts/Pages/Page";
import { Router, Segment, SegmentPage, SegmentPageFactory } from "../src/ts/Router";

class MockRootPage extends Page
{
    constructor()
    {
        super("", () => {});
    }
}
class MockLevelOnePage extends Page
{
    public oneValue: string;
    constructor(oneValue: string)
    {
        super("", () => {});
        this.oneValue = oneValue;
    }
}
class MockLevelTwoPage extends Page
{
    public oneValue: string;
    public twoValue: string;
    constructor(oneValue: string, twoValue: string)
    {
        super("", () => {});
        this.oneValue = oneValue;
        this.twoValue = twoValue;
    }
}

// Disable console.warn, as we expect this to fire for some of our failure case tests.
beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe("Router navigation", () => {
    let pageStack: SegmentPage[] | null = null;
    let getLastPage = () => (pageStack as SegmentPage[])[(pageStack as SegmentPage[]).length - 1];
    let segmentPageFactories: SegmentPageFactory[] =
    [
        {
            pageFactory: (pageContext) => new MockRootPage(),
            segmentName: "root",
        },
        {
            pageFactory: (pageContext) => new MockLevelOnePage(pageContext.segment.segmentValue),
            segmentName: "one",
        },
        {
            pageFactory: (pageContext) => new MockLevelTwoPage(
                pageContext.parentPages[0].segment.segmentValue, pageContext.segment.segmentValue),
            segmentName: "two",
        },
    ];
    let router = new Router(segmentPageFactories, (s) => { pageStack = s; });

    it("should show root page when navigating to ''", () => {
        router.navigatePath("");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockRootPage).toBe(true);
    });

    it("should show root page when navigating to '/'", () => {
        router.navigatePath("/");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockRootPage).toBe(true);
    });

    it("should show mock level one page when navigating to '/first'", () => {
        router.navigatePath("/first");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockLevelOnePage).toBe(true);
        let currentMockPage = getLastPage().page as MockLevelOnePage;
        expect(currentMockPage.oneValue).toEqual("first");
    });

    it("should show mock level one page when navigating to '/first/'", () => {
        router.navigatePath("/first/");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockLevelOnePage).toBe(true);
        let currentMockPage = getLastPage().page as MockLevelOnePage;
        expect(currentMockPage.oneValue).toEqual("first");
    });

    it("should show mock level two page when navigating to '/first/second'", () => {
        router.navigatePath("/first/second");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockLevelTwoPage).toBe(true);
        let currentMockPage = getLastPage().page as MockLevelTwoPage;
        expect(currentMockPage.oneValue).toEqual("first");
        expect(currentMockPage.twoValue).toEqual("second");
    });

    it("should return root page only when navigating to invalid path", () => {
        router.navigatePath("/this/path/bogus");
        expect(pageStack).toBeDefined();
        expect(getLastPage().page instanceof MockRootPage).toBe(true);
    })
});
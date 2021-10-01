import { Page } from "../src/ts/Pages/Page";
import { Router, SegmentPageFactory } from "../src/ts/Router";

class MockRootPage extends Page
{
    constructor()
    {
        super("");
    }
}
class MockLevelOnePage extends Page
{
    public oneValue: string;
    constructor(oneValue: string)
    {
        super("");
        this.oneValue = oneValue;
    }
}
class MockLevelTwoPage extends Page
{
    public oneValue: string;
    public twoValue: string;
    constructor(oneValue: string, twoValue: string)
    {
        super("");
        this.oneValue = oneValue;
        this.twoValue = twoValue;
    }
}

// Disable console.warn, as we expect this to fire for some of our failure case tests.
beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe("Router navigation", () => {
    let currentPage: Page | null = null;
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
    let router = new Router(segmentPageFactories, (page) => { currentPage = page; });

    it("should show root page when navigating to ''", () => {
        router.navigatePath("");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockRootPage).toBe(true);
    });

    it("should show root page when navigating to '/'", () => {
        router.navigatePath("/");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockRootPage).toBe(true);
    });

    it("should show mock level one page when navigating to '/first'", () => {
        router.navigatePath("/first");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockLevelOnePage).toBe(true);
        let currentMockPage = currentPage as MockLevelOnePage;
        expect(currentMockPage.oneValue).toEqual("first");
    });

    it("should show mock level one page when navigating to '/first/'", () => {
        router.navigatePath("/first/");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockLevelOnePage).toBe(true);
        let currentMockPage = currentPage as MockLevelOnePage;
        expect(currentMockPage.oneValue).toEqual("first");
    });

    it("should show mock level two page when navigating to '/first/second'", () => {
        router.navigatePath("/first/second");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockLevelTwoPage).toBe(true);
        let currentMockPage = currentPage as MockLevelTwoPage;
        expect(currentMockPage.oneValue).toEqual("first");
        expect(currentMockPage.twoValue).toEqual("second");
    });

    it("should return root page only when navigating to invalid path", () => {
        router.navigatePath("/this/path/bogus");
        expect(currentPage).toBeDefined();
        expect(currentPage instanceof MockRootPage).toBe(true);
    })
});
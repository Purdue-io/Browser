import { Page } from "../src/ts/Pages/Page";
import { PageFactory, Router, RouterNavigationContext } from "../src/ts/Router";

class MockRootPage extends Page { }
class MockLevelOnePage extends Page { }
class MockLevelTwoPage extends Page { }

// Disable console.warn, as we expect this to fire for some of our failure case tests.
beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe("Router navigation", () => {
    let rootPageFactory: PageFactory = (segment) => new MockRootPage(segment);
    let segmentPageFactories: PageFactory[] = [
        (segment) => new MockLevelOnePage(segment),
        (segment) => new MockLevelTwoPage(segment),
    ];
    let router = Router.create(rootPageFactory, segmentPageFactories);

    it("should return root page when navigating to ''", () => {
        let navigationContext = router.navigate("");
        expect(navigationContext.nodes.length).toEqual(1);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.currentNode.page instanceof MockRootPage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("");
    });

    it("should return root page when navigating to '/'", () => {
        let navigationContext = router.navigate("/");
        expect(navigationContext.nodes.length).toEqual(1);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.currentNode.page instanceof MockRootPage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("");
    });

    it("should return expected pages when navigating to '/first'", () => {
        let navigationContext = router.navigate("/first");
        expect(navigationContext.nodes.length).toEqual(2);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.nodes[1].page instanceof MockLevelOnePage).toBe(true);
        expect(navigationContext.nodes[1].segment).toEqual("first");
        expect(navigationContext.currentNode.page instanceof MockLevelOnePage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("first");
    });

    it("should return expected pages when navigating to '/first/'", () => {
        let navigationContext = router.navigate("/first/");
        expect(navigationContext.nodes.length).toEqual(2);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.nodes[1].page instanceof MockLevelOnePage).toBe(true);
        expect(navigationContext.nodes[1].segment).toEqual("first");
        expect(navigationContext.currentNode.page instanceof MockLevelOnePage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("first");
    });

    it("should return expected pages when navigating to '/first/second'", () => {
        let navigationContext = router.navigate("/first/second");
        expect(navigationContext.nodes.length).toEqual(3);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.nodes[1].page instanceof MockLevelOnePage).toBe(true);
        expect(navigationContext.nodes[1].segment).toEqual("first");
        expect(navigationContext.nodes[2].page instanceof MockLevelTwoPage).toBe(true);
        expect(navigationContext.nodes[2].segment).toEqual("second");
        expect(navigationContext.currentNode.page instanceof MockLevelTwoPage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("second");
    });

    it("should return root page only when navigating to invalid path", () => {
        let navigationContext = router.navigate("/this/path/is/bogus");
        expect(navigationContext.nodes.length).toEqual(1);
        expect(navigationContext.nodes[0].page instanceof MockRootPage).toBe(true);
        expect(navigationContext.nodes[0].segment).toEqual("");
        expect(navigationContext.currentNode.page instanceof MockRootPage).toBe(true);
        expect(navigationContext.currentNode.segment).toEqual("");
    })
});
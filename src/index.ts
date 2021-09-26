import { Application } from "./ts/Application";

document.addEventListener("DOMContentLoaded", () => {
    let rootElement = document.body.querySelector("#Application") as HTMLElement;
    if (rootElement !== null)
    {
        Application.start(rootElement);
    }
    else
    {
        console.error("Could not find root element with id 'Application'.");
    }
});
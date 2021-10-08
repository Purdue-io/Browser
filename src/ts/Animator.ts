export class Animator
{
    public static RunAnimation(targetElement: HTMLElement, animationClassName: string):
        Promise<void>
    {
        return new Promise((resolve, reject) => {
            targetElement.addEventListener("animationend", (e) => {
                targetElement.classList.remove(animationClassName);
                resolve();
            }, { once: true });
            targetElement.classList.add(animationClassName);
        });
    }
}
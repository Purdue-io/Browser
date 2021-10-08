import { Animator } from "./Animator";

export class LoadingTicket {
    private readonly clearCallback: (ticket: LoadingTicket) => void;
    private clearCalled: boolean = false;

    constructor(clearCallback: (ticket: LoadingTicket) => void)
    {
        this.clearCallback = clearCallback;
    }

    public clear(): void
    {
        if (!this.clearCalled)
        {
            this.clearCalled = true;
            this.clearCallback(this);
        }
        else
        {
            console.error("LoadingTicket clear called more than once.");
        }
    }
}

export class LoadingCurtain
{
    private static readonly SHOW_CURTAIN_DELAY_MS: number = 500;
    private static readonly LOADING_CURTAIN_TEMPLATE_ID: string = "LoadingCurtainTemplate";
    private readonly loadingCurtainElement: HTMLElement;
    private readonly loadingTickets: Set<LoadingTicket>;
    private showDelayTimerTimeoutId: number | null = null;
    private curtainShown: boolean = false;
    private curtainHiding: boolean = false;

    constructor()
    {
        this.loadingCurtainElement = this.loadTemplate();
        this.loadingTickets = new Set<LoadingTicket>();
    }

    public setLoading(): LoadingTicket
    {
        let ticket = new LoadingTicket(this.clearTicket.bind(this));
        this.loadingTickets.add(ticket);
        this.setShowCurtainTimer();
        return ticket;
    }

    private loadTemplate(): HTMLElement
    {
        let templateElement = document.querySelector(
            `#${LoadingCurtain.LOADING_CURTAIN_TEMPLATE_ID}`) as HTMLTemplateElement;
        if (templateElement === null)
        {
            throw new Error(`Cannot find template element with id '` + 
                `${LoadingCurtain.LOADING_CURTAIN_TEMPLATE_ID}'`);
        }
        let container = document.createElement("div") as HTMLDivElement;
        container.classList.add(LoadingCurtain.LOADING_CURTAIN_TEMPLATE_ID);
        for (let child of templateElement.content.childNodes)
        {
            container.appendChild(child.cloneNode(true));
        }
        return container;
    }

    private setShowCurtainTimer(): void
    {
        if (this.showDelayTimerTimeoutId === null)
        {
            this.showDelayTimerTimeoutId = window.setTimeout(
                this.showCurtainTimerExpired.bind(this), LoadingCurtain.SHOW_CURTAIN_DELAY_MS);
        }
    }

    private showCurtainTimerExpired(): void
    {
        // If there are still outstanding tickets, show the loading curtain
        if (this.loadingTickets.size > 0)
        {
            this.showCurtain();
        }
        this.showDelayTimerTimeoutId = null;
    }

    private showCurtain(): void
    {
        if (!this.curtainShown)
        {
            this.curtainShown = true;
            document.body.appendChild(this.loadingCurtainElement);
            Animator.RunAnimation(this.loadingCurtainElement, "anim-page-in");
        }
        else if (this.curtainHiding)
        {
            this.curtainHiding = false; // short-circuit the hiding animation
        }
    }

    private hideCurtain(): void
    {
        if (this.curtainShown)
        {
            this.curtainHiding = true;
            Animator.RunAnimation(this.loadingCurtainElement, "anim-page-out").then(() => 
            {
                if (this.curtainHiding)
                {
                    document.body.removeChild(this.loadingCurtainElement);
                    this.curtainShown = false;
                    this.curtainHiding = false;
                }
            });
        }
    }

    private clearTicket(ticket: LoadingTicket): void
    {
        if (this.loadingTickets.has(ticket))
        {
            this.loadingTickets.delete(ticket);
            if ((this.loadingTickets.size == 0) && this.curtainShown)
            {
                this.hideCurtain();
            }
        }
    }
}
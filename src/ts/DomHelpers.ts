export class DomHelpers
{
    public static clearChildren(node: Node): void
    {
        while (node.firstChild != null)
        {
            node.removeChild(node.lastChild as Node);
        }
    }
}
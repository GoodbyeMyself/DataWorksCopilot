declare module "monaco-editor/esm/vs/base/common/linkedList" {
    interface LinkedListNode {
        element?: {
            command?: {
                id: string;
            };
        };
        next?: LinkedListNode;
    }

    export class LinkedList {
        _first: LinkedListNode;
        _remove(node: LinkedListNode): void;
        push(item: { command: { id: string } }): void;
    }
}

declare module "monaco-editor/esm/vs/platform/actions/common/actions" {
    export class MenuId {
        static EditorContext: MenuId;
        constructor(id: string);
    }

    export const MenuRegistry: {
        _menuItems: Map<MenuId, LinkedList>;
    };
}

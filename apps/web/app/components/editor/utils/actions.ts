// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
import type { Monaco } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";
import type { ImperativePanelHandle } from "react-resizable-panels";

export function validateSelection(
    monaco: Monaco,
    onRunQuery: (value: string) => Promise<void>,
) {
    monaco.editor.addEditorAction({
        id: "validate-selection",
        label: "validate-selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: async (editor) => {
            const selection = editor.getSelection();

            const value =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (!value) return;

            await onRunQuery(value);
        },
    });
}

export function runSelection(
    monaco: Monaco,
    onRunQuery: (value: string) => Promise<void>,
) {
    monaco.editor.addEditorAction({
        id: "run-selection",
        label: "Run Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: (editor) => {
            const selection = editor.getSelection();

            const value =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (!value) return;

            onRunQuery(value ?? "");
        },
    });
}

export function Copolit(
    monaco: Monaco,
    copolitRef: React.RefObject<ImperativePanelHandle>,
) {
    monaco.editor.addEditorAction({
        id: "Copolit",
        label: "Copolit",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        contextMenuGroupId: "0_Copolit",
        contextMenuOrder: 1,
        run: (editor) => {
            // --
            console.log(editor, "<- editor");
            // --
            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }
        },
    });
}

export function GenerateAnnotations(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "Generate-annotations",
        label: "生成注释",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 1,
        run: (editor) => {
            console.log(editor, "<- 生成注释");
        },
    });
}

export function GenerateSQL(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "Generate-SQL",
        label: "SQL 生成",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
        run: (editor) => {
            console.log(editor, "<- SQL 生成");
        },
    });
}

export function SQLErrorCorrection(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "SQL-Error-Correction",
        label: "SQL 纠错",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
        run: (editor) => {
            console.log(editor, "<- SQL 纠错");
        },
    });
}

export function SQLRewriting(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "SQL-Rewriting",
        label: "SQL 改写",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
        run: (editor) => {
            console.log(editor, "<- SQL 改写");
        },
    });
}

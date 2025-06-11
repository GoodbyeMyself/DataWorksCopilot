// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
import type { Monaco } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";
import type { ImperativePanelHandle } from "react-resizable-panels";

// 定义所有动作的配置
const editorActions = {
    validateSelection: {
        id: "validate-selection",
        label: "validate-selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1,
    },
    runSelection: {
        id: "run-selection",
        label: "Run Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 2,
    },
    Copolit: {
        id: "Copolit",
        label: "Copolit",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "0_Copolit",
        contextMenuOrder: 1,
    },
    GenerateAnnotations: {
        id: "Generate-annotations",
        label: "生成注释",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 1,
    },
    GenerateSQL: {
        id: "Generate-SQL",
        label: "SQL 生成",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
    },
    SQLErrorCorrection: {
        id: "SQL-Error-Correction",
        label: "SQL 纠错",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 3,
    },
    SQLRewriting: {
        id: "SQL-Rewriting",
        label: "SQL 改写",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 4,
    },
} as const;

// 集中处理所有动作的函数
export function registerEditorActions(
    monaco: Monaco,
    options: {
        onRunQuery?: (value: string) => Promise<void>;
        copolitRef?: React.RefObject<ImperativePanelHandle>;
    } = {},
) {
    const { onRunQuery, copolitRef } = options;

    // 验证选择
    if (onRunQuery) {
        monaco.editor.addEditorAction({
            ...editorActions.validateSelection,
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

        // 运行选择
        monaco.editor.addEditorAction({
            ...editorActions.runSelection,
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

    // Copolit
    if (copolitRef) {
        monaco.editor.addEditorAction({
            ...editorActions.Copolit,
            run: (editor) => {
                console.log(editor, "<- editor");
                if (copolitRef?.current?.isCollapsed()) {
                    copolitRef.current?.expand();
                    copolitRef.current?.resize(20);
                }
            },
        });
    }

    // 生成注释
    monaco.editor.addEditorAction({
        ...editorActions.GenerateAnnotations,
        run: (editor) => {
            console.log(editor, "<- 生成注释");
        },
    });

    // SQL 生成
    monaco.editor.addEditorAction({
        ...editorActions.GenerateSQL,
        run: (editor) => {
            console.log(editor, "<- SQL 生成");
        },
    });

    // SQL 纠错
    monaco.editor.addEditorAction({
        ...editorActions.SQLErrorCorrection,
        run: (editor) => {
            console.log(editor, "<- SQL 纠错");
        },
    });

    // SQL 改写
    monaco.editor.addEditorAction({
        ...editorActions.SQLRewriting,
        run: (editor) => {
            console.log(editor, "<- SQL 改写");
        },
    });
}

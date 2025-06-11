// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
import type { Monaco } from "@monaco-editor/react";
import { reportIssue, shareMarkdown, shareURL } from "./share";

export function copy_as_url(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "swc-ast-viewer.copy-as-url",
        label: "复制为 URL",
        contextMenuOrder: 5,
        contextMenuGroupId: "9_cutcopypaste",
        run(editor) {
            const code = editor.getValue();
            const result = shareURL(code);
            navigator.clipboard.writeText(result);
        },
    });
}

export function copy_as_markdown(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "swc-ast-viewer.copy-as-markdown",
        label: "复制为 Markdown 链接",
        contextMenuOrder: 5.1,
        contextMenuGroupId: "9_cutcopypaste",
        run(editor) {
            const code = editor.getValue();
            const result = shareMarkdown(code);
            navigator.clipboard.writeText(result);
        },
    });
}

export function open_issue(monaco: Monaco) {
    monaco.editor.addEditorAction({
        id: "swc-ast-viewer.open-issue",
        label: "在 SWC 仓库中打开 Issue",
        contextMenuOrder: 3,
        contextMenuGroupId: "issue",
        run(editor) {
            const code = editor.getValue();
            const result = reportIssue(code);
            window.open(result);
        },
    });
}

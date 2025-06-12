import type { OnChange } from "@monaco-editor/react";

import { DragHandleDots2Icon } from "@radix-ui/react-icons";

import { FileJson, Loader2, LoaderPinwheel, NotepadText } from "lucide-react";

import { Range, type editor } from "monaco-editor";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
    Panel,
    PanelGroup,
    PanelResizeHandle,
    type ImperativePanelHandle,
} from "react-resizable-panels";

import { useSpinDelay } from "spin-delay";

import Editor from "~/components/monaco";

import { useEditorSettings } from "~/context/editor-settings/useEditor";
import { useEditor } from "~/context/editor/useEditor";
import { useSession } from "~/context/session/useSession";

import { cn } from "~/lib/utils";

import { formatSQL } from "~/utils/sql_fmt";
import ResultsView from "../result-viewer";
import OpenFileTabs from "./components/open-files";

type EditorPanelProps = {
    copolitRef?: React.RefObject<ImperativePanelHandle>;
};

function EditorPanel({ copolitRef }: EditorPanelProps) {
    return (
        <PanelGroup
            className="flex size-full flex-col"
            direction="vertical"
        >
            <Panel
                defaultSize={60}
                minSize={10}
                className="flex flex-col"
            >
                <OpenFileTabs />
                <CurrentEditor copolitRef={copolitRef} />
            </Panel>
            <PanelResizeHandle
                className={cn(
                    "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
                )}
            >
                <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
                    <DragHandleDots2Icon className="size-2.5" />
                </div>
            </PanelResizeHandle>
            <Panel
                defaultSize={40}
                minSize={20}
            >
                <ResultsView />
            </Panel>
        </PanelGroup>
    );
}

export default EditorPanel;

function CurrentEditor({ copolitRef }: EditorPanelProps) {
    const { editors, onSaveEditor, dispatch } = useSession();

    const { editorRef } = useEditor();

    const [sql, setSql] = useState("");

    const [isReady, setIsReady] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const { shouldFormat } = useEditorSettings();

    const currentEditor = useMemo(
        () => editors.find((editor) => editor.isFocused),
        [editors],
    );

    const path = currentEditor?.path;

    const onChangeHandler: OnChange = useCallback(
        (value, _ev) => {
            setSql(value ?? "");

            if (!dispatch || !path) return;

            dispatch({
                type: "UPDATE_EDITOR",
                payload: {
                    path,
                    content: value ?? "",
                },
            });
        },
        [dispatch, path],
    );

    // get content of current editor
    useEffect(() => {
        if (currentEditor) {
            setSql(currentEditor.content);
            setIsReady(true);
        }
    }, [currentEditor]);

    const onSave = useCallback(
        async (editor: editor.ICodeEditor) => {
            if (!currentEditor?.path) return;

            // check if the content has changed

            let content = editor.getValue();

            const model = editor.getModel();

            if (model == null) return;

            setIsSaving(true);

            // try format

            if (shouldFormat) {
                try {
                    // check whether user has disabled formatting

                    // Format the SQL query using the formatting provider
                    const formatted = await formatSQL(content);
                    model.applyEdits([
                        {
                            range: new Range(
                                0,
                                0,
                                model.getLineCount(),
                                model.getLineMaxColumn(model.getLineCount()),
                            ),
                            text: formatted,
                        },
                    ]);

                    // Push the formatted content to the undo stack (so that the user can undo the formatting if they want to)
                    model.pushStackElement();

                    content = formatted;
                } catch (e) {
                    console.error(
                        `Error formatting file: ${currentEditor.path}: `,
                        e,
                    );
                }
            }

            try {
                await onSaveEditor({
                    content,
                    path: currentEditor.path,
                });
            } catch (e) {
                console.error(`Error saving file: ${currentEditor.path}: `, e);
            } finally {
                setIsSaving(false);
            }
        },
        [currentEditor, onSaveEditor, shouldFormat],
    );

    const showLoader = useSpinDelay(isSaving, {
        delay: 0,
        minDuration: 120,
    });

    if (!currentEditor) {
        return (
            <div className="flex h-full flex-col items-start justify-start gap-12 bg-gradient-to-b from-background to-muted/20 px-16 pt-12">
                <div className="max-w-2xl text-left">
                    <h1 className="mb-2 text-4xl font-bold text-foreground">
                        DataWorks Copilot
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        您的智能数据开发助手
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-24">
                    <div>
                        <h3 className="mb-4 text-xl font-semibold text-foreground transition-colors">
                            大数据体验
                        </h3>
                        <p className="inline-flex cursor-pointer text-sm">
                            <LoaderPinwheel className="mr-2 h-4 w-4 text-blue-500" />
                            <span className="text-blue-500">
                                探索 DataWorks Galley 的强大功能
                            </span>
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-4 text-xl font-semibold text-foreground transition-colors">
                            演练
                        </h3>
                        <div className="mb-2">
                            <p className="inline-flex cursor-pointer text-sm">
                                <NotepadText className="mr-2 h-4 w-4 text-yellow-500" />
                                DataWorks Notebook 交互式开发
                            </p>
                        </div>
                        <div className="mb-2">
                            <button
                                type="button"
                                className="inline-flex cursor-pointer border-none bg-transparent p-0 text-sm"
                                onClick={() => {
                                    if (copolitRef?.current?.isCollapsed()) {
                                        copolitRef.current?.expand();
                                        copolitRef.current?.resize(20);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        if (
                                            copolitRef?.current?.isCollapsed()
                                        ) {
                                            copolitRef.current?.expand();
                                            copolitRef.current?.resize(20);
                                        }
                                    }
                                }}
                            >
                                <FileJson className="mr-2 h-4 w-4 text-blue-500" />
                                DataWorks Copilot 智能助手
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isReady) {
        return (
            <div className="flex h-full items-center justify-center text-gray-400">
                Loading...
            </div>
        );
    }

    return (
        <>
            <Editor
                onSave={onSave}
                value={sql}
                ref={editorRef}
                onChange={onChangeHandler}
                className="h-full border-t-0"
                options={{
                    padding: {
                        top: 10,
                        bottom: 16,
                    },
                }}
                copolitRef={copolitRef}
            />
            {showLoader && (
                <div className="absolute right-4 top-2 z-10">
                    <Loader2
                        name="loader-circle"
                        className="size-4 animate-spin text-primary"
                    />
                </div>
            )}
        </>
    );
}

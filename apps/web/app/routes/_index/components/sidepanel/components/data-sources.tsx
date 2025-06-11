import { zodResolver } from "@hookform/resolvers/zod";

// icon
import {
    ArrowDownToDot,
    ChevronDown,
    Database,
    FileDown,
    Plus,
    ShieldEllipsis,
    Trash2,
} from "lucide-react";

import { useCallback, useState, type ReactNode } from "react";

import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { z } from "zod";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "~/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useDB } from "~/context/db/useDB";
import { useEditor } from "~/context/editor/useEditor";
import { useSession } from "~/context/session/useSession";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";
import { useWrapper } from "./wrapper/context/useWrapper";

export default function DataSources() {
    const { sources } = useSession();
    const { ref, isCollapsed } = useWrapper();

    const onToggle = () => {
        if (!ref.current) {
            console.warn("No panel ref found");
            return;
        }

        const isExpanded = ref.current.isExpanded();

        if (isExpanded) {
            ref.current.collapse();
        } else {
            ref.current.expand();
        }
    };

    return (
        <div className="flex w-full flex-col">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background">
                <div className="flex grow">
                    <Button
                        onClick={onToggle}
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
                    >
                        <ChevronDown
                            name="chevron-down"
                            className={cn(
                                "size-5",
                                isCollapsed &&
                                    "-rotate-90 transition-transform",
                            )}
                        />
                        <span className="text-sm font-semibold">数据源</span>
                    </Button>
                </div>
                <div className="flex items-center gap-1 px-2">
                    <SourcesToolbar />
                </div>
            </div>
            <div
                className={cn(
                    "flex max-h-[calc(100vh-200px)] w-full flex-col space-y-1 overflow-y-auto py-1 pl-4 pr-8",
                    isCollapsed && "hidden",
                )}
            >
                {sources.map((source) => (
                    <DatesetItem
                        key={source.path}
                        {...source}
                    />
                ))}
            </div>
        </div>
    );
}

type SourceEntry = ReturnType<typeof useSession>["sources"][number];

function DatesetItem(props: SourceEntry) {
    const { isCopied, copyToClipboard } = useCopyToClipboard();
    const [showDelete, setShowDelete] = useState(false);
    const { editorRef } = useEditor();

    const { ext, mimeType, path, handle } = props;

    let pathWithoutExt = path.slice(0, path.length - ext.length - 1); // remove the dot too

    /* 
    Unquoted identifiers need to conform to a number of rules:
    They must not be a reserved keyword (see duckdb_keywords()), e.g., SELECT 123 AS SELECT will fail.
    They must not start with a number or special character, e.g., SELECT 123 AS 1col is invalid.
    They cannot contain whitespaces (including tabs and newline characters).
  */

    // remove any special characters
    pathWithoutExt = pathWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_");
    // remove any leading numbers
    pathWithoutExt = pathWithoutExt.replace(/^[0-9]+/, "_");
    // remove any leading special characters
    pathWithoutExt = pathWithoutExt.replace(/^[^a-zA-Z_]+/, "_");
    // remove whitespaces
    pathWithoutExt = pathWithoutExt.replace(/\s+/g, "_");
    // remove tabs
    pathWithoutExt = pathWithoutExt.replace(/\t+/g, "_");
    // remove newlines
    pathWithoutExt = pathWithoutExt.replace(/\n+/g, "_");

    const onCopy = async () => {
        let snippet = "";

        switch (mimeType) {
            case "application/json": {
                snippet = `CREATE OR REPLACE TABLE '${pathWithoutExt}' AS SELECT * FROM read_json_auto('${path}');\nSUMMARIZE ${pathWithoutExt};`;
                break;
            }
            case "application/parquet": {
                snippet = `CREATE OR REPLACE TABLE '${pathWithoutExt}' AS SELECT * FROM read_parquet('${path}');\nSUMMARIZE ${pathWithoutExt};`;
                break;
            }
            case "text/csv": {
                snippet = `CREATE OR REPLACE TABLE ${pathWithoutExt} AS SELECT * FROM read_csv_auto('${path}');\nSUMMARIZE ${pathWithoutExt};`;
                break;
            }
            default: {
                toast.error(`Unknown file type: ${path}`, {
                    description: "More file types will be supported soon.",
                });
                return;
            }
        }

        await copyToClipboard(snippet.trim());

        // insert into editor
        const editor = editorRef.current?.getEditor();

        if (editor) {
            const selection = editor.getSelection();

            editor.executeEdits("my-source", [
                {
                    text: snippet,
                    forceMoveMarkers: false,
                    range: {
                        startLineNumber:
                            selection?.selectionStartLineNumber || 1,
                        startColumn: selection?.selectionStartColumn || 1,
                        endLineNumber: selection?.endLineNumber || 1,
                        endColumn: selection?.endColumn || 1,
                    },
                },
            ]);
        }
    };

    const onDownloadHandler = useCallback(async () => {
        const saveHandle = await window.showSaveFilePicker({
            types: [
                {
                    description: "Datasets",
                    accept: {
                        "application/octet-stream": [".parquet"],
                        "csv/*": [".csv"],
                        "json/*": [".json"],
                        "text/*": [".txt"],
                        "application/vnd.ms-excel": [".xls"],
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                            [".xlsx"],
                        "text/plain": [".sql"],
                    },
                },
            ],
            startIn: "downloads",
            suggestedName: path,
        });

        if (!saveHandle) return; // user cancelled

        try {
            const file = await handle.getFile();

            const writable = await saveHandle.createWritable();

            await writable.write(file);

            await writable.close();

            toast.success("File downloaded", {
                description: "The file has been saved to your device.",
            });
        } catch (e) {
            console.error("Failed to download file: ", e);

            toast.error("Failed to download file", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    }, [handle, path]);
    return (
        <>
            <ContextMenu key={path}>
                <ContextMenuTrigger className="w-full data-[state=open]:bg-gray-100 data-[state=open]:dark:bg-gray-900">
                    <Button
                        className={cn(
                            "flex h-6 w-full items-center justify-between gap-2 overflow-hidden p-2",
                        )}
                        variant="ghost"
                    >
                        <div className="relative inline-flex w-full items-center gap-1">
                            <Database
                                className={cn("mr-0.5 size-4 shrink-0")}
                            />
                            <span className="truncate font-normal">{path}</span>
                        </div>
                    </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                    <ContextMenuItem
                        inset
                        onSelect={onCopy}
                    >
                        <ArrowDownToDot size={16} />
                        <span className="ml-2">插入表 SQL</span>
                    </ContextMenuItem>
                    <ContextMenuItem inset>
                        <ShieldEllipsis size={16} />
                        <span className="ml-2">数据探查</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        inset
                        onSelect={onDownloadHandler}
                    >
                        <FileDown size={16} />
                        <span className="ml-2">下载</span>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        inset
                        onSelect={() => setShowDelete(true)}
                    >
                        <Trash2 size={16} />
                        <span className="ml-2">删除</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <DeleteEditorModal
                isOpen={showDelete}
                onOpenChange={(open) => setShowDelete(open)}
                path={path}
            />
        </>
    );
}

type DeleteModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    path: string;
};
/**
 * Delete the editor (not close the file).
 */
function DeleteEditorModal(props: DeleteModalProps) {
    const { isOpen, onOpenChange, path } = props;

    const { onDeleteDataSource } = useSession();

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        确定要删除所选数据源吗 ？
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        此操作无法撤销, 这将永久删除该数据源
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => await onDeleteDataSource(path)}
                    >
                        确认
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * Only Chrome supports window.showOpenFilePicker.
 */
const useModernFilePicker = () => {
    const { onAddDataSources } = useSession();
    const { db } = useDB();

    const onAddFiles = useCallback(async () => {
        try {
            const fileHandles = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Datasets",
                        accept: {
                            "application/octet-stream": [".parquet"],
                            "csv/*": [".csv"],
                            "json/*": [".json"],
                            "text/*": [".txt"],
                            "application/vnd.ms-excel": [".xls"],
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                                [".xlsx"],
                            "text/plain": [".sql"],
                        },
                    },
                ],
                excludeAcceptAllOption: false,
                multiple: true,
            });

            if (!fileHandles || fileHandles.length === 0) return;

            const newSources = await onAddDataSources(
                fileHandles.map((handle) => ({
                    filename: handle.name,
                    type: "FILE_HANDLE",
                    entry: handle,
                })),
            );

            if (!newSources || newSources.length === 0) return;

            for await (const { handle } of newSources) {
                await db?.registerFileHandle(handle.name, handle);
            }
        } catch (e) {
            // ignore aborted request
            if (e instanceof Error && e.name === "AbortError") return;
            console.error("Failed to add filehandles: ", e);
            toast.error("Failed to add files", {
                description: e instanceof Error ? e.message : undefined,
            });
        }
    }, [db, onAddDataSources]);

    return onAddFiles;
};

const usePolfillFilePicker = () => {
    const { onAddDataSources } = useSession();
    const { db } = useDB();

    const onAddFiles = useCallback(async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept =
            ".parquet,.csv,.json,.txt,.xls,.xlsx,.sql,application/octet-stream,csv/*,json/*,text/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain";

        input.addEventListener("change", async (e) => {
            const files = (e.target as HTMLInputElement).files;

            if (!files || files.length === 0) return;

            const newSources = await onAddDataSources(
                Array.from(files).map((file) => ({
                    filename: file.name,
                    type: "FILE",
                    entry: file,
                })),
            );

            if (!newSources || newSources.length === 0) return;

            for await (const { handle } of newSources) {
                await db?.registerFileHandle(handle.name, handle);
            }
        });

        input.click();
    }, [db, onAddDataSources]);

    return onAddFiles;
};

/**
 * Manage datasets.
 *
 * @component
 */
function SourcesToolbar() {
    const [showAddDataModal, setShowAddDataModal] = useState<
        "REMOTE" | "PASTE" | "OFF"
    >("OFF");

    const modernPicker = useModernFilePicker();
    const pollfillPicker = usePolfillFilePicker();

    const onAddFiles = useCallback(() => {
        if ("showOpenFilePicker" in window) {
            return modernPicker();
        } else {
            return pollfillPicker();
        }
    }, [modernPicker, pollfillPicker]);

    const onClose = useCallback(() => {
        setShowAddDataModal("OFF");
    }, []);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="xs"
                    >
                        <Plus size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56"
                    // prevent focus going back to the trigger on close.
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DropdownMenuLabel>新增数据源</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={onAddFiles}>
                            本地文件
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setShowAddDataModal("REMOTE")}
                        >
                            远程 URL
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* content dialog */}
            <AddDataModal
                isOpen={showAddDataModal !== "OFF"}
                onOpenChange={onClose}
            >
                {showAddDataModal === "REMOTE" && (
                    <AddRemoteUrl onclose={onClose} />
                )}
                {showAddDataModal === "PASTE" && <AddPasteData />}
            </AddDataModal>
        </>
    );
}

function AddPasteData() {
    return <Textarea placeholder="Paste data here" />;
}

type AddDataModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    children: ReactNode;
};

function AddDataModal(props: AddDataModalProps) {
    const { isOpen, onOpenChange, children } = props;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md lg:max-w-xl">
                {children}
            </DialogContent>
        </Dialog>
    );
}

const addRemoteUrlSchema = z.object({
    name: z.string().min(2),
    url: z.string().url(),
});

function AddRemoteUrl(props: { onclose: () => void }) {
    const { onAddDataSources } = useSession();

    const form = useForm<z.infer<typeof addRemoteUrlSchema>>({
        resolver: zodResolver(addRemoteUrlSchema),
        defaultValues: {
            name: "",
            url: "",
        },
    });

    async function onSubmit(values: z.infer<typeof addRemoteUrlSchema>) {
        // ensure the filename ends with .url
        let filename = values.name;
        if (!filename.endsWith(".url")) {
            filename += ".url";
        }
        const res = await onAddDataSources([
            {
                filename,
                type: "URL",
                entry: values.url,
            },
        ]);

        if (!res || res.length === 0) {
            toast.error("添加远程数据源失败", {
                description: "请重试！",
            });

            return;
        }

        // register the datasource

        props.onclose();
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>添加远程数据源</DialogTitle>
                <DialogDescription>从远程 URL 添加数据源 .</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="common-words"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>数据源名称</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel> URL</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="https://api.datamuse.com/words?ml=sql"
                                        autoCapitalize="off"
                                        autoCorrect="off"
                                        type="url"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    该 API 需要支持跨域资源共享（CORS） .
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center justify-end">
                        <Button type="submit">提交</Button>
                    </div>
                </form>
            </Form>
        </>
    );
}

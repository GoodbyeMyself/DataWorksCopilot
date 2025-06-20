import { PopoverAnchor, PopoverTrigger } from "@radix-ui/react-popover";

import {
    ChevronDown,
    Code,
    Dot,
    FileText,
    FolderPen,
    Loader2,
    PanelLeftOpen,
    Plus,
    Trash2,
} from "lucide-react";

import { useState } from "react";

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

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { Popover, PopoverContent } from "~/components/ui/popover";

import type { CodeEditor } from "~/context/session/types";

import { useSession } from "~/context/session/useSession";

import { cn } from "~/lib/utils";

import { useWrapper } from "./wrapper/context/useWrapper";

export default function EditorSources() {
    const { editors } = useSession();

    const { isCollapsed, ref } = useWrapper();

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
                <div className="flex grow items-center">
                    <Button
                        onClick={onToggle}
                        variant="ghost"
                        className="flex w-full items-center justify-start gap-1 rounded-none hover:bg-transparent"
                    >
                        <ChevronDown
                            className={cn(
                                "size-5",
                                isCollapsed &&
                                    "-rotate-90 transition-transform",
                            )}
                        />
                        <span className="text-sm font-semibold">工作空间</span>
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
                {editors.length === 0 ? (
                    <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <FileText className="size-6" />
                        <p className="text-sm">暂无可编辑的文件</p>
                    </div>
                ) : (
                    editors.map((editor) => (
                        <CodeEditorItem
                            key={editor.path}
                            {...editor}
                        />
                    ))
                )}
            </div>
        </div>
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

    const { onDeleteEditor } = useSession();

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        确定要删除所选 SQL 文件吗 ？
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        此操作无法撤销, 这将永久删除该 SQL 文件
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => await onDeleteEditor(path)}
                    >
                        确认
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function CodeEditorItem(editor: CodeEditor) {
    const [isEditing, setIsEditing] = useState(false);

    const { dispatch } = useSession();
    const [showDelete, setShowDelete] = useState(false);

    const onOpenFile = () => {
        if (!dispatch) return;

        if (!editor) {
            toast.error("Editor not found");
            return;
        }
        dispatch({
            type: "FOCUS_EDITOR",
            payload: editor,
        });
    };

    const { isFocused } = editor;

    return (
        <>
            <ContextMenu key={editor.path}>
                <ContextMenuTrigger className="w-full data-[state=open]:bg-gray-100 data-[state=open]:dark:bg-gray-900">
                    <Button
                        className={cn(
                            "flex h-6 w-full items-center justify-between gap-2 overflow-hidden p-2",
                            isFocused && "bg-secondary",
                        )}
                        variant="ghost"
                        onClick={onOpenFile}
                    >
                        <div className="inline-flex items-center gap-1">
                            <Code
                                className={cn(
                                    "mr-0.5 size-4 shrink-0",
                                    editor.isDirty &&
                                        "text-orange-500 dark:text-yellow-500",
                                )}
                            />

                            <span
                                className={cn(
                                    "max-w-[150px] overflow-hidden truncate text-ellipsis whitespace-nowrap font-normal",
                                    editor.isDirty &&
                                        "text-orange-500 dark:text-yellow-500",
                                )}
                                title={editor.path}
                            >
                                {editor.path}
                            </span>
                        </div>

                        {editor.isDirty && (
                            <Dot
                                className={cn(
                                    "size-8 text-orange-500 dark:text-yellow-500",
                                )}
                            />
                        )}
                    </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-32">
                    <ContextMenuItem
                        inset
                        onSelect={() => onOpenFile()}
                    >
                        <PanelLeftOpen size={16} />
                        <span className="ml-2">打开</span>
                    </ContextMenuItem>
                    <ContextMenuItem
                        onSelect={() => setIsEditing(true)}
                        inset
                    >
                        <FolderPen size={16} />
                        <span className="ml-2">重命名</span>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onSelect={() => setShowDelete(true)}
                        inset
                    >
                        <Trash2 size={16} />
                        <span className="ml-2">删除</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <RenamePopover
                filename={editor.path}
                isOpen={isEditing}
                onOpenChange={(open) => setIsEditing(open)}
            >
                <span />
            </RenamePopover>

            <DeleteEditorModal
                isOpen={showDelete}
                onOpenChange={(open) => setShowDelete(open)}
                path={editor.path}
            />
        </>
    );
}

type RenamePopoverProps = {
    filename: string;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const filenameSchema = z.string().endsWith(".sql");

function RenamePopover(props: RenamePopoverProps) {
    const { filename, children, isOpen, onOpenChange } = props;
    const [isLoading, setIsLoading] = useState(false);

    const { onRenameEditor } = useSession();

    const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const newName = formData.get("file") as string;

        const validation = filenameSchema.safeParse(newName);
        if (!validation.success) {
            toast.error("文件名变更失败", {
                description: "文件名必须以 .sql 结尾",
            });
            setIsLoading(false);
            return;
        }

        try {
            await onRenameEditor(filename, newName);
            toast.success("文件名变更成功", {
                description: `文件名从 ${filename} 变更到 ${newName}`,
            });
            onOpenChange(false);
        } catch (e) {
            toast.error("重命名文件失败");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Popover
            open={isOpen}
            onOpenChange={onOpenChange}
            modal
        >
            <PopoverAnchor asChild>
                <PopoverTrigger>{children}</PopoverTrigger>
            </PopoverAnchor>
            <PopoverContent className="w-80">
                <form
                    method="post"
                    onSubmit={onSubmitHandler}
                    id="rename-form"
                >
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">重命名</h4>
                            <p className="text-sm text-muted-foreground">
                                包含文件扩展名.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    form="rename-form"
                                    htmlFor="file"
                                >
                                    文件名
                                </Label>
                                <Input
                                    id="file"
                                    name="file"
                                    defaultValue={filename}
                                    className="col-span-3 h-8"
                                    form="rename-form"
                                />
                            </div>
                        </div>
                        <Button
                            form="rename-form"
                            size="sm"
                            type="submit"
                            disabled={isLoading}
                        >
                            保存变更
                            {isLoading && (
                                <Loader2
                                    size={16}
                                    className="ml-2 animate-spin"
                                />
                            )}
                        </Button>
                    </div>
                </form>
            </PopoverContent>
        </Popover>
    );
}

/**
 * Manage datasets.
 *
 * #TODO: remote sources.
 *
 * @component
 */
function SourcesToolbar() {
    const { onAddEditor } = useSession();

    return (
        <>
            <Button
                size="xs"
                variant="ghost"
                onClick={onAddEditor}
            >
                <Plus size={16} />
            </Button>
        </>
    );
}

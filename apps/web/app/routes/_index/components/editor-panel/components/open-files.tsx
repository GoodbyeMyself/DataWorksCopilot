import { Code2, X } from "lucide-react";
import { useSession } from "~/context/session/useSession";
import { cn } from "~/lib/utils";

export default function OpenFileTabs() {
    const { editors, dispatch, onCloseEditor } = useSession();

    const onOpenEditor = (path: string) => {
        if (!dispatch) return;

        dispatch({
            type: "FOCUS_EDITOR",
            payload: {
                path,
            },
        });
    };

    return (
        <div className="flex max-h-9 min-h-9 flex-row justify-between overflow-hidden overflow-x-auto bg-[#f3f3f3] dark:bg-background">
            <div className="flex size-full items-center">
                {editors
                    .filter((editor) => editor.isOpen)
                    .map((editor) => {
                        const isCurrent = editor.isFocused;

                        return (
                            <button
                                type="button"
                                className={cn(
                                    "flex h-full cursor-pointer flex-row flex-nowrap items-center gap-1 rounded-none border-x border-t border-t-transparent bg-[#ececec] pl-2 text-[#3d3d3d] first:border-l-0 hover:bg-[#d9d9d9] dark:bg-background dark:text-foreground dark:hover:bg-[#1f1f1f]",
                                    isCurrent &&
                                        "border-t-0 bg-white text-[#3d3d3d] hover:bg-background dark:border-t dark:border-t-blue-600 dark:bg-[#1e1e1e] dark:text-secondary-foreground dark:hover:bg-[#1e1e1e] ",
                                )}
                                data-current={isCurrent || undefined}
                                key={editor.path}
                                onClick={() => onOpenEditor(editor.path)}
                            >
                                <Code2 className="mr-1 size-4" />
                                <span
                                    className="max-w-[120px] truncate text-sm"
                                    title={editor.path}
                                >
                                    {editor.path}
                                </span>

                                <div
                                    role="button"
                                    tabIndex={0}
                                    title="关闭文件"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseEditor(editor.path);
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            onCloseEditor(editor.path);
                                        }
                                    }}
                                    className={cn(
                                        "flex h-full items-center bg-inherit px-2 hover:bg-gray-200 dark:hover:bg-gray-200/10",
                                        isCurrent &&
                                            "hover:bg-secondary dark:hover:bg-muted-foreground/10",
                                    )}
                                >
                                    <X
                                        className="size-4"
                                        type="close"
                                    />
                                </div>
                            </button>
                        );
                    })}
                {/* 按钮区域 */}
                <div className="ml-auto flex h-full items-center">
                    {/* <AddNewFileButton /> */}
                </div>
            </div>
        </div>
    );
}

// function AddNewFileButton() {
//     const { onAddEditor } = useSession();

//     return (
//         <button
//             onClick={onAddEditor}
//             title="添加新文件"
//             className="flex h-9 w-12 items-center justify-center rounded-none hover:bg-secondary dark:hover:bg-gray-200/10"
//             type="button"
//         >
//             <Plus className="size-5" />
//         </button>
//     );
// }

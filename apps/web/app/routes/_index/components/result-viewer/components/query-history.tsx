import { motion } from "framer-motion";
import { del, get } from "idb-keyval";
import { ChevronRight, CopyCheck, History } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { IDB_KEYS } from "~/constants.client";
import { useQuery } from "~/context/query/useQuery";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";
import { queryMetaSchema, type QueryMeta } from "~/types/query";
/**
 * Note: idb-keyval is probably the wrong tool for anything more advanced than this.
 * Would be better to avoid keyval and use a proper indexeddb schema.
 */

const onGetStoredQueries = async (): Promise<QueryMeta[]> => {
    // get stored queries from indexeddb
    const stored = await get(IDB_KEYS.QUERY_HISTORY);

    if (!stored) return [];

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            const validated = z.array(queryMetaSchema).safeParse(parsed);
            if (validated.success) {
                return validated.data;
            }
        } catch (e) {
            console.error("Failed to parse query history", e);
        }
    }
    return [];
};

export default function QueryHistory() {
    const [runs, setRuns] = useState<QueryMeta[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const { meta } = useQuery();
    const uniqueId = `${meta?.hash}_${meta?.created}`;

    useEffect(() => {
        let ignore = false;

        const refresh = async () => {
            const stored = await onGetStoredQueries();
            if (ignore) return;
            setRuns(stored);
        };

        refresh();

        return () => {
            ignore = true;
        };
    }, [uniqueId]);

    const onClearHistory = async () => {
        await del(IDB_KEYS.QUERY_HISTORY);
        setRuns([]);
        setShowClearConfirm(false);
    };

    return (
        <div className="flex h-[calc(100%-48px)] flex-col">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background p-2">
                <div className="flex grow">
                    <span className="text-sm font-semibold"></span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setShowClearConfirm(true)}
                        disabled={runs.length === 0}
                    >
                        <History size={16} />
                    </Button>
                </div>
            </div>
            {runs.length === 0 && (
                <div className={cn("py-2 pl-6 text-sm text-gray-400")}>
                    暂无运行日志
                </div>
            )}
            <div className="flex-1 overflow-hidden">
                <motion.div
                    className="flex h-full w-full flex-col gap-1 divide-y divide-white/5 overflow-y-auto px-4 py-1 pr-2 transition-all dark:divide-white/5"
                    role="list"
                >
                    {runs.map((run) => {
                        const key = `${run.hash}_${run.created}`;
                        return (
                            <RunHoverCard
                                key={key}
                                {...run}
                            />
                        );
                    })}
                </motion.div>
            </div>

            <AlertDialog
                open={showClearConfirm}
                onOpenChange={setShowClearConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            确定要清空运行记录吗 ？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作无法撤销, 这将永久删除所有运行记录。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={onClearHistory}>
                            确认
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function RunHoverCard(props: QueryMeta) {
    const { isCopied, copyToClipboard } = useCopyToClipboard({
        timeout: 1500,
    });
    const { hash, sql, cacheHit, executionTime, error, status } = props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const formatter = new Intl.NumberFormat("en-UK", {
        maximumFractionDigits: 2,
        compactDisplay: "short",
    });

    const duration = formatter.format(executionTime / 1000);
    return (
        <>
            <motion.li
                layout
                key={hash}
                className={cn(
                    "relative mb-2 flex cursor-pointer items-center space-x-4 rounded-md bg-gray-100 px-2 py-4 transition-colors dark:bg-gray-800",
                    error && "bg-yellow-200 dark:bg-yellow-700",
                )}
                onClick={() => setIsDialogOpen(true)}
            >
                <div className="min-w-0 flex-auto">
                    <div className="flex items-center gap-x-3">
                        <div
                            className={cn(
                                "flex-none rounded-full p-1",
                                status === "SUCCESS" && "bg-green-500",
                                status === "ERROR" && "bg-yellow-500",
                            )}
                        >
                            <div className="size-2 rounded-full bg-current" />
                        </div>
                        <h2 className="min-w-0 text-sm font-semibold leading-6 dark:text-white">
                            <span className="truncate">
                                {error ? "Error" : "Success"}
                            </span>
                            <span className="px-1 text-gray-400"> / </span>
                            <span className="whitespace-nowrap">
                                {duration}s
                            </span>
                            <span className="absolute inset-0" />
                        </h2>
                        <Badge
                            variant="outline"
                            color={cacheHit ? "green" : "blue"}
                        >
                            {/* "live" 表示这是一个实时查询的结果，而不是从缓存中获取的结果。
                             当查询是实时执行时，会显示绿色的样式；当查询结果来自缓存时，会显示橙色的样式。 */}
                            {cacheHit ? "CACHE" : "LIVE"}
                        </Badge>
                    </div>
                    {error && (
                        <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                            <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700 dark:text-gray-100">
                                {error}
                            </span>
                        </div>
                    )}
                    <div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
                        <span className="line-clamp-3 truncate text-wrap break-words text-left font-mono text-xs text-gray-700 dark:text-gray-100">
                            {sql}
                        </span>
                        {isCopied && (
                            <div className="absolute inset-y-1 right-1">
                                <CopyCheck
                                    className="bg-transparent text-green-700"
                                    size={18}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <ChevronRight
                    className="size-5 flex-none text-gray-400"
                    aria-hidden="true"
                />
            </motion.li>

            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>查询详情</DialogTitle>
                        <DialogDescription>
                            查看查询的详细信息，包括 SQL
                            语句和错误信息（如果有）。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {error && (
                            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm transition-all">
                                <h3 className="text-sm font-semibold text-red-700">
                                    错误信息
                                </h3>
                                <pre className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-red-600 shadow-inner">
                                    {error}
                                </pre>
                            </div>
                        )}
                        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm transition-all">
                            <h3 className="text-sm font-semibold text-gray-700">
                                SQL 语句
                            </h3>
                            <pre className="whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-gray-600 shadow-inner">
                                {sql}
                            </pre>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="default"
                                onClick={() => copyToClipboard(sql)}
                                className="transition-all hover:shadow-md active:scale-95"
                            >
                                {isCopied ? "已复制" : "复制 SQL"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

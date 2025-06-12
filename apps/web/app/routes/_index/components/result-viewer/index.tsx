import { useLocalStorage } from "@uidotdev/usehooks";

import { Loader2 } from "lucide-react";

import { Suspense, lazy } from "react";

import ErrorNotification from "~/components/error";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { PaginationProvider } from "~/context/pagination/provider";

import { useQuery } from "~/context/query/useQuery";

import DatasetActions from "./components/dataset-actions";
import QueryHistory from "./components/query-history";
import QueryLog from "./components/query-log";

const LazyJSONViewer = lazy(() =>
    import("./components/json-viewer").then((module) => ({
        default: module.JSONViewer,
    })),
);

const LazyChartViewer = lazy(() =>
    import("./components/chart").then((module) => ({
        default: module.ChartContainer,
    })),
);

const LazyTableViewer = lazy(() =>
    import("./components/table").then((module) => ({
        default: module.TableViewer,
    })),
);

type ResultView = "table" | "chart" | "json" | "history" | "log" | "error";

const TAB_LABELS = {
    Table: "数据表",
    Chart: "Chart 图表",
    Json: "JSON",
    History: "运行记录",
    Log: "日志",
} as const;

/**
 * Parent container for the results viewer.
 */
export default function ResultsView() {
    const [tab, setTab] = useLocalStorage<ResultView>(
        `results-viewer-tab`,
        `table`,
    );

    const { meta } = useQuery();
    const error = meta?.error;

    return (
        <PaginationProvider>
            <div className="relative size-full max-w-full">
                <Tabs
                    value={tab}
                    onValueChange={(v) => setTab(v as ResultView)}
                    defaultValue="table"
                    className="size-full"
                >
                    <div className="sticky inset-x-0 top-0 z-10 flex w-full justify-between bg-muted">
                        <TabsList>
                            {["Table", "Chart", "Json", "History", "Log"].map(
                                (value) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value.toLowerCase()}
                                        className="text-xs"
                                    >
                                        {
                                            TAB_LABELS[
                                                value as keyof typeof TAB_LABELS
                                            ]
                                        }
                                    </TabsTrigger>
                                ),
                            )}
                            {error && (
                                <TabsTrigger value="error">
                                    <span className="text-xs text-red-500">
                                        Error
                                    </span>
                                </TabsTrigger>
                            )}
                        </TabsList>
                        <div className="inline-flex items-center gap-1">
                            <DatasetActions />
                        </div>
                    </div>
                    <TabsContent
                        value="table"
                        className="h-full flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyTableViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="chart"
                        className="h-full flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyChartViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="json"
                        className="h-full flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <Suspense fallback={<Fallback />}>
                            <LazyJSONViewer />
                        </Suspense>
                    </TabsContent>
                    <TabsContent
                        value="history"
                        className="h-full flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <QueryHistory />
                    </TabsContent>
                    <TabsContent
                        value="log"
                        className="h-[calc(100%-50px)] flex-col border-none p-0 px-2 data-[state=active]:flex"
                    >
                        <QueryLog />
                    </TabsContent>
                    {error && (
                        <TabsContent
                            value="error"
                            className="h-full flex-col border-none p-0 px-2 data-[state=active]:flex"
                        >
                            <div className="w-full px-4 py-4">
                                <div className="mx-auto w-full">
                                    <ErrorNotification
                                        error={error ?? "Unknown error"}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </PaginationProvider>
    );
}

function Fallback() {
    return (
        <span className="m-2">
            <Loader2 className="size-5 animate-spin" />
        </span>
    );
}

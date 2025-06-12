import { useEffect, useRef } from "react";
import { useQuery } from "~/context/query/useQuery";

export default function QueryLog() {
    const { logs, status } = useQuery();

    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-full w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50/50 px-4 pb-8 pt-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div
                ref={logRef}
                className="flex min-h-[200px] flex-col space-y-2 font-mono text-sm"
            >
                {logs?.length === 0 && (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="size-full space-y-3 text-center">
                            <div className="text-gray-300 dark:text-gray-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                暂无查询日志
                            </p>
                        </div>
                    </div>
                )}
                {logs?.map((log: string, index: number) => (
                    <div
                        key={index}
                        className="rounded border border-gray-100 bg-white p-2 shadow-sm transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
                    >
                        <span className="text-gray-600 dark:text-gray-300">
                            {log}
                        </span>
                    </div>
                ))}
                {status === "RUNNING" && (
                    <div className="animate-pulse rounded border border-gray-100 bg-white p-2 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-0"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-150"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-300"></div>
                            <span className="text-gray-500">查询中...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

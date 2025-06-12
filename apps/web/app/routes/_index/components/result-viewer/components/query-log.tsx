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
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 h-full w-full overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div
                ref={logRef}
                className="space-y-2 font-mono text-sm"
            >
                {logs?.map((log: string, index: number) => (
                    <div
                        key={index}
                        className="rounded border border-gray-100 bg-white p-2 shadow-sm transition-colors duration-150 hover:bg-gray-50"
                    >
                        <span className="text-gray-600">{log}</span>
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

import { Table } from "apache-arrow";
import { get, set } from "idb-keyval";
import { useCallback, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { IDB_KEYS } from "~/constants.client";
import { useDB } from "~/context/db/useDB";
import useAbortController from "~/hooks/use-abortable";
import {
    queryMetaSchema,
    type QueryMeta,
    type QueryResponse,
} from "~/types/query";
import { QueryContext } from "./context";
import type { QueryContextValue, QueryState } from "./types";

type QueryProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

type QueryAction =
    | {
          type: "RUN_START";
          payload: {
              sql: string;
          };
      }
    | {
          type: "RUN_STOP";
          payload: QueryResponse;
      }
    | {
          type: "ADD_LOG";
          payload: string;
      };

function queryReducer(state: QueryState, action: QueryAction): QueryState {
    switch (action.type) {
        case "RUN_START": {
            return {
                ...state,
                ...action.payload,
                status: "RUNNING",
                logs: [`开始执行查询: ${action.payload.sql}`],
            };
        }
        case "RUN_STOP": {
            return {
                ...state,
                ...action.payload,
                status: "IDLE",
            };
        }
        case "ADD_LOG": {
            return {
                ...state,
                logs: [...state.logs, action.payload],
            };
        }
        default:
            return { ...state };
    }
}

const initialState: QueryState = {
    sql: "",
    status: "IDLE",
    table: new Table(),
    meta: null,
    count: 0,
    logs: [],
};

async function onStoreRun(payload: QueryResponse) {
    try {
        const newRunValidation = queryMetaSchema.safeParse(payload.meta);
        if (!newRunValidation.success) return;

        const runs: QueryMeta[] = [];

        const history = await get(IDB_KEYS.QUERY_HISTORY);

        if (history) {
            try {
                const parsed = JSON.parse(history);
                const validated = z.array(queryMetaSchema).safeParse(parsed);
                if (validated.success) {
                    runs.push(...validated.data);
                }
            } catch (e) {
                console.error("Failed to parse query history", e);
            }
        }

        // check if the query is already in the history or if the length is greater than 100
        const exists = runs.find(
            (r) =>
                r.hash === newRunValidation.data.hash &&
                r.created === newRunValidation.data.created,
        );
        if (exists) return;

        if (runs.length > 100) {
            runs.pop();
        }

        const newRuns = [{ ...newRunValidation.data }, ...runs];

        await set(IDB_KEYS.QUERY_HISTORY, JSON.stringify(newRuns));
    } catch (e) {
        console.error("Failed to save SQL run: ", e);
    }
}

/**
 * Context for the query results;
 *
 */
function QueryProvider(props: QueryProviderProps) {
    const [state, dispatch] = useReducer(queryReducer, {
        ...initialState,
    });

    // abort controller which we can control imperatively
    const { abortSignal, getSignal } = useAbortController();

    const { db } = useDB();

    const addLog = useCallback((log: string) => {
        dispatch({ type: "ADD_LOG", payload: log });
    }, []);

    const onRunQuery = useCallback(
        async (sql: string) => {
            if (!db) {
                console.error("Run failed: db not ready yet");
                toast.warning("Run failed: db not ready yet");
                return;
            }

            dispatch({ type: "RUN_START", payload: { sql } });
            try {
                const signal = getSignal();
                addLog("正在准备执行查询...");
                const doQuery = db.fetchResults({ query: sql });

                const isCancelledPromise = new Promise((_, reject) => {
                    signal.addEventListener("abort", () => {
                        reject(new DOMException("Aborted", "AbortError"));
                    });
                });

                addLog("开始执行查询...");
                const results = await Promise.race([
                    doQuery,
                    isCancelledPromise,
                ]);
                addLog("查询执行完成");

                const payload = results as QueryResponse;

                // store the query in indexeddb
                await onStoreRun(payload);

                dispatch({
                    type: "RUN_STOP",
                    payload,
                });
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") {
                    addLog("查询已取消");
                    dispatch({ type: "RUN_STOP", payload: initialState });
                    return;
                }
                addLog(
                    `查询执行出错: ${e instanceof Error ? e.message : String(e)}`,
                );
            }
        },
        [db, getSignal, addLog],
    );

    const onCancelQuery = useCallback(
        (reason: string) => {
            abortSignal(reason);
            addLog(`查询已取消: ${reason}`);
            dispatch({
                type: "RUN_STOP",
                payload: {
                    count: 0,
                    table: new Table(),
                    meta: {
                        cacheHit: false,
                        hash: "",
                        created: new Date().toISOString(),
                        error: null,
                        executionTime: 0,
                        sql: "",
                        status: "CANCELLED",
                    },
                },
            });
        },
        [abortSignal, addLog],
    );

    const value: QueryContextValue = useMemo(
        () => ({
            ...state,
            onRunQuery,
            onCancelQuery,
            addLog,
        }),
        [onCancelQuery, onRunQuery, state, addLog],
    );
    return (
        <QueryContext.Provider value={value}>
            {props.children}
        </QueryContext.Provider>
    );
}

export { QueryProvider };

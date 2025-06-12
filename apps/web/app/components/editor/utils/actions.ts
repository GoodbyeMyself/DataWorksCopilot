// https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
import type { Monaco } from "@monaco-editor/react";
import { KeyCode, KeyMod } from "monaco-editor";
import type { ImperativePanelHandle } from "react-resizable-panels";

// 定义所有动作的配置
const editorActions = {
    convertToLowerCase: {
        id: "convert-to-lowercase",
        label: "转换关键字为小写",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1,
    },
    convertToUpperCase: {
        id: "convert-to-uppercase",
        label: "转换关键字为大写",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 2,
    },
    validateSelection: {
        id: "validate-selection",
        label: "validate-selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 3,
    },
    runSelection: {
        id: "run-selection",
        label: "Run Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 4,
    },
    Copolit: {
        id: "Copolit",
        label: "Copolit",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "0_Copolit",
        contextMenuOrder: 1,
    },
    GenerateAnnotations: {
        id: "Generate-annotations",
        label: "生成注释",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS] as number[],
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 1,
    },
    GenerateSQL: {
        id: "Generate-SQL",
        label: "SQL 生成",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 2,
    },
    SQLErrorCorrection: {
        id: "SQL-Error-Correction",
        label: "SQL 纠错",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 3,
    },
    SQLRewriting: {
        id: "SQL-Rewriting",
        label: "SQL 改写",
        contextMenuGroupId: "1_Copolit",
        contextMenuOrder: 4,
    },
} as const;

// 添加静态标志来跟踪是否已经注册过
let isRegistered = false;

// 集中处理所有动作的函数
export function registerEditorActions(
    monaco: Monaco,
    options: {
        onRunQuery?: (value: string) => Promise<void>;
        copolitRef?: React.RefObject<ImperativePanelHandle>;
    } = {},
) {
    // 如果已经注册过，直接返回
    if (isRegistered) return;

    const { onRunQuery, copolitRef } = options;

    // 验证选择
    if (onRunQuery) {
        monaco.editor.addEditorAction({
            ...editorActions.validateSelection,
            run: async (editor) => {
                const selection = editor.getSelection();
                const value =
                    selection?.isEmpty() || selection == null
                        ? editor.getValue()
                        : editor.getModel()?.getValueInRange(selection);
                if (!value) return;
                await onRunQuery(value);
            },
        });

        // 运行选择
        monaco.editor.addEditorAction({
            ...editorActions.runSelection,
            run: (editor) => {
                const selection = editor.getSelection();
                const value =
                    selection?.isEmpty() || selection == null
                        ? editor.getValue()
                        : editor.getModel()?.getValueInRange(selection);
                if (!value) return;
                onRunQuery(value ?? "");
            },
        });
    }

    // 转换关键字为小写
    monaco.editor.addEditorAction({
        ...editorActions.convertToLowerCase,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;
            const value = editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            editor.executeEdits("", [
                {
                    range: selection,
                    text: value.toLowerCase(),
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // 转换关键字为大写
    monaco.editor.addEditorAction({
        ...editorActions.convertToUpperCase,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;
            const value = editor.getModel()?.getValueInRange(selection);
            if (!value) return;
            editor.executeEdits("", [
                {
                    range: selection,
                    text: value.toUpperCase(),
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // Copolit
    if (copolitRef) {
        monaco.editor.addEditorAction({
            ...editorActions.Copolit,
            run: (editor) => {
                const selection = editor.getSelection();
                const selectedText =
                    selection?.isEmpty() || selection == null
                        ? editor.getValue()
                        : editor.getModel()?.getValueInRange(selection);

                if (copolitRef?.current?.isCollapsed()) {
                    copolitRef.current?.expand();
                    copolitRef.current?.resize(20);
                }

                // 触发自定义事件，传递选中的文本
                const event = new CustomEvent("copolit-text-selected", {
                    detail: { text: selectedText },
                });
                window.dispatchEvent(event);
            },
        });
    }

    // 生成注释
    monaco.editor.addEditorAction({
        ...editorActions.GenerateAnnotations,
        run: (editor) => {
            const selection = editor.getSelection();
            if (!selection || selection.isEmpty()) return;

            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (!selectedText) return;

            // 生成随机注释
            const randomComment = generateRandomComment();

            // 在选中文本前插入注释
            const commentText = `-- ${randomComment}\n${selectedText}`;

            editor.executeEdits("", [
                {
                    range: selection,
                    text: commentText,
                    forceMoveMarkers: true,
                },
            ]);
        },
    });

    // SQL 生成
    monaco.editor.addEditorAction({
        ...editorActions.GenerateSQL,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "generate-sql" },
            });
            window.dispatchEvent(event);
        },
    });

    // SQL 纠错
    monaco.editor.addEditorAction({
        ...editorActions.SQLErrorCorrection,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "sql-error-correction" },
            });
            window.dispatchEvent(event);
        },
    });

    // SQL 改写
    monaco.editor.addEditorAction({
        ...editorActions.SQLRewriting,
        run: (editor) => {
            const selection = editor.getSelection();
            const selectedText =
                selection?.isEmpty() || selection == null
                    ? editor.getValue()
                    : editor.getModel()?.getValueInRange(selection);

            if (copolitRef?.current?.isCollapsed()) {
                copolitRef.current?.expand();
                copolitRef.current?.resize(20);
            }

            const event = new CustomEvent("copolit-text-selected", {
                detail: { text: selectedText, action: "sql-rewriting" },
            });
            window.dispatchEvent(event);
        },
    });

    // 在函数结束时设置标志
    isRegistered = true;
}

// 添加生成随机注释的辅助函数
function generateRandomComment(): string {
    const commentTemplates = [
        "查询用户信息",
        "统计订单数据",
        "计算销售总额",
        "获取最近30天数据",
        "更新用户状态",
        "删除过期记录",
        "插入新用户数据",
        "修改商品价格",
        "导出报表数据",
        "备份重要信息",
        "清理临时数据",
        "同步用户信息",
        "验证数据完整性",
        "优化查询性能",
        "修复数据异常",
        "生成月度报表",
        "检查数据一致性",
        "更新系统配置",
        "处理业务逻辑",
        "执行数据迁移",
    ];

    const prefixes = [
        "功能：",
        "用途：",
        "说明：",
        "描述：",
        "作用：",
        "目标：",
        "任务：",
        "操作：",
        "处理：",
        "执行：",
    ];

    const suffixes = [
        " - 自动生成",
        " - 系统处理",
        " - 定时任务",
        " - 数据维护",
        " - 业务处理",
        " - 数据更新",
        " - 系统操作",
        " - 数据同步",
        " - 信息处理",
        " - 数据整理",
    ];

    const template =
        commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix}${template}${suffix}`;
}

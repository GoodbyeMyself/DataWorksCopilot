import { useEffect, useState } from "react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { Button } from "~/components/ui/button";
// icon
import { History, Plus, Send, X } from "lucide-react";

type Message = {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
};

type CopolitpanelProps = {
    isCollapsed: boolean;
    copolitRef?: React.RefObject<ImperativePanelHandle>;
};

/**
 * Left hand side panel which holds the data sources, editor sources and query history.
 *
 * NB: This panel controls the vertical resizing *within* the sidepanel.
 * The horizontal resizing between the side panel and the editor panel is in the parent panel.
 */
export default function Sidepanel(props: CopolitpanelProps) {
    const { isCollapsed, copolitRef } = props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        const handleTextSelected = (event: CustomEvent<{ text: string }>) => {
            setInputText(event.detail.text);
        };

        window.addEventListener(
            "copolit-text-selected",
            handleTextSelected as EventListener,
        );

        return () => {
            window.removeEventListener(
                "copolit-text-selected",
                handleTextSelected as EventListener,
            );
        };
    }, []);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputText,
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");
    };

    if (isCollapsed) return null;

    return (
        <div className="flex h-full flex-col border-r bg-muted/50">
            <div className="flex items-center justify-end border-b p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                        copolitRef?.current?.collapse();
                    }}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex items-center justify-between border-b p-2">
                <span className="text-sm font-medium">DataWorks Copilot</span>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                            setMessages([]);
                        }}
                    >
                        <Plus size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                            console.log(111, "<- 会话列表");
                        }}
                    >
                        <History size={16} />
                    </Button>
                </div>
            </div>

            {/* 对话列表区域或欢迎界面 */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        {/* DataWorks Copilot 标志占位符 */}
                        <div className="mb-4">
                            <div
                                className="flex h-24 w-24 items-center justify-center rounded-full"
                                style={{
                                    background:
                                        "linear-gradient(to right, #4CAF50, #8BC34A)",
                                }}
                            >
                                <span className="text-lg font-bold text-white">
                                    C
                                </span>
                            </div>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold">
                            DataWorks Copilot
                        </h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            DataWorks
                            Copilot是DataWorks的智能助手，能够通过自然语言快速完成多种代码和DataWorks产品操作，它可以辅助您轻松、高效地完成数据ETL和分析工作，节省大量时间和精力。
                        </p>
                        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="justify-start text-sm"
                            >
                                / 代码生成
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-sm"
                            >
                                / 代码解释
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-sm"
                            >
                                / 代码问答
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start text-sm"
                            >
                                / 快捷找表
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 输入框区域 */}
            <div className="border-t p-2">
                <div className="flex flex-col gap-2">
                    <textarea
                        className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-md border bg-background p-2"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="“@”添加表，“/”选择意图"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                className="h-8 px-3 py-1 text-xs"
                            >
                                <Plus
                                    size={12}
                                    className="mr-1"
                                />{" "}
                                添加上下文
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-8 px-3 py-1 text-xs"
                            >
                                默认模型 <span className="ml-1">▾</span>
                            </Button>
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputText.trim()}
                            className="h-8 px-4 py-1 text-xs"
                        >
                            发送 <Send className="ml-2 h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import {
    type ImperativePanelHandle,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
// icon
import {
    GripVertical,
    History,
    LoaderPinwheel,
    Plus,
    Send,
    X,
} from "lucide-react";

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
            const newText = event.detail.text;
            const inputElement = document.querySelector(
                '[contenteditable="true"]',
            );
            if (inputElement) {
                const currentText = inputElement.textContent || "";
                inputElement.textContent = currentText
                    ? `${currentText}\n${newText}`
                    : newText;
                setInputText(inputElement.textContent);
            }
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
                            setInputText("");
                            const inputElement = document.querySelector(
                                '[contenteditable="true"]',
                            );
                            if (inputElement) {
                                inputElement.textContent = "";
                            }
                        }}
                        title="新建会话"
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
                        title="会话列表"
                    >
                        <History size={16} />
                    </Button>
                </div>
            </div>
            <PanelGroup
                direction="vertical"
                className="flex-1"
            >
                <Panel
                    defaultSize={80}
                    minSize={40}
                >
                    <div className="h-full overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                {/* DataWorks Copilot 标志占位符 */}
                                <div className="mb-2">
                                    <div
                                        className="flex h-16 w-16 items-center justify-center rounded-full"
                                        style={{
                                            background:
                                                "linear-gradient(to right, #4CAF50, #8BC34A)",
                                        }}
                                    >
                                        <span className="text-base font-bold text-white">
                                            D
                                        </span>
                                    </div>
                                </div>
                                <h2 className="mb-8 text-xl font-semibold">
                                    DataWorks Copilot
                                </h2>
                                <p className="mb-6 text-sm text-muted-foreground">
                                    DataWorks Copilot 智能助手,
                                    能够通过自然语言快速完成多种代码和DataWorks产品操作,
                                    它可以辅助您轻松、高效地完成数据 ETL 和
                                    分析工作， 节省大量时间和精力。
                                </p>
                                <div className="flex flex-col items-center gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-auto text-xs"
                                    >
                                        / SQL生成
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-auto text-xs"
                                    >
                                        / SQL注释
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-auto text-xs"
                                    >
                                        / SQL纠错
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-auto text-xs"
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
                </Panel>

                <PanelResizeHandle
                    className={cn(
                        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
                    )}
                >
                    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
                        <GripVertical className="size-2.5" />
                    </div>
                </PanelResizeHandle>
                <Panel
                    defaultSize={20}
                    minSize={20}
                >
                    <div className="h-full border-t bg-muted/90 p-2">
                        <div className="flex h-full flex-col">
                            <div className="min-h-0 flex-1">
                                <div
                                    contentEditable
                                    role="textbox"
                                    aria-multiline="true"
                                    aria-label="消息输入框"
                                    tabIndex={0}
                                    className="h-full w-full resize-none overflow-y-auto rounded-md border bg-background/90 p-2 text-xs leading-6 tracking-wide outline-none transition-colors empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] hover:bg-background focus:bg-background"
                                    data-placeholder='"@"添加表，"/"选择意图'
                                    onInput={(e) =>
                                        setInputText(
                                            e.currentTarget.textContent || "",
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between">
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
                                        <LoaderPinwheel className="mr-1 h-4 w-4 text-blue-500" />
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
                </Panel>
            </PanelGroup>
        </div>
    );
}

import { type ImperativePanelHandle } from "react-resizable-panels";

import { Button } from "~/components/ui/button";
// icon
import { History, Plus, X } from "lucide-react";

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
                            console.log(111, "<- 新增会话");
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
            <div className="flex-1 p-4">xxxx</div>
        </div>
    );
}

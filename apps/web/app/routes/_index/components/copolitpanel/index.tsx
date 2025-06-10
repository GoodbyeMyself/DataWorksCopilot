import { X } from "lucide-react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { Button } from "~/components/ui/button";

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
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-2">
                <span className="text-sm font-medium">Copolit</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                        copolitRef?.current?.collapse();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 p-4">xxxx</div>
        </div>
    );
}

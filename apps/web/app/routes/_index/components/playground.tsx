import { useRef, useState } from "react";

import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from "react-resizable-panels";

import PanelHandle from "~/components/panel-handle";

import { FolderClosed, FolderOpen } from "lucide-react";

import ModeToggle from "~/components/theme-toggle";

import { Button } from "~/components/ui/button";

import { useFileDrop } from "~/context/session/hooks/useAddFile.tsx";

import { cn } from "~/lib/utils";

import Copolitpanel from "./copolitpanel";
import EditorPanel from "./editor-panel";
import Sidepanel from "./sidepanel";

// 关于弹窗
// import AboutModal from "./about";

export default function Playground() {
    // 工作空间 区域
    const sidepanelRef = useRef<ImperativePanelHandle>(null);

    // copolit 区域
    const copolitRef = useRef<ImperativePanelHandle>(null);

    const {
        isDragActive,
        ref,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onFileDrop,
    } = useFileDrop();

    const [explorerIsOpen, setExplorerIsOpen] = useState(false);

    const [copolitIsOpen, setCopolitIsOpen] = useState(false);

    return (
        <div
            onDrop={onFileDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            ref={ref}
            className={cn(
                "flex size-full bg-inherit",
                isDragActive &&
                    "bg-gray-100 transition-colors duration-200 ease-in-out dark:bg-gray-800",
            )}
        >
            <div className="flex h-full w-14 flex-col border-r bg-background">
                <Button
                    variant="ghost"
                    className="h-9 rounded-none border-b"
                    onClick={() => {
                        if (sidepanelRef.current?.isCollapsed()) {
                            sidepanelRef.current?.expand();
                            sidepanelRef.current?.resize(20);
                        } else {
                            sidepanelRef.current?.collapse();
                        }
                    }}
                >
                    {explorerIsOpen ? (
                        <FolderOpen size={16} />
                    ) : (
                        <FolderClosed size={16} />
                    )}
                </Button>
                {/* 底部按钮区域 */}
                <SidebarLinks />
            </div>

            <PanelGroup
                className="h-[calc(100vh-64px)] rounded-none"
                direction="horizontal"
                autoSaveId="_desktop-layout-panel-group"
            >
                <Panel
                    collapsedSize={0}
                    collapsible
                    defaultSize={18}
                    minSize={18}
                    className="max-h-full"
                    onCollapse={() => setExplorerIsOpen(false)}
                    onExpand={() => setExplorerIsOpen(true)}
                    ref={sidepanelRef}
                >
                    <Sidepanel isCollapsed={!explorerIsOpen} />
                </Panel>
                <PanelHandle />
                <Panel
                    minSize={15}
                    className="h-full max-h-full max-w-full"
                >
                    <EditorPanel copolitRef={copolitRef} />
                </Panel>
                {copolitIsOpen && <PanelHandle />}
                <Panel
                    collapsedSize={0}
                    collapsible
                    defaultSize={0}
                    minSize={0}
                    className="max-h-full"
                    onCollapse={() => setCopolitIsOpen(false)}
                    onExpand={() => setCopolitIsOpen(true)}
                    ref={copolitRef}
                >
                    {/* Copolit chat 区域 */}
                    <Copolitpanel
                        isCollapsed={!copolitIsOpen}
                        copolitRef={copolitRef}
                    ></Copolitpanel>
                </Panel>
            </PanelGroup>
        </div>
    );
}

/**
 * Links at the bottom of the sidebar.
 */
function SidebarLinks() {
    return (
        <div className="flex h-full flex-col items-center justify-end gap-2 pb-6">
            <ModeToggle />
            {/* <AboutModal /> */}
        </div>
    );
}

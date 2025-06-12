import { Panel, type PanelProps } from "react-resizable-panels";
import { cn } from "~/lib/utils";
import { WrapperProvider } from "./context/provider";
import type { WrapperState } from "./context/types";
import { useWrapper } from "./context/useWrapper";

type WrapperStateProps = Pick<WrapperState, "id" | "order">;

type ComponentWrapperProps = PanelProps & {
    children: React.ReactNode;
};

export default function ComponentWrapper(
    props: ComponentWrapperProps & {
        wrapperState: WrapperStateProps;
    },
) {
    const { children, wrapperState, ...rest } = props;
    return (
        <WrapperProvider {...wrapperState}>
            <Content {...rest}>{children}</Content>
        </WrapperProvider>
    );
}

/**
 * A wrapper component for the sidepanel components.
 *
 * OnCollapase occurs when the panel is resized to below the collapsedSize.
 * We also want to be able to opena and close the panel using our own chevron button in the header.
 * This is achieved by using the imperative api of the Panel component.
 * It is a bit confusing (see [docs](https://github.com/bvaughn/react-resizable-panels/issues/284)).
 *
 */
function Content(props: ComponentWrapperProps) {
    const { ref, id, order, onToggleIsCollapse } = useWrapper();
    const { children, ...rest } = props;

    return (
        <Panel
            // 面板的唯一标识符
            id={id}
            // 面板的排序位置
            order={order}
            minSize={20}
            // 折叠时的尺寸
            collapsedSize={4.6}
            // 最大尺寸限制。注意：如果不设置这个值，当中间面板和底部面板都折叠时，中间面板可能会进入一个无法通过命令展开的异常状态。
            maxSize={70}
            // 命令式 API 引用，用于直接控制面板：https://react-resizable-panels.vercel.app/examples/imperative-panel-api
            ref={ref}
            // 允许面板折叠
            collapsible
            // 折叠时的回调函数
            onCollapse={() => onToggleIsCollapse(true)}
            // 展开时的回调函数
            onExpand={() => onToggleIsCollapse(false)}
            // 合并自定义类名，确保面板高度不超过容器
            className={cn("max-h-full", props.className)}
            // 传递其他属性
            {...rest}
        >
            {/* 根据文档说明：面板默认会裁剪其内容，以避免在调整大小时显示滚动条。不过，面板内的内容仍然可以配置为允许溢出。 */}
            <div className="max-h-full overflow-y-auto">{children}</div>
        </Panel>
    );
}

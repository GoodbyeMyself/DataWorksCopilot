import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from "dockview";
import { useState } from "react";
import { Theme, useTheme } from "remix-themes";
import { cn } from "~/lib/utils";

const components = {
  default: (props: IDockviewPanelProps<{ title: string }>) => {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        {props.params.title}
      </div>
    );
  },
};

function DockView() {
  const [theme] = useTheme();
  const [api, setApi] = useState<DockviewApi | null>(null);

  const onReady = (event: DockviewReadyEvent) => {
    const panel = event.api.addPanel({
      id: "panel_1",
      component: "default",
      params: {
        title: "Panel 1",
      },
    });

    panel.group.locked = true;
    panel.group.header.hidden = true;

    event.api.addPanel({
      id: "panel_2",
      component: "default",
      params: {
        title: "Panel 2",
      },
    });

    event.api.addPanel({
      id: "panel_3",
      component: "default",
      params: {
        title: "Panel 3",
      },
    });

    event.api.addPanel({
      id: "panel_4",
      component: "default",
      params: {
        title: "Panel 4",
      },
      position: { referencePanel: "panel_1", direction: "right" },
    });

    const panel5 = event.api.addPanel({
      id: "panel_5",
      component: "default",
      params: {
        title: "Panel 5",
      },
      position: { referencePanel: "panel_3", direction: "right" },
    });

    // panel5.group!.model.header.hidden = true;
    // panel5.group!.model.locked = true;

    event.api.addPanel({
      id: "panel_6",
      component: "default",
      params: {
        title: "Panel 6",
      },
      position: { referencePanel: "panel_5", direction: "below" },
    });

    event.api.addPanel({
      id: "panel_7",
      component: "default",
      params: {
        title: "Panel 7",
      },
      position: { referencePanel: "panel_6", direction: "right" },
    });
  };

  return (
    <DockviewReact
      components={components}
      onReady={onReady}
      className={cn(
        theme === Theme.DARK ? "dockview-theme-dark" : "dockview-theme-light",
      )}
    />
  );
}

export default function Container() {
  return <DockView />;
}

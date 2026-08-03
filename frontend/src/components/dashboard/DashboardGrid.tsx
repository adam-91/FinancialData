import { useState, useEffect, useRef } from "react";
import { Responsive, Layout } from "react-grid-layout";
import { getCompactor } from "react-grid-layout";
import styled from "styled-components";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const GridContainer = styled.div`
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top, width, height;
  }

  .react-grid-item.cssTransforms {
    transition-property: transform, width, height;
  }

  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-placeholder {
    background: ${({ theme }) => theme.colors.accent};
    opacity: 0.2;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    transition-duration: 100ms;
    z-index: 2;
    user-select: none;
  }

  .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    background-position: bottom right;
    padding: 0 3px 3px 0;

    &::after {
      content: "";
      position: absolute;
      right: 3px;
      bottom: 3px;
      width: 6px;
      height: 6px;
      border-right: 2px solid ${({ theme }) => theme.colors.text.muted};
      border-bottom: 2px solid ${({ theme }) => theme.colors.text.muted};
      opacity: 0.4;
    }
  }
`;

const STORAGE_KEY = "dashboard-layout";

const defaultLayouts = {
  lg: [
    { i: "indexChart", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "currencyChart", x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "indexTable", x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "currencyTable", x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "stockChart", x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
    { i: "stockTable", x: 6, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
  ],
  md: [
    { i: "indexChart", x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "currencyChart", x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "indexTable", x: 0, y: 8, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "currencyTable", x: 0, y: 12, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "stockChart", x: 0, y: 16, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "stockTable", x: 0, y: 20, w: 12, h: 4, minW: 6, minH: 3 },
  ],
  sm: [
    { i: "indexChart", x: 0, y: 0, w: 12, h: 4, minW: 12, minH: 3 },
    { i: "currencyChart", x: 0, y: 4, w: 12, h: 4, minW: 12, minH: 3 },
    { i: "indexTable", x: 0, y: 8, w: 12, h: 4, minW: 12, minH: 3 },
    { i: "currencyTable", x: 0, y: 12, w: 12, h: 4, minW: 12, minH: 3 },
    { i: "stockChart", x: 0, y: 16, w: 12, h: 4, minW: 12, minH: 3 },
    { i: "stockTable", x: 0, y: 20, w: 12, h: 4, minW: 12, minH: 3 },
  ],
};

function loadLayouts(): { [key: string]: Layout[] } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultLayouts;
}

interface DashboardGridProps {
  children: { [key: string]: React.ReactNode };
}

export function DashboardGrid({ children }: DashboardGridProps) {
  const [layouts, setLayouts] = useState(loadLayouts);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    setWidth(containerRef.current.offsetWidth);
    return () => observer.disconnect();
  }, []);

  const handleLayoutChange = (_layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts);
  };

  return (
    <GridContainer ref={containerRef}>
      <Responsive
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        dragConfig={{ cancel: "select, button, input, .no-drag" }}
        onLayoutChange={handleLayoutChange}
        compactor={getCompactor("vertical")}
        useCSSTransforms
        width={width}
      >
        {Object.entries(children).map(([key, child]) => (
          <div key={key}>{child}</div>
        ))}
      </Responsive>
    </GridContainer>
  );
}

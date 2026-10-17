import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface WorkspaceScrollbarsProps {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  showRuler: boolean;
}

export const WorkspaceScrollbars: React.FC<WorkspaceScrollbarsProps> = ({
  workspaceRef,
  showRuler,
}) => {
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
  });

  const isDraggingH = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const isDraggingV = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  const updateMetrics = useCallback(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    setScrollMetrics({
      scrollLeft: ws.scrollLeft,
      scrollTop: ws.scrollTop,
      scrollWidth: ws.scrollWidth,
      scrollHeight: ws.scrollHeight,
      clientWidth: ws.clientWidth,
      clientHeight: ws.clientHeight,
    });
  }, [workspaceRef]);

  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;

    updateMetrics();
    ws.addEventListener('scroll', updateMetrics, { passive: true });
    window.addEventListener('resize', updateMetrics);

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateMetrics) : null;
    if (ro) ro.observe(ws);

    return () => {
      ws.removeEventListener('scroll', updateMetrics);
      window.removeEventListener('resize', updateMetrics);
      if (ro) ro.disconnect();
    };
  }, [workspaceRef, updateMetrics]);

  // Horizontal Scroll calculation
  const { scrollLeft, scrollWidth, clientWidth } = scrollMetrics;
  const hCanScroll = scrollWidth > clientWidth + 2;
  const hRatio = scrollWidth > 0 ? clientWidth / scrollWidth : 1;
  const hThumbWidth = Math.max(36, Math.min(clientWidth * hRatio, clientWidth - 60));
  // In RTL, scrollLeft can be 0 or negative/positive depending on browser; normalize
  const maxScrollLeft = Math.max(1, scrollWidth - clientWidth);
  const normalizedScrollLeft = Math.abs(scrollLeft);
  const hThumbLeft = maxScrollLeft > 0 
    ? (normalizedScrollLeft / maxScrollLeft) * (Math.max(1, clientWidth - hThumbWidth - 60))
    : 0;

  // Vertical Scroll calculation
  const { scrollTop, scrollHeight, clientHeight } = scrollMetrics;
  const vCanScroll = scrollHeight > clientHeight + 2;
  const vRatio = scrollHeight > 0 ? clientHeight / scrollHeight : 1;
  const vThumbHeight = Math.max(36, Math.min(clientHeight * vRatio, clientHeight - 60));
  const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
  const vThumbTop = maxScrollTop > 0
    ? (scrollTop / maxScrollTop) * (Math.max(1, clientHeight - vThumbHeight - 60))
    : 0;

  // Horizontal Arrow Step
  const handleScrollHStep = (delta: number) => {
    const ws = workspaceRef.current;
    if (ws) {
      ws.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  // Vertical Arrow Step
  const handleScrollVStep = (delta: number) => {
    const ws = workspaceRef.current;
    if (ws) {
      ws.scrollBy({ top: delta, behavior: 'smooth' });
    }
  };

  // Dragging Horizontal Thumb
  const handleMouseDownH = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingH.current = true;
    dragStartX.current = e.clientX;
    const ws = workspaceRef.current;
    dragStartScrollLeft.current = ws ? ws.scrollLeft : 0;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingH.current || !workspaceRef.current) return;
      const deltaX = ev.clientX - dragStartX.current;
      const wsEl = workspaceRef.current;
      const trackWidth = wsEl.clientWidth - hThumbWidth - 60;
      if (trackWidth > 0) {
        const scrollDelta = (deltaX / trackWidth) * (wsEl.scrollWidth - wsEl.clientWidth);
        wsEl.scrollLeft = dragStartScrollLeft.current - scrollDelta; // RTL sensitivity
      }
    };

    const onMouseUp = () => {
      isDraggingH.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Dragging Vertical Thumb
  const handleMouseDownV = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingV.current = true;
    dragStartY.current = e.clientY;
    const ws = workspaceRef.current;
    dragStartScrollTop.current = ws ? ws.scrollTop : 0;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingV.current || !workspaceRef.current) return;
      const deltaY = ev.clientY - dragStartY.current;
      const wsEl = workspaceRef.current;
      const trackHeight = wsEl.clientHeight - vThumbHeight - 60;
      if (trackHeight > 0) {
        const scrollDelta = (deltaY / trackHeight) * (wsEl.scrollHeight - wsEl.clientHeight);
        wsEl.scrollTop = dragStartScrollTop.current + scrollDelta;
      }
    };

    const onMouseUp = () => {
      isDraggingV.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {/* 1. HORIZONTAL SCROLLBAR (شريط التمرير الأفقي مطابق للصورة المرفقة تماماً) */}
      <div 
        className="h-[17px] bg-slate-100 border-t border-slate-300 flex items-center justify-between select-none shadow-2xs z-30 shrink-0 no-print"
        style={{
          marginRight: showRuler ? '24px' : '0px',
          marginLeft: showRuler ? '24px' : '0px',
        }}
      >
        {/* Left Arrow Button (<) */}
        <button
          onClick={() => handleScrollHStep(-120)}
          className="h-full px-1.5 flex items-center justify-center bg-slate-200/80 hover:bg-slate-300 text-slate-700 border-l border-slate-300 transition active:bg-slate-400 cursor-pointer"
          title="تمرير لليسار"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Horizontal Track */}
        <div 
          className="flex-1 h-full bg-slate-200/50 relative cursor-pointer flex items-center px-1"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            const ws = workspaceRef.current;
            if (ws) {
              ws.scrollLeft = (ws.scrollWidth - ws.clientWidth) * (1 - clickRatio);
            }
          }}
        >
          {/* Draggable Thumb */}
          <div
            onMouseDown={handleMouseDownH}
            onClick={(e) => e.stopPropagation()}
            className="h-[10px] bg-slate-400 hover:bg-slate-500 active:bg-blue-600 rounded-full cursor-grab active:cursor-grabbing transition-colors shadow-2xs absolute"
            style={{
              width: `${hThumbWidth}px`,
              right: `${Math.max(4, hThumbLeft)}px`,
            }}
            title="سحب شريط التمرير الأفقي"
          />
        </div>

        {/* Right Arrow Button (>) */}
        <button
          onClick={() => handleScrollHStep(120)}
          className="h-full px-1.5 flex items-center justify-center bg-slate-200/80 hover:bg-slate-300 text-slate-700 border-r border-slate-300 transition active:bg-slate-400 cursor-pointer"
          title="تمرير لليمين"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. VERTICAL SCROLLBAR (شريط التمرير العمودي) */}
      <div 
        className="w-[14px] bg-slate-100 border-l border-slate-300 flex flex-col items-center justify-between select-none shadow-2xs z-30 shrink-0 no-print absolute left-0 bottom-0"
        style={{ top: 'calc(28px + 0.3cm)' }}
        title="شريط التمرير الرأسي"
      >
        {/* Up Arrow Button (^) */}
        <button
          onClick={() => handleScrollVStep(-140)}
          className="w-full py-1 flex items-center justify-center bg-slate-200/80 hover:bg-slate-300 text-slate-700 border-b border-slate-300 transition active:bg-slate-400 cursor-pointer"
          title="تمرير لأعلى"
        >
          <ChevronUp className="w-3 h-3" />
        </button>

        {/* Vertical Track */}
        <div 
          className="flex-1 w-full bg-slate-200/50 relative cursor-pointer flex justify-center py-1"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientY - rect.top) / rect.height;
            const ws = workspaceRef.current;
            if (ws) {
              ws.scrollTop = (ws.scrollHeight - ws.clientHeight) * clickRatio;
            }
          }}
        >
          {/* Draggable Vertical Thumb */}
          <div
            onMouseDown={handleMouseDownV}
            onClick={(e) => e.stopPropagation()}
            className="w-[8px] bg-slate-400 hover:bg-slate-500 active:bg-blue-600 rounded-full cursor-grab active:cursor-grabbing transition-colors shadow-2xs absolute"
            style={{
              height: `${vThumbHeight}px`,
              top: `${Math.max(4, vThumbTop)}px`,
            }}
            title="سحب شريط التمرير العمودي"
          />
        </div>

        {/* Down Arrow Button (v) */}
        <button
          onClick={() => handleScrollVStep(140)}
          className="w-full py-1 flex items-center justify-center bg-slate-200/80 hover:bg-slate-300 text-slate-700 border-t border-slate-300 transition active:bg-slate-400 cursor-pointer"
          title="تمرير لأسفل"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </>
  );
};

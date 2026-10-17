import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  AreaChart as AreaChartIcon, 
  X, 
  Move, 
  Palette,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SheetChart, SheetChartDataPoint, ExcelSheet } from '../../types';

interface ExcelChartOverlayProps {
  charts: SheetChart[];
  onUpdateChart: (chartId: string, updates: Partial<SheetChart>) => void;
  onDeleteChart: (chartId: string) => void;
}

const COLOR_PALETTES: Record<string, string[]> = {
  emerald: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#047857'],
  blue: ['#3b82f6', '#2563eb', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'],
  amber: ['#f59e0b', '#d97706', '#fbbf24', '#fcd34d', '#b45309', '#78350f'],
  purple: ['#8b5cf6', '#7c3aed', '#a78bfa', '#c4b5fd', '#6d28d9', '#5b21b6'],
  rose: ['#f43f5e', '#e11d48', '#fb7185', '#fda4af', '#be123c', '#9f1239'],
};

export const ExcelChartOverlay: React.FC<ExcelChartOverlayProps> = ({
  charts,
  onUpdateChart,
  onDeleteChart,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [paletteMenuChartId, setPaletteMenuChartId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, chart: SheetChart) => {
    // Only drag when clicking the header move handle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;

    setDraggingId(chart.id);
    setDragOffset({
      x: e.clientX - chart.x,
      y: e.clientY - chart.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const newX = Math.max(20, e.clientX - dragOffset.x);
    const newY = Math.max(60, e.clientY - dragOffset.y);
    onUpdateChart(draggingId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  if (!charts || charts.length === 0) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {charts.map((chart) => {
        const paletteName = chart.color || 'emerald';
        const colors = COLOR_PALETTES[paletteName] || COLOR_PALETTES.emerald;
        const isDragging = draggingId === chart.id;

        return (
          <div
            key={chart.id}
            id={`excel-chart-${chart.id}`}
            style={{
              position: 'absolute',
              left: `${chart.x}px`,
              top: `${chart.y}px`,
              width: `${chart.width}px`,
              height: `${chart.height}px`,
            }}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/90 flex flex-col transition-shadow ${
              isDragging ? 'shadow-blue-500/20 ring-2 ring-blue-400 cursor-grabbing' : 'hover:shadow-slate-400/20'
            }`}
          >
            {/* Header bar */}
            <div 
              onMouseDown={(e) => handleMouseDown(e, chart)}
              className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200 flex items-center justify-between rounded-t-xl cursor-grab select-none"
            >
              <div className="flex items-center gap-2">
                <Move className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={chart.title}
                  onChange={(e) => onUpdateChart(chart.id, { title: e.target.value })}
                  className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded transition"
                  placeholder="عنوان المخطط"
                />
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  {chart.range}
                </span>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center gap-1">
                {/* Type Switcher */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                  <button
                    onClick={() => onUpdateChart(chart.id, { type: 'column' })}
                    title="مخطط أعمدة"
                    className={`p-1 rounded transition ${chart.type === 'column' || chart.type === 'bar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateChart(chart.id, { type: 'line' })}
                    title="مخطط خطي"
                    className={`p-1 rounded transition ${chart.type === 'line' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateChart(chart.id, { type: 'pie' })}
                    title="مخطط دائري"
                    className={`p-1 rounded transition ${chart.type === 'pie' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateChart(chart.id, { type: 'area' })}
                    title="مخطط مساحي"
                    className={`p-1 rounded transition ${chart.type === 'area' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <AreaChartIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Palette Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setPaletteMenuChartId(paletteMenuChartId === chart.id ? null : chart.id)}
                    title="تغيير نظام الألوان"
                    className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  {paletteMenuChartId === chart.id && (
                    <div className="absolute left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 flex gap-1 z-30">
                      {Object.keys(COLOR_PALETTES).map((pKey) => (
                        <button
                          key={pKey}
                          onClick={() => {
                            onUpdateChart(chart.id, { color: pKey });
                            setPaletteMenuChartId(null);
                          }}
                          className={`w-5 h-5 rounded-full border-2 transition ${pKey === paletteName ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: COLOR_PALETTES[pKey][0] }}
                          title={pKey}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Resize width toggle */}
                <button
                  onClick={() => {
                    const isExpanded = chart.width > 450;
                    onUpdateChart(chart.id, {
                      width: isExpanded ? 400 : 560,
                      height: isExpanded ? 280 : 360,
                    });
                  }}
                  title={chart.width > 450 ? 'تصغير الحجم' : 'تكبير الحجم'}
                  className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs"
                >
                  {chart.width > 450 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close/Delete */}
                <button
                  onClick={() => onDeleteChart(chart.id)}
                  title="حذف المخطط"
                  className="p-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chart Canvas Area */}
            <div className="flex-1 w-full p-3 min-h-0 relative">
              {chart.data.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  لا توجد بيانات رقمية في النطاق المحدد
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chart.type === 'line' ? (
                    <LineChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="القيمة" 
                        stroke={colors[0]} 
                        strokeWidth={2.5} 
                        dot={{ r: 4, fill: colors[0] }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  ) : chart.type === 'pie' ? (
                    <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                      <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={chart.height > 300 ? 95 : 75}
                        innerRadius={chart.height > 300 ? 40 : 30}
                        paddingAngle={3}
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {chart.data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  ) : chart.type === 'area' ? (
                    <AreaChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="القيمة" 
                        stroke={colors[0]} 
                        fill={colors[0]} 
                        fillOpacity={0.25} 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={chart.data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar 
                        dataKey="value" 
                        name="القيمة" 
                        fill={colors[0]} 
                        radius={[4, 4, 0, 0]}
                      >
                        {chart.data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper: generate chart data from an Excel cell range
export function extractChartDataFromRange(sheet: ExcelSheet, rangeStr: string): SheetChartDataPoint[] {
  if (!rangeStr || !sheet.data) return [];
  const parts = rangeStr.toUpperCase().split(':');
  if (parts.length < 2) return [];

  const parseCoord = (coord: string) => {
    const match = coord.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    let col = 0;
    for (let i = 0; i < match[1].length; i++) {
      col = col * 26 + (match[1].charCodeAt(i) - 64);
    }
    return { col, row: parseInt(match[2], 10) };
  };

  const start = parseCoord(parts[0]);
  const end = parseCoord(parts[1]);
  if (!start || !end) return [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  const getColLetter = (n: number) => {
    let result = '';
    while (n > 0) {
      const rem = (n - 1) % 26;
      result = String.fromCharCode(65 + rem) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result;
  };

  const results: SheetChartDataPoint[] = [];

  // Case 1: Two or more columns (first column is label, second is value)
  if (maxCol > minCol) {
    const labelColLetter = getColLetter(minCol);
    const valueColLetter = getColLetter(minCol + 1);

    for (let r = minRow; r <= maxRow; r++) {
      const labelCell = sheet.data[`${labelColLetter}${r}`];
      const valCell = sheet.data[`${valueColLetter}${r}`];
      
      const rawVal = valCell?.value ?? valCell?.formattedValue ?? '';
      const num = parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        const name = (labelCell?.value || labelCell?.formattedValue || `بند ${r}`).trim();
        results.push({ name, value: num });
      }
    }
  } else {
    // Case 2: Single column range
    const colLetter = getColLetter(minCol);
    for (let r = minRow; r <= maxRow; r++) {
      const cell = sheet.data[`${colLetter}${r}`];
      const rawVal = cell?.value ?? cell?.formattedValue ?? '';
      const num = parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        results.push({ name: `الصف ${r}`, value: num });
      }
    }
  }

  return results;
}

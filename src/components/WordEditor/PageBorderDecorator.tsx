import React from 'react';
import { WordDocumentState } from '../../types';

interface PageBorderDecoratorProps {
  docState: WordDocumentState;
  pageWidthCm: number;
  pageHeightCm: number;
  totalPages?: number;
  pageNumber?: number;
}

export const PageBorderDecorator: React.FC<PageBorderDecoratorProps> = ({
  docState,
  pageWidthCm,
  pageHeightCm,
  totalPages = 1,
  pageNumber,
}) => {
  if (!docState.showBorders || !docState.borderStyle || docState.borderStyle === 'none') {
    return null;
  }

  const color = docState.borderColor || '#1e3a8a';
  const width = docState.borderWidth || 3;
  const style = docState.borderStyle;

  // Inset margin for the decorative border inside the actual page area
  const insetCm = 0.6; // 6mm from sheet edge

  const renderFrameContent = (pageNumber: number = 1) => (
    <>
      {/* 1. ROYAL / ISLAMIC ORNAMENTAL FRAME (مثل المرفق في مذكرة المحكمة) */}
      {(style === 'royal' || style === 'islamic') && (
        <div className="w-full h-full relative">
          {/* Outer Border */}
          <div 
            className="absolute inset-0 rounded-xs"
            style={{
              border: `${Math.max(width, 2.5)}px solid ${color}`,
            }}
          />

          {/* Inner Accent Line */}
          <div 
            className="absolute inset-1.5 rounded-xs"
            style={{
              border: `1px solid ${color}`,
              opacity: 0.85,
            }}
          />

          {/* Innermost Hairline */}
          <div 
            className="absolute inset-2.5 rounded-xs"
            style={{
              border: `0.5px dashed ${color}`,
              opacity: 0.5,
            }}
          />

          {/* Top-Right Corner Arabesque Ornament (زخرفة الزاوية العليا اليمنى) */}
          <svg 
            className="absolute top-0 right-0 w-16 h-16 pointer-events-none drop-shadow-xs scale-x-[-1]" 
            viewBox="0 0 64 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" 
              fill={color} 
              fillOpacity="0.12" 
            />
            <path 
              d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            {/* Floral / Rosette Motifs */}
            <circle cx="16" cy="16" r="4" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="36" cy="10" r="2.5" fill={color} />
            <circle cx="10" cy="36" r="2.5" fill={color} />
            <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" strokeWidth="1.2" />
          </svg>

          {/* Top-Left Corner Arabesque Ornament (زخرفة الزاوية العليا اليسرى) */}
          <svg 
            className="absolute top-0 left-0 w-16 h-16 pointer-events-none drop-shadow-xs" 
            viewBox="0 0 64 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" 
              fill={color} 
              fillOpacity="0.12" 
            />
            <path 
              d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            <circle cx="16" cy="16" r="4" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="36" cy="10" r="2.5" fill={color} />
            <circle cx="10" cy="36" r="2.5" fill={color} />
            <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" strokeWidth="1.2" />
          </svg>

          {/* Bottom-Right Corner Arabesque Ornament (زخرفة الزاوية السفلى اليمنى) */}
          <svg 
            className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none drop-shadow-xs scale-[-1]" 
            viewBox="0 0 64 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" 
              fill={color} 
              fillOpacity="0.12" 
            />
            <path 
              d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            <circle cx="16" cy="16" r="4" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="36" cy="10" r="2.5" fill={color} />
            <circle cx="10" cy="36" r="2.5" fill={color} />
            <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" strokeWidth="1.2" />
          </svg>

          {/* Bottom-Left Corner Arabesque Ornament (زخرفة الزاوية السفلى اليسرى) */}
          <svg 
            className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none drop-shadow-xs scale-y-[-1]" 
            viewBox="0 0 64 64" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" 
              fill={color} 
              fillOpacity="0.12" 
            />
            <path 
              d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
            <circle cx="16" cy="16" r="4" fill={color} />
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="36" cy="10" r="2.5" fill={color} />
            <circle cx="10" cy="36" r="2.5" fill={color} />
            <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" strokeWidth="1.2" />
          </svg>

          {/* Top Center Emblem (تاج الرأس الزخرفي) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-0.5 border border-amber-500 rounded-full flex items-center gap-1 shadow-2xs">
            <span className="text-amber-600 text-xs">◈</span>
            <span className="text-blue-900 text-xs font-bold font-serif">❖</span>
            <span className="text-amber-600 text-xs">◈</span>
          </div>

          {/* Bottom Center Emblem with Page Number Badge (مطابق للمرفق: شارة زرقاء داكنة بإطار ذهبي ورقم الصفحة) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white border-2 border-amber-500 flex items-center justify-center font-bold text-[11px] shadow-sm ring-1 ring-white">
              {pageNumber}
            </div>
          </div>
        </div>
      )}

      {/* 2. COURT & JUDICIAL LEGAL FRAME (إطار مذكرات الدعاوى والمحاكم الرسمية) */}
      {style === 'court' && (
        <div className="w-full h-full relative">
          <div 
            className="absolute inset-0"
            style={{ border: `${Math.max(width, 3)}px double ${color}` }}
          />
          <div 
            className="absolute inset-2"
            style={{ border: `1px solid ${color}`, opacity: 0.7 }}
          />
          {/* Corner brackets */}
          <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-amber-600" />
          <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-amber-600" />
          <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-amber-600" />
          <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-amber-600" />
        </div>
      )}

      {/* 3. CERTIFICATE & OFFICIAL FRAME (إطار الشهادات والوثائق الرسمية) */}
      {style === 'certificate' && (
        <div className="w-full h-full relative">
          <div 
            className="absolute inset-0"
            style={{ border: `${Math.max(width, 4)}px solid ${color}` }}
          />
          <div 
            className="absolute inset-1.5"
            style={{ border: '2px solid #d97706' }}
          />
          <div 
            className="absolute inset-3"
            style={{ border: `1px dashed ${color}` }}
          />
        </div>
      )}

      {/* 4. DOUBLE LINE (إطار مزدوج أنيق) */}
      {style === 'double' && (
        <div 
          className="w-full h-full"
          style={{
            border: `${Math.max(width, 3.5)}px double ${color}`,
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
          }}
        />
      )}

      {/* 5. TRIPLE LINE (إطار ثلاثي) */}
      {style === 'triple' && (
        <div className="w-full h-full relative">
          <div className="absolute inset-0" style={{ border: `${Math.max(width, 3)}px solid ${color}` }} />
          <div className="absolute inset-1" style={{ border: `1px solid ${color}` }} />
          <div className="absolute inset-2" style={{ border: `1.5px solid ${color}` }} />
        </div>
      )}

      {/* 6. GOLD ORNATE (إطار ذهبي فاخر) */}
      {style === 'gold' && (
        <div className="w-full h-full relative">
          <div className="absolute inset-0" style={{ border: `${Math.max(width, 3.5)}px solid #b45309` }} />
          <div className="absolute inset-1.5" style={{ border: '1.5px solid #fde047' }} />
          <div className="absolute top-1.5 right-1.5 text-amber-600 font-bold text-xs select-none">◈</div>
          <div className="absolute top-1.5 left-1.5 text-amber-600 font-bold text-xs select-none">◈</div>
          <div className="absolute bottom-1.5 right-1.5 text-amber-600 font-bold text-xs select-none">◈</div>
          <div className="absolute bottom-1.5 left-1.5 text-amber-600 font-bold text-xs select-none">◈</div>
        </div>
      )}

      {/* 7. CLASSIC SINGLE (إطار كلاسيكي متصل) */}
      {style === 'classic' && (
        <div 
          className="w-full h-full"
          style={{
            border: `${Math.max(width, 2)}px solid ${color}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        />
      )}

      {/* 8. DASHED (إطار منقط / متقطع) */}
      {style === 'dashed' && (
        <div 
          className="w-full h-full"
          style={{
            border: `${Math.max(width, 2)}px dashed ${color}`,
          }}
        />
      )}

      {/* 9. SHADOW (إطار مظلل) */}
      {style === 'shadow' && (
        <div 
          className="w-full h-full"
          style={{
            border: `${Math.max(width, 1.5)}px solid ${color}`,
            boxShadow: `0 8px 24px -4px ${color}30`,
          }}
        />
      )}

      {/* 10. SINGLE DEFAULT */}
      {style === 'single' && (
        <div 
          className="w-full h-full"
          style={{
            border: `${Math.max(width, 1.5)}px solid ${color}`,
          }}
        />
      )}
    </>
  );

  if (pageNumber !== undefined) {
    return (
      <div 
        className="absolute pointer-events-none select-none z-10 transition-all duration-150"
        style={{
          top: `${insetCm}cm`,
          right: `${insetCm}cm`,
          bottom: `${insetCm}cm`,
          left: `${insetCm}cm`,
        }}
        aria-hidden="true"
      >
        {renderFrameContent(pageNumber)}
      </div>
    );
  }

  // If pageNumber is specified (individual page sheet mode), render exactly one frame for this page
  if (pageNumber !== undefined) {
    return (
      <div 
        className="absolute pointer-events-none select-none z-10 transition-all duration-150"
        style={{
          top: `${insetCm}cm`,
          right: `${insetCm}cm`,
          bottom: `${insetCm}cm`,
          left: `${insetCm}cm`,
        }}
        aria-hidden="true"
      >
        {renderFrameContent(pageNumber)}
      </div>
    );
  }

  if (totalPages > 1) {
    return (
      <>
        {Array.from({ length: totalPages }).map((_, pageIdx) => {
          const topOffset = pageIdx === 0 
            ? `${insetCm}cm`
            : `calc(${pageIdx * pageHeightCm}cm + ${insetCm}cm)`;
          const frameHeight = `calc(${pageHeightCm}cm - ${insetCm * 2}cm)`;

          return (
            <div 
              key={`page-frame-${pageIdx}`}
              className="absolute pointer-events-none select-none z-10 transition-all duration-150"
              style={{
                top: topOffset,
                right: `${insetCm}cm`,
                height: frameHeight,
                left: `${insetCm}cm`,
              }}
              aria-hidden="true"
            >
              {renderFrameContent(pageIdx + 1)}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <div 
      className="absolute pointer-events-none select-none z-10 transition-all duration-150"
      style={{
        top: `${insetCm}cm`,
        right: `${insetCm}cm`,
        bottom: `${insetCm}cm`,
        left: `${insetCm}cm`,
      }}
      aria-hidden="true"
    >
      {renderFrameContent(1)}
    </div>
  );
};

export const getPageBorderDecoratorHtml = (docState: WordDocumentState, pageNumber: number = 1): string => {
  if (!docState.showBorders || !docState.borderStyle || docState.borderStyle === 'none') {
    return '';
  }

  const color = docState.borderColor || '#1e3a8a';
  const width = docState.borderWidth || 3;
  const style = docState.borderStyle;
  const insetCm = 0.6;

  let innerHtml = '';

  if (style === 'royal' || style === 'islamic') {
    innerHtml = `
      <div style="width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; inset: 0; border: ${Math.max(width, 2.5)}px solid ${color};"></div>
        <div style="position: absolute; inset: 6px; border: 1px solid ${color}; opacity: 0.85;"></div>
        <div style="position: absolute; inset: 10px; border: 0.5px dashed ${color}; opacity: 0.5;"></div>
        
        <!-- Top Right -->
        <svg style="position: absolute; top: 0; right: 0; width: 64px; height: 64px; pointer-events: none; transform: scaleX(-1);" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" fill="${color}" fill-opacity="0.12" />
          <path d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="16" cy="16" r="4" fill="${color}" />
          <circle cx="16" cy="16" r="2" fill="#fbbf24" />
          <circle cx="36" cy="10" r="2.5" fill="${color}" />
          <circle cx="10" cy="36" r="2.5" fill="${color}" />
          <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" stroke-width="1.2" />
        </svg>

        <!-- Top Left -->
        <svg style="position: absolute; top: 0; left: 0; width: 64px; height: 64px; pointer-events: none;" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" fill="${color}" fill-opacity="0.12" />
          <path d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="16" cy="16" r="4" fill="${color}" />
          <circle cx="16" cy="16" r="2" fill="#fbbf24" />
          <circle cx="36" cy="10" r="2.5" fill="${color}" />
          <circle cx="10" cy="36" r="2.5" fill="${color}" />
          <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" stroke-width="1.2" />
        </svg>

        <!-- Bottom Right -->
        <svg style="position: absolute; bottom: 0; right: 0; width: 64px; height: 64px; pointer-events: none; transform: scale(-1);" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" fill="${color}" fill-opacity="0.12" />
          <path d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="16" cy="16" r="4" fill="${color}" />
          <circle cx="16" cy="16" r="2" fill="#fbbf24" />
          <circle cx="36" cy="10" r="2.5" fill="${color}" />
          <circle cx="10" cy="36" r="2.5" fill="${color}" />
          <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" stroke-width="1.2" />
        </svg>

        <!-- Bottom Left -->
        <svg style="position: absolute; bottom: 0; left: 0; width: 64px; height: 64px; pointer-events: none; transform: scaleY(-1);" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L64 0 L64 12 C40 12 28 20 20 28 C12 36 12 48 12 64 L0 64 Z" fill="${color}" fill-opacity="0.12" />
          <path d="M60 4 C42 4 30 14 22 22 C14 30 4 42 4 60" stroke="${color}" stroke-width="2.5" stroke-linecap="round" />
          <path d="M52 4 C38 6 28 16 20 24 C12 32 6 42 4 52" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="16" cy="16" r="4" fill="${color}" />
          <circle cx="16" cy="16" r="2" fill="#fbbf24" />
          <circle cx="36" cy="10" r="2.5" fill="${color}" />
          <circle cx="10" cy="36" r="2.5" fill="${color}" />
          <path d="M16 6 L16 10 M16 22 L16 26 M6 16 L10 16 M22 16 L26 16" stroke="#d97706" stroke-width="1.2" />
        </svg>

        <!-- Top Center Emblem -->
        <div style="position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2px 12px; border: 1px solid #f59e0b; border-radius: 9999px; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <span style="color: #d97706; font-size: 11px;">◈</span>
          <span style="color: #1e3a8a; font-size: 12px; font-weight: bold; font-family: serif;">❖</span>
          <span style="color: #d97706; font-size: 11px;">◈</span>
        </div>

        <!-- Bottom Center Emblem with page number -->
        <div style="position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); background: #1e3a8a; color: white; width: 24px; height: 24px; border: 2px solid #d97706; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
          ${pageNumber}
        </div>
      </div>
    `;
  } else if (style === 'court') {
    innerHtml = `
      <div style="width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; inset: 0; border: ${Math.max(width, 3)}px double ${color};"></div>
        <div style="position: absolute; inset: 8px; border: 1px solid ${color}; opacity: 0.7;"></div>
        <div style="position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-top: 2px solid #d97706; border-right: 2px solid #d97706;"></div>
        <div style="position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-top: 2px solid #d97706; border-left: 2px solid #d97706;"></div>
        <div style="position: absolute; bottom: 4px; right: 4px; width: 24px; height: 24px; border-bottom: 2px solid #d97706; border-right: 2px solid #d97706;"></div>
        <div style="position: absolute; bottom: 4px; left: 4px; width: 24px; height: 24px; border-bottom: 2px solid #d97706; border-left: 2px solid #d97706;"></div>
      </div>
    `;
  } else if (style === 'certificate') {
    innerHtml = `
      <div style="width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; inset: 0; border: ${Math.max(width, 4)}px solid ${color};"></div>
        <div style="position: absolute; inset: 6px; border: 2px solid #d97706;"></div>
        <div style="position: absolute; inset: 12px; border: 1px dashed ${color};"></div>
      </div>
    `;
  } else if (style === 'double') {
    innerHtml = `<div style="width: 100%; height: 100%; border: ${Math.max(width, 3.5)}px double ${color}; box-sizing: border-box;"></div>`;
  } else if (style === 'triple') {
    innerHtml = `
      <div style="width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; inset: 0; border: ${Math.max(width, 3)}px solid ${color};"></div>
        <div style="position: absolute; inset: 4px; border: 1px solid ${color};"></div>
        <div style="position: absolute; inset: 8px; border: 1.5px solid ${color};"></div>
      </div>
    `;
  } else if (style === 'gold') {
    innerHtml = `
      <div style="width: 100%; height: 100%; position: relative;">
        <div style="position: absolute; inset: 0; border: ${Math.max(width, 3.5)}px solid #b45309;"></div>
        <div style="position: absolute; inset: 6px; border: 1.5px solid #fde047;"></div>
        <div style="position: absolute; top: 6px; right: 6px; color: #b45309; font-weight: bold; font-size: 11px;">◈</div>
        <div style="position: absolute; top: 6px; left: 6px; color: #b45309; font-weight: bold; font-size: 11px;">◈</div>
        <div style="position: absolute; bottom: 6px; right: 6px; color: #b45309; font-weight: bold; font-size: 11px;">◈</div>
        <div style="position: absolute; bottom: 6px; left: 6px; color: #b45309; font-weight: bold; font-size: 11px;">◈</div>
      </div>
    `;
  } else if (style === 'classic') {
    innerHtml = `<div style="width: 100%; height: 100%; border: ${Math.max(width, 2)}px solid ${color}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); box-sizing: border-box;"></div>`;
  } else if (style === 'dashed') {
    innerHtml = `<div style="width: 100%; height: 100%; border: ${Math.max(width, 2)}px dashed ${color}; box-sizing: border-box;"></div>`;
  } else if (style === 'shadow') {
    innerHtml = `<div style="width: 100%; height: 100%; border: ${Math.max(width, 1.5)}px solid ${color}; box-shadow: 0 8px 24px -4px ${color}30; box-sizing: border-box;"></div>`;
  } else {
    innerHtml = `<div style="width: 100%; height: 100%; border: ${Math.max(width, 1.5)}px solid ${color}; box-sizing: border-box;"></div>`;
  }

  return `
    <div style="position: absolute; pointer-events: none; user-select: none; z-index: 10; top: ${insetCm}cm; right: ${insetCm}cm; bottom: ${insetCm}cm; left: ${insetCm}cm; box-sizing: border-box;">
      ${innerHtml}
    </div>
  `;
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Line, Text, Group } from 'react-konva';
import { Upload, Download, Compass, Layers, Menu, X, Type } from 'lucide-react';
import { VASTU_DEITIES, ELEMENT_COLORS } from './vastuData';

interface Point {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [anchors, setAnchors] = useState<Point[]>([
    { x: 100, y: 100 }, // NW (A)
    { x: 700, y: 100 }, // NE (B)
    { x: 700, y: 500 }, // SE (C)
    { x: 100, y: 500 }, // SW (D)
  ]);
  const [northDegree, setNorthDegree] = useState<number>(0);
  const [showElements, setShowElements] = useState<boolean>(true);
  const [showDeities, setShowDeities] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(12);
  const [textOpacity, setTextOpacity] = useState<number>(1);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setImage(img);
        setStageSize({ width: img.width, height: img.height });
        
        const padX = img.width * 0.05;
        const padY = img.height * 0.05;
        setAnchors([
          { x: padX, y: padY },
          { x: img.width - padX, y: padY },
          { x: img.width - padX, y: img.height - padY },
          { x: padX, y: img.height - padY },
        ]);
      };
    }
  };

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'vastu-map.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDragMove = (index: number, e: any) => {
    const newAnchors = [...anchors];
    newAnchors[index] = { x: e.target.x(), y: e.target.y() };
    setAnchors(newAnchors);
  };

  const getIntersection = (A: Point, C: Point, B: Point, D: Point) => {
    const x1 = A.x, y1 = A.y;
    const x2 = C.x, y2 = C.y;
    const x3 = B.x, y3 = B.y;
    const x4 = D.x, y4 = D.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return { x: (A.x + C.x)/2, y: (A.y + C.y)/2 };

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  };

  const centerPoint = useMemo(() => {
    return getIntersection(anchors[0], anchors[2], anchors[1], anchors[3]);
  }, [anchors]);

  const zoneLines = useMemo(() => {
    if (!showZones) return [];
    const lines = [];
    const radius = 2000;
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    
    for (let i = 0; i < 16; i++) {
      const angleDeg = -90 + northDegree + i * 22.5;
      const angleRad = angleDeg * Math.PI / 180;
      
      const endX = centerPoint.x + radius * Math.cos(angleRad);
      const endY = centerPoint.y + radius * Math.sin(angleRad);
      
      const boundaryDeg = angleDeg + 11.25;
      const boundaryRad = boundaryDeg * Math.PI / 180;
      const boundX = centerPoint.x + radius * Math.cos(boundaryRad);
      const boundY = centerPoint.y + radius * Math.sin(boundaryRad);

      const labelRadius = Math.min(stageSize.width, stageSize.height) * 0.4;
      const labelX = centerPoint.x + labelRadius * Math.cos(angleRad);
      const labelY = centerPoint.y + labelRadius * Math.sin(angleRad);
      
      lines.push({
        label: directions[i],
        centerX: endX,
        centerY: endY,
        boundX,
        boundY,
        labelX,
        labelY,
      });
    }
    return lines;
  }, [centerPoint, northDegree, showZones, stageSize]);

  const interpolate = (u: number, v: number, A: Point, B: Point, C: Point, D: Point) => {
    const top = { x: A.x + u * (B.x - A.x), y: A.y + u * (B.y - A.y) };
    const bottom = { x: D.x + u * (C.x - D.x), y: D.y + u * (C.y - D.y) };
    return {
      x: top.x + v * (bottom.x - top.x),
      y: top.y + v * (bottom.y - top.y),
    };
  };

  const getDeityForCell = (r: number, c: number) => {
    const dx = c - 4;
    const dy = r - 4;
    const angle = -northDegree * Math.PI / 180;
    const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
    let lc = Math.round(rx) + 4;
    let lr = Math.round(ry) + 4;
    lc = Math.max(0, Math.min(8, lc));
    lr = Math.max(0, Math.min(8, lr));
    
    return VASTU_DEITIES.find(d => d.cells.some(cell => cell.r === lr && cell.c === lc));
  };

  // Generate the 81 physical cells and their properties
  const gridCells = useMemo(() => {
    const cells = [];
    const A = anchors[0];
    const B = anchors[1];
    const C = anchors[2];
    const D = anchors[3];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const u1 = c / 9, v1 = r / 9;
        const u2 = (c + 1) / 9, v2 = r / 9;
        const u3 = (c + 1) / 9, v3 = (r + 1) / 9;
        const u4 = c / 9, v4 = (r + 1) / 9;

        const p1 = interpolate(u1, v1, A, B, C, D);
        const p2 = interpolate(u2, v2, A, B, C, D);
        const p3 = interpolate(u3, v3, A, B, C, D);
        const p4 = interpolate(u4, v4, A, B, C, D);

        const deity = getDeityForCell(r, c);

        cells.push({
          r, c,
          points: [p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y],
          center: interpolate(c/9 + 0.5/9, r/9 + 0.5/9, A, B, C, D),
          deity,
        });
      }
    }
    return cells;
  }, [anchors, northDegree]);

  // Generate labels for every block
  const deityLabels = useMemo(() => {
    const labels: { name: string, x: number, y: number, element: string }[] = [];
    gridCells.forEach(cell => {
      if (cell.deity) {
        labels.push({
          name: cell.deity.name,
          x: cell.center.x,
          y: cell.center.y,
          element: cell.deity.element
        });
      }
    });
    return labels;
  }, [gridCells]);


  // Effect to handle window resize for full canvas space
  useEffect(() => {
    const updateZoom = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Padding inside the container for the stage
        const availableWidth = clientWidth - 32; 
        const availableHeight = clientHeight - 32;
        
        const scale = Math.min(
          availableWidth / stageSize.width,
          availableHeight / stageSize.height
        );
        setZoom(scale);
      }
    };
    
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, [stageSize]);

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        transition-transform duration-300 ease-in-out
        w-80 bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl shrink-0 h-full
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Vastu Mapper
            </h1>
            <p className="text-xs text-slate-400 mt-1">Paramasayika 81-Pada Grid</p>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Upload */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Upload size={16} /> Floor Plan
            </label>
            <label className="flex items-center justify-center w-full h-24 px-4 transition bg-slate-900 border-2 border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-500 focus:outline-none">
              <span className="flex items-center space-x-2 text-sm text-slate-400">
                <span className="font-medium text-blue-500">Browse files</span>
                <span>or drop here</span>
              </span>
              <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
            </label>
          </div>

          {/* Orientation */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Compass size={16} /> North Degree
              </label>
              <span className="text-blue-400 font-mono bg-slate-900 px-2 py-1 rounded text-sm">{northDegree}°</span>
            </div>
            <input 
              type="range" 
              min="0" max="359" 
              value={northDegree} 
              onChange={(e) => setNorthDegree(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>0° (Top)</span>
              <span>90° (Right)</span>
              <span>180°</span>
              <span>270°</span>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} /> Display Overlay
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showElements} 
                  onChange={(e) => setShowElements(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600"
                />
                <span className="text-sm font-medium">Five Elements Colors</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showDeities} 
                  onChange={(e) => setShowDeities(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600"
                />
                <span className="text-sm font-medium">Deity Names</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showZones} 
                  onChange={(e) => setShowZones(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-700 border-slate-600"
                />
                <span className="text-sm font-medium">16 Vastu Zones</span>
              </label>
            </div>
          </div>

          {/* Text Formatting */}
          {showDeities && (
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Type size={16} /> Label Formatting
              </label>
              
              <div className="space-y-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                    <span>Font Size</span>
                    <span className="text-blue-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">{fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="6" max="20" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-400">
                    <span>Opacity</span>
                    <span className="text-blue-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">{Math.round(textOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={textOpacity} 
                    onChange={(e) => setTextOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          {showElements && (
            <div className="space-y-3 pt-4 border-t border-slate-700">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Element Colors</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(ELEMENT_COLORS).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.replace('0.5', '1') }}></div>
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-950 relative overflow-hidden">
        
        {/* Header (Mobile Only) */}
        <header className="flex md:hidden items-center p-4 bg-slate-800 border-b border-slate-700 shrink-0 gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="p-2 bg-slate-700 rounded-lg shadow text-slate-100 focus:outline-none hover:bg-slate-600 transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Vastu Mapper
          </h1>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 w-full min-w-0 flex items-center justify-center p-4 relative overflow-hidden" ref={containerRef}>
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <p className="text-slate-500 text-lg font-medium bg-slate-900/80 px-4 py-2 rounded-lg">Upload a floor plan to begin mapping</p>
          </div>
        )}
        
        <div className="relative shadow-2xl ring-1 ring-slate-800 rounded-lg overflow-hidden bg-white" style={{ width: stageSize.width * zoom, height: stageSize.height * zoom }}>
          <Stage width={stageSize.width * zoom} height={stageSize.height * zoom} scale={{ x: zoom, y: zoom }} ref={stageRef}>
            <Layer>
              {image && (
                <KonvaImage image={image} width={stageSize.width} height={stageSize.height} />
              )}
            </Layer>

            <Layer>
              {/* Grid Cells */}
              {gridCells.map((cell, i) => (
                <Line
                  key={`cell-${i}`}
                  points={cell.points}
                  fill={showElements && cell.deity ? ELEMENT_COLORS[cell.deity.element as keyof typeof ELEMENT_COLORS] : 'transparent'}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth={1}
                  closed
                />
              ))}

              {/* Grid Outline */}
              <Line
                points={[
                  anchors[0].x, anchors[0].y,
                  anchors[1].x, anchors[1].y,
                  anchors[2].x, anchors[2].y,
                  anchors[3].x, anchors[3].y,
                ]}
                stroke="#3b82f6"
                strokeWidth={2}
                closed
              />

              {/* Vastu 16 Zones */}
              {showZones && (
                <Group>
                  <Circle x={centerPoint.x} y={centerPoint.y} radius={6} fill="#ef4444" />
                  {zoneLines.map((zone, i) => (
                    <Group key={`zone-${i}`}>
                      <Line
                        points={[centerPoint.x, centerPoint.y, zone.boundX, zone.boundY]}
                        stroke="#64748b"
                        strokeWidth={1}
                      />
                      <Line
                        points={[centerPoint.x, centerPoint.y, zone.centerX, zone.centerY]}
                        stroke={zone.label === 'N' ? '#ef4444' : '#f97316'}
                        strokeWidth={zone.label === 'N' ? 2 : 1}
                        dash={zone.label === 'N' ? [] : [10, 10]}
                      />
                      <Text
                        text={zone.label}
                        x={zone.labelX}
                        y={zone.labelY}
                        fontSize={18}
                        fontFamily="Inter, sans-serif"
                        fontStyle="bold"
                        fill={zone.label === 'N' ? '#ef4444' : '#1e293b'}
                        align="center"
                        verticalAlign="middle"
                        offsetX={15}
                        offsetY={9}
                        shadowColor="white"
                        shadowBlur={4}
                        shadowOpacity={1}
                      />
                    </Group>
                  ))}
                </Group>
              )}

              {/* Deity Labels */}
              {showDeities && deityLabels.map((label, i) => (
                <Group key={`label-${i}`} x={label.x} y={label.y} opacity={textOpacity}>
                  <Text
                    text={label.name}
                    fontSize={fontSize}
                    fontFamily="Inter, sans-serif"
                    fontStyle="bold"
                    fill="#1e293b"
                    align="center"
                    verticalAlign="middle"
                    offsetX={50}
                    offsetY={fontSize / 2}
                    width={100}
                    shadowColor="white"
                    shadowBlur={4}
                    shadowOpacity={0.8}
                  />
                </Group>
              ))}

              {/* Draggable Anchors */}
              {anchors.map((anchor, i) => (
                <Circle
                  key={`anchor-${i}`}
                  x={anchor.x}
                  y={anchor.y}
                  radius={12}
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth={3}
                  draggable
                  onDragMove={(e) => handleDragMove(i, e)}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'move';
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'default';
                  }}
                  shadowColor="rgba(0,0,0,0.5)"
                  shadowBlur={6}
                  shadowOffset={{ x: 0, y: 2 }}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-slate-800 border-t border-slate-700 shrink-0 flex justify-center md:justify-end z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={handleExport}
          className="w-full md:w-auto py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Download size={18} /> Export Map
        </button>
      </footer>
    </div>
  </div>
  );
};

export default App;

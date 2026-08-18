import React, { useRef, useState, useEffect } from 'react';
import { Palette, Eraser, Download, Trash2, Brush, Circle, Square, Sparkles, Undo2 } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export const PixPaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'stamp'>('brush');
  const [stamp, setStamp] = useState<string>('⭐');

  const palette = [
    '#000000', '#787878', '#790300', '#757a01', '#007902', '#007778', '#0a0078', '#7b0077',
    '#ffffff', '#bcbcbc', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#ffa500', '#a52a2a', '#ffc0cb', '#40e0d0', '#ffd700', '#800080', '#008080', '#e6e6fa'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'stamp') {
      ctx.font = `${brushSize * 5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp, x, y);
      try { soundFx.playClick(); } catch (err) {}
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'stamp') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try { soundFx.playClick(); } catch (e) {}
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'crianca_pix_arte.png';
    link.href = canvas.toDataURL();
    link.click();
    try { soundFx.playNotification(); } catch (e) {}
  };

  return (
    <div className="bg-[#c0c0c0] p-3 text-black font-sans text-xs space-y-3 select-none">
      {/* Title / Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-gray-400 pb-2 bg-gray-200 p-2 border-bevel-out">
        <div className="flex items-center gap-2 font-bold font-vt323 text-lg">
          <Palette className="w-5 h-5 text-pink-600" />
          <span>CRIANÇA PIX • PAINT STUDIO 2000</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="btn-retro px-2.5 py-1 flex items-center gap-1 cursor-pointer"
            title="Limpar tela"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Limpar</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn-retro px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-emerald-100"
            title="Salvar Arte"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Salvar Imagem</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Left Tools Panel */}
        <div className="w-full sm:w-40 flex flex-col gap-3 bg-gray-100 p-2 border-bevel-out">
          <div className="font-bold text-[11px] uppercase border-b border-gray-300 pb-1">Ferramentas</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setTool('brush')}
              className={`p-2 border flex flex-col items-center gap-1 font-bold ${
                tool === 'brush' ? 'bg-[#000080] text-white border-black shadow-inner' : 'btn-retro'
              }`}
            >
              <Brush className="w-4 h-4" />
              <span>Pincel</span>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 border flex flex-col items-center gap-1 font-bold ${
                tool === 'eraser' ? 'bg-[#000080] text-white border-black shadow-inner' : 'btn-retro'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>Borracha</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold">Espessura: {brushSize}px</div>
            <input
              type="range"
              min={2}
              max={30}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full cursor-pointer accent-blue-700"
            />
          </div>

          <div className="space-y-1 border-t border-gray-300 pt-2">
            <div className="text-[11px] font-bold">Carimbos Retrô:</div>
            <div className="grid grid-cols-4 gap-1">
              {['⭐', '🚀', '💻', '📦', '👾', '💾', '🎨', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setStamp(emoji);
                    setTool('stamp');
                  }}
                  className={`p-1.5 text-base rounded border ${
                    tool === 'stamp' && stamp === emoji ? 'bg-yellow-300 border-black' : 'bg-white hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center bg-gray-300 p-2 border-bevel-in overflow-hidden">
          <canvas
            ref={canvasRef}
            width={520}
            height={360}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white border-2 border-gray-600 shadow-md cursor-crosshair max-w-full touch-none"
          />

          {/* Color Palette Grid */}
          <div className="w-full mt-3 bg-gray-200 p-2 border-bevel-out flex flex-wrap items-center gap-1.5 justify-center">
            <div className="text-[11px] font-bold mr-2">Cores:</div>
            <div className="flex flex-wrap gap-1 max-w-md">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    if (tool === 'eraser') setTool('brush');
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 border-2 shadow-xs cursor-pointer ${
                    color === c && tool === 'brush' ? 'border-black scale-125 ring-2 ring-yellow-400 z-10' : 'border-gray-400'
                  }`}
                  title={c}
                />
              ))}
            </div>
            {/* Current Color Preview */}
            <div className="flex items-center gap-1.5 ml-3 pl-2 border-l border-gray-400">
              <div style={{ backgroundColor: color }} className="w-6 h-6 border-2 border-black" />
              <span className="font-mono text-[10px] font-bold">{color}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

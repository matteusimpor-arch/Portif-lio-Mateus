import React, { useRef, useState, useEffect } from 'react';
import { Palette, Eraser, Download, Trash2, Brush, FolderPlus, Check, X } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { DesktopFolderItem } from '../../types';
import { addFolderFile } from '../../utils/folderStorage';

export const PixPaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'stamp'>('brush');
  const [stamp, setStamp] = useState<string>('⭐');

  // Save to folder state
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveFileName, setSaveFileName] = useState<string>('Minha_Arte.png');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [availableFolders, setAvailableFolders] = useState<DesktopFolderItem[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

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

  // Load available folders
  useEffect(() => {
    try {
      const retro = JSON.parse(localStorage.getItem('mateus_os_retro_folders') || '[]');
      const space = JSON.parse(localStorage.getItem('mateus_space_folders') || '[]');
      const combined = [...retro, ...space];
      setAvailableFolders(combined);
      if (combined.length > 0) {
        setSelectedFolderId(combined[0].id);
      }
    } catch (e) {}
  }, [showSaveModal]);

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

  const handleSaveToFolder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!selectedFolderId) {
      alert('Nenhuma pasta selecionada. Por favor, crie uma pasta na área de trabalho primeiro!');
      return;
    }

    let finalName = saveFileName.trim() || 'Arte_Pix.png';
    if (!finalName.endsWith('.png') && !finalName.endsWith('.jpg')) {
      finalName += '.png';
    }

    const dataUrl = canvas.toDataURL();
    const size = new Blob([dataUrl]).size;

    addFolderFile({
      folderId: selectedFolderId,
      name: finalName,
      type: 'image',
      extension: 'png',
      content: dataUrl,
      sizeBytes: size,
    });

    try { soundFx.playFanfare(); } catch (e) {}
    setSaveSuccessMsg(`Salvo com sucesso na pasta selecionada!`);
    setTimeout(() => {
      setSaveSuccessMsg('');
      setShowSaveModal(false);
    }, 1800);
  };

  return (
    <div className="bg-[#c0c0c0] p-3 text-black font-sans text-xs space-y-3 select-none relative">
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
            onClick={() => {
              soundFx.playClick();
              setShowSaveModal(true);
            }}
            className="btn-retro px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-blue-100 font-bold text-blue-950"
            title="Salvar desenho em uma pasta"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-800" />
            <span>Salvar na Pasta</span>
          </button>
          <button
            onClick={handleDownload}
            className="btn-retro px-2.5 py-1 flex items-center gap-1 cursor-pointer bg-emerald-100"
            title="Baixar para o Computador"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Baixar (.png)</span>
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

      {/* Save to Folder Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 w-full max-w-sm shadow-2xl p-4 space-y-3">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>SALVAR DESENHO NA PASTA</span>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-0.5 hover:bg-red-600 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {saveSuccessMsg ? (
              <div className="p-4 bg-emerald-100 border border-emerald-500 rounded text-center text-emerald-900 font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>{saveSuccessMsg}</span>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">Escolha a Pasta:</label>
                  {availableFolders.length === 0 ? (
                    <p className="text-xs text-red-600 bg-red-50 p-2 border border-red-300">
                      Nenhuma pasta encontrada. Crie uma pasta na área de trabalho primeiro clicando com o botão direito!
                    </p>
                  ) : (
                    <select
                      value={selectedFolderId}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                      className="w-full bg-white border border-gray-600 px-2 py-1 text-xs focus:outline-none"
                    >
                      {availableFolders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name} ({f.origin === 'space' ? 'Space 2026' : 'Retro OS'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">Nome do Arquivo:</label>
                  <input
                    type="text"
                    value={saveFileName}
                    onChange={(e) => setSaveFileName(e.target.value)}
                    placeholder="Minha_Obra_De_Arte.png"
                    className="w-full bg-white border border-gray-600 px-2 py-1 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-400">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="btn-retro px-3 py-1 text-xs text-gray-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={availableFolders.length === 0}
                    onClick={handleSaveToFolder}
                    className="btn-retro px-4 py-1 text-xs font-bold text-blue-950 bg-yellow-200 border-2 border-yellow-600 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-green-800" />
                    <span>Salvar na Pasta</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  HardDrive,
  Plus,
  Upload,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Search,
  Grid,
  List,
  LayoutList,
  X,
  Check,
  Palette,
  FileCode,
  File as GenericFileIcon,
  Sparkles,
  Eye,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { DesktopFolderItem, FolderFileItem, FolderFileType } from '../types';
import {
  getFolderFiles,
  saveFolderFiles,
  addFolderFile,
  updateFolderFile,
  deleteFolderFile,
  duplicateFolderFile,
  formatFileSize
} from '../utils/folderStorage';
import { soundFx } from '../utils/soundEffects';

interface FolderWindowProps {
  folder: DesktopFolderItem;
  mode: 'retro' | 'space';
}

export const FolderWindow: React.FC<FolderWindowProps> = ({ folder, mode }) => {
  const [files, setFiles] = useState<FolderFileItem[]>(() => getFolderFiles(folder.id));
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [viewStyle, setViewStyle] = useState<'icons' | 'list' | 'details'>('icons');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Modals & Creation States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createType, setCreateType] = useState<FolderFileType>('text');
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileContent, setNewFileContent] = useState<string>('');

  // Active File Viewer / Editor Modal
  const [activeFile, setActiveFile] = useState<FolderFileItem | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingFileName, setEditingFileName] = useState<string>('');

  // Mini Paint in Folder State
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paintColor, setPaintColor] = useState<string>('#000000');
  const [paintSize, setPaintSize] = useState<number>(4);
  const [isPainting, setIsPainting] = useState<boolean>(false);

  // Renaming inline
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Context Menu for Files
  const [fileContextMenu, setFileContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetFile: FolderFileItem;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync files from storage and listen to changes
  useEffect(() => {
    const load = () => {
      setFiles(getFolderFiles(folder.id));
    };
    load();

    const handleCustomEvent = (e: any) => {
      if (e.detail?.folderId === folder.id) {
        load();
      }
    };

    window.addEventListener('folder-files-changed', handleCustomEvent);
    return () => window.removeEventListener('folder-files-changed', handleCustomEvent);
  }, [folder.id]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setFileContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Filtered files
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);

  // Helper to open file for viewing/editing
  const handleOpenFile = (file: FolderFileItem) => {
    try { soundFx.playWindowOpen(); } catch (e) {}
    setActiveFile(file);
    setEditingContent(file.content || '');
    setEditingFileName(file.name);
  };

  // Save changes to active open file
  const handleSaveActiveFile = () => {
    if (!activeFile) return;
    try { soundFx.playClick(); } catch (e) {}
    const updatedSize = activeFile.type === 'text' || activeFile.type === 'code'
      ? new Blob([editingContent]).size
      : activeFile.sizeBytes;

    updateFolderFile(folder.id, activeFile.id, {
      name: editingFileName.trim() || activeFile.name,
      content: editingContent,
      sizeBytes: updatedSize,
    });
    setFiles(getFolderFiles(folder.id));
    setActiveFile((prev) => (prev ? { ...prev, name: editingFileName, content: editingContent, sizeBytes: updatedSize } : null));
  };

  // Download a file to user's real computer
  const handleDownloadFile = (file: FolderFileItem) => {
    try { soundFx.playClick(); } catch (e) {}
    const element = document.createElement('a');
    if (file.type === 'image' || file.type === 'paint') {
      element.href = file.content;
      element.download = file.name;
    } else {
      const blob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(blob);
      element.download = file.name;
    }
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle uploading physical files from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((f: File) => {
      const isImg = f.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result as string;
        let fileType: FolderFileType = 'file';
        if (isImg) fileType = 'image';
        else if (f.name.endsWith('.txt') || f.name.endsWith('.md') || f.name.endsWith('.doc')) fileType = 'text';
        else if (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.json') || f.name.endsWith('.html') || f.name.endsWith('.py')) fileType = 'code';

        const ext = f.name.split('.').pop() || 'dat';

        addFolderFile({
          folderId: folder.id,
          name: f.name,
          type: fileType,
          extension: ext,
          content: result,
          sizeBytes: f.size,
        });
        setFiles(getFolderFiles(folder.id));
        try { soundFx.playNotification(); } catch (err) {}
      };

      if (isImg) {
        reader.readAsDataURL(f);
      } else {
        reader.readAsText(f);
      }
    });

    if (e.target) e.target.value = '';
  };

  // Drag and drop handler from desktop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach((f: File) => {
        const isImg = f.type.startsWith('image/');
        const reader = new FileReader();

        reader.onload = (event) => {
          const result = event.target?.result as string;
          let fileType: FolderFileType = 'file';
          if (isImg) fileType = 'image';
          else if (f.name.endsWith('.txt') || f.name.endsWith('.md')) fileType = 'text';
          else if (f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.json') || f.name.endsWith('.py')) fileType = 'code';

          const ext = f.name.split('.').pop() || 'dat';

          addFolderFile({
            folderId: folder.id,
            name: f.name,
            type: fileType,
            extension: ext,
            content: result,
            sizeBytes: f.size,
          });
          setFiles(getFolderFiles(folder.id));
          try { soundFx.playNotification(); } catch (err) {}
        };

        if (isImg) {
          reader.readAsDataURL(f);
        } else {
          reader.readAsText(f);
        }
      });
    }
  };

  // Create new file submit
  const handleCreateNewFileSubmit = () => {
    let finalName = newFileName.trim();
    let content = newFileContent;
    let ext = 'txt';

    if (createType === 'text') {
      if (!finalName) finalName = 'Novo_Documento.txt';
      if (!finalName.includes('.')) finalName += '.txt';
      ext = finalName.split('.').pop() || 'txt';
      if (!content) content = 'Digite aqui o seu texto...';
    } else if (createType === 'paint') {
      if (!finalName) finalName = 'Meu_Desenho.png';
      if (!finalName.includes('.')) finalName += '.png';
      ext = 'png';
      if (paintCanvasRef.current) {
        content = paintCanvasRef.current.toDataURL();
      }
    } else if (createType === 'link') {
      if (!finalName) finalName = 'Atalho_Web.url';
      if (!finalName.includes('.')) finalName += '.url';
      ext = 'url';
      if (!content) content = 'https://google.com';
    } else if (createType === 'code') {
      if (!finalName) finalName = 'script.js';
      ext = finalName.split('.').pop() || 'js';
      if (!content) content = '// Digite seu código aqui\nconsole.log("Olá do Mateus OS!");';
    }

    const size = new Blob([content]).size;

    addFolderFile({
      folderId: folder.id,
      name: finalName,
      type: createType,
      extension: ext,
      content,
      sizeBytes: size,
    });

    setFiles(getFolderFiles(folder.id));
    setShowCreateModal(false);
    setNewFileName('');
    setNewFileContent('');
    try { soundFx.playFanfare(); } catch (e) {}
  };

  // Duplicate file
  const handleDuplicate = (fileId: string) => {
    try { soundFx.playClick(); } catch (e) {}
    duplicateFolderFile(folder.id, fileId);
    setFiles(getFolderFiles(folder.id));
  };

  // Delete file
  const handleDelete = (fileId: string) => {
    try { soundFx.playWindowClose(); } catch (e) {}
    deleteFolderFile(folder.id, fileId);
    setFiles(getFolderFiles(folder.id));
    if (activeFile?.id === fileId) {
      setActiveFile(null);
    }
  };

  // Paint Canvas helpers
  const startPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsPainting(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = paintSize;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopPaint = () => {
    setIsPainting(false);
  };

  // Icon mapping helper
  const getFileIcon = (file: FolderFileItem) => {
    if (file.type === 'text') return <FileText className="w-8 h-8 text-blue-600" />;
    if (file.type === 'image' || file.type === 'paint') return <ImageIcon className="w-8 h-8 text-pink-600" />;
    if (file.type === 'link') return <LinkIcon className="w-8 h-8 text-emerald-600" />;
    if (file.type === 'code') return <FileCode className="w-8 h-8 text-purple-600" />;
    return <GenericFileIcon className="w-8 h-8 text-amber-600" />;
  };

  // ===========================================================================
  // RETRO WINDOWS 2000 FOLDER VIEW
  // ===========================================================================
  if (mode === 'retro') {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className="flex flex-col h-full select-none font-sans text-gray-900 bg-[#c0c0c0] relative overflow-hidden"
      >
        {/* Hidden File Input for Physical Uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />

        {/* Retro Menu Bar */}
        <div className="flex items-center gap-3 px-2 py-0.5 border-b border-gray-400 text-xs font-sans bg-[#ece9d8]">
          <span
            onClick={() => setShowCreateModal(true)}
            className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer font-bold"
          >
            Arquivo
          </span>
          <span
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer"
          >
            Enviar...
          </span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Exibir</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Favoritos</span>
          <span className="hover:bg-blue-800 hover:text-white px-1 cursor-pointer">Ajuda</span>
        </div>

        {/* Retro Windows 2000 Explorer Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1 border-b border-gray-400 bg-[#d4d0c8] text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setCreateType('text');
                setShowCreateModal(true);
              }}
              className="btn-retro px-2 py-1 text-[11px] font-bold text-blue-950 flex items-center gap-1 cursor-pointer"
              title="Criar novo arquivo de texto"
            >
              <Plus className="w-3.5 h-3.5 text-blue-800" />
              <span>Novo Arquivo</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                fileInputRef.current?.click();
              }}
              className="btn-retro px-2 py-1 text-[11px] font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Carregar arquivo do seu computador para dentro desta pasta"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-800" />
              <span>Enviar Arquivo</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setCreateType('paint');
                setShowCreateModal(true);
              }}
              className="btn-retro px-2 py-1 text-[11px] text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Criar novo desenho Pixel Art"
            >
              <Palette className="w-3.5 h-3.5 text-purple-800" />
              <span>Desenhar</span>
            </button>
          </div>

          {/* Search & View Modes */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar nesta pasta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-600 px-1.5 py-0.5 text-[11px] w-28 sm:w-36 focus:outline-none"
              />
            </div>

            <div className="flex items-center border border-gray-500 bg-white">
              <button
                onClick={() => setViewStyle('icons')}
                className={`p-1 ${viewStyle === 'icons' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                title="Ícones Grandes"
              >
                <Grid className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <button
                onClick={() => setViewStyle('list')}
                className={`p-1 ${viewStyle === 'list' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                title="Lista"
              >
                <List className="w-3.5 h-3.5 text-gray-700" />
              </button>
              <button
                onClick={() => setViewStyle('details')}
                className={`p-1 ${viewStyle === 'details' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                title="Detalhes"
              >
                <LayoutList className="w-3.5 h-3.5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Retro Address Bar */}
        <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-400 bg-[#ece9d8] text-xs">
          <span className="text-gray-600 font-bold">Endereço:</span>
          <div className="flex-1 bg-white border border-gray-600 px-1.5 py-0.5 text-xs font-mono flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">C:\Desktop\{folder.name}</span>
          </div>
        </div>

        {/* Drag & Drop Visual Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-30 bg-blue-900/40 backdrop-blur-xs border-4 border-dashed border-white flex flex-col items-center justify-center text-white text-center p-4">
            <Upload className="w-12 h-12 mb-2 animate-bounce" />
            <h3 className="text-sm font-bold font-mono">Solte os arquivos aqui para salvar na pasta!</h3>
            <p className="text-xs opacity-90">Os arquivos serão guardados diretamente neste diretório.</p>
          </div>
        )}

        {/* Main Folder Content Area */}
        <div
          onClick={() => setSelectedFileId(null)}
          className="flex-1 bg-white border-2 border-gray-600 m-1 p-2 overflow-y-auto custom-scrollbar"
        >
          {filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-md bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-600 shadow-sm">
                <FolderOpen className="w-9 h-9 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">{folder.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Esta pasta está pronta para receber arquivos e anotações.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateType('text');
                    setShowCreateModal(true);
                  }}
                  className="btn-retro px-3 py-1.5 text-xs text-blue-950 font-bold flex items-center gap-1 cursor-pointer bg-blue-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Nota de Texto</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-retro px-3 py-1.5 text-xs text-gray-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar do PC</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Large Icons Grid View */}
              {viewStyle === 'icons' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 p-1 content-start">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <div
                        key={file.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileId(file.id);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleOpenFile(file);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFileId(file.id);
                          setFileContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            targetFile: file,
                          });
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xs text-center cursor-pointer transition-colors group ${
                          isSelected
                            ? 'bg-blue-900/80 text-white border border-dotted border-white/80'
                            : 'hover:bg-blue-50 text-gray-900 border border-transparent'
                        }`}
                      >
                        {/* Thumbnail or File Icon */}
                        {file.type === 'image' || file.type === 'paint' ? (
                          <div className="w-12 h-12 rounded border border-gray-400 overflow-hidden bg-gray-100 flex items-center justify-center shadow-xs mb-1">
                            <img
                              src={file.content}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="mb-1">{getFileIcon(file)}</div>
                        )}

                        <span className="text-[11px] font-sans font-medium line-clamp-2 max-w-[90px] break-words">
                          {file.name}
                        </span>
                        <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                          {formatFileSize(file.sizeBytes)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. List View */}
              {viewStyle === 'list' && (
                <div className="space-y-1">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <div
                        key={file.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileId(file.id);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleOpenFile(file);
                        }}
                        className={`flex items-center gap-2 px-2 py-1 text-xs cursor-pointer rounded-xs ${
                          isSelected
                            ? 'bg-blue-900 text-white'
                            : 'hover:bg-blue-100 text-gray-900'
                        }`}
                      >
                        <div className="shrink-0">{getFileIcon(file)}</div>
                        <span className="font-medium flex-1 truncate">{file.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{formatFileSize(file.sizeBytes)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Details Table View */}
              {viewStyle === 'details' && (
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold text-[11px]">
                      <th className="p-1.5">Nome</th>
                      <th className="p-1.5">Tipo</th>
                      <th className="p-1.5">Tamanho</th>
                      <th className="p-1.5">Modificado</th>
                      <th className="p-1.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      const isSelected = selectedFileId === file.id;
                      return (
                        <tr
                          key={file.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFileId(file.id);
                          }}
                          onDoubleClick={() => handleOpenFile(file)}
                          className={`border-b border-gray-200 cursor-pointer ${
                            isSelected ? 'bg-blue-900 text-white' : 'hover:bg-blue-50 text-gray-900'
                          }`}
                        >
                          <td className="p-1.5 flex items-center gap-2 font-medium">
                            <span className="shrink-0">{getFileIcon(file)}</span>
                            <span className="truncate max-w-[180px]">{file.name}</span>
                          </td>
                          <td className="p-1.5 uppercase text-[10px]">{file.extension || file.type}</td>
                          <td className="p-1.5 font-mono text-[10px]">{formatFileSize(file.sizeBytes)}</td>
                          <td className="p-1.5 text-[10px] text-gray-500">{new Date(file.updatedAt).toLocaleDateString()}</td>
                          <td className="p-1.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFile(file);
                                }}
                                className="p-1 hover:bg-gray-300 rounded cursor-pointer"
                                title="Abrir"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(file);
                                }}
                                className="p-1 hover:bg-gray-300 rounded cursor-pointer"
                                title="Baixar"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(file.id);
                                }}
                                className="p-1 hover:bg-red-200 text-red-700 rounded cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-2 py-1 border-t border-gray-400 bg-[#c0c0c0] text-[11px] text-gray-800 flex justify-between font-mono">
          <span>{filteredFiles.length} objeto(s)</span>
          <span>{formatFileSize(totalSize)}</span>
          <span className="text-gray-600">Meu Computador // LocalStorage</span>
        </div>

        {/* File Context Menu */}
        {fileContextMenu?.visible && (
          <div
            style={{ top: `${fileContextMenu.y}px`, left: `${fileContextMenu.x}px` }}
            className="fixed z-50 w-44 bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 shadow-xl py-1 text-xs font-sans text-gray-900 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                handleOpenFile(fileContextMenu.targetFile);
                setFileContextMenu(null);
              }}
              className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer font-bold"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </button>
            <button
              onClick={() => {
                handleDownloadFile(fileContextMenu.targetFile);
                setFileContextMenu(null);
              }}
              className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar para o PC</span>
            </button>
            <button
              onClick={() => {
                handleDuplicate(fileContextMenu.targetFile.id);
                setFileContextMenu(null);
              }}
              className="w-full text-left px-3 py-1 hover:bg-blue-800 hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>
            <div className="h-px bg-gray-400 my-1 mx-1" />
            <button
              onClick={() => {
                handleDelete(fileContextMenu.targetFile.id);
                setFileContextMenu(null);
              }}
              className="w-full text-left px-3 py-1 hover:bg-red-800 hover:text-white text-red-800 flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          </div>
        )}

        {/* --- MODAL: CRIAR NOVO ARQUIVO NA PASTA --- */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 w-full max-w-md shadow-2xl p-4 space-y-3">
              {/* Modal Titlebar */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
                <span>CRIAR E SALVAR NOVO ARQUIVO NA PASTA</span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-0.5 hover:bg-red-600 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Type Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Tipo de Conteúdo:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateType('text')}
                    className={`p-2 border-2 rounded text-center cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                      createType === 'text' ? 'bg-blue-100 border-blue-800 text-blue-950' : 'bg-white border-gray-400 text-gray-800'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-blue-700" />
                    <span>Texto (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('paint')}
                    className={`p-2 border-2 rounded text-center cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                      createType === 'paint' ? 'bg-purple-100 border-purple-800 text-purple-950' : 'bg-white border-gray-400 text-gray-800'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-purple-700" />
                    <span>Desenho (.png)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('link')}
                    className={`p-2 border-2 rounded text-center cursor-pointer text-xs font-bold flex flex-col items-center gap-1 ${
                      createType === 'link' ? 'bg-emerald-100 border-emerald-800 text-emerald-950' : 'bg-white border-gray-400 text-gray-800'
                    }`}
                  >
                    <LinkIcon className="w-5 h-5 text-emerald-700" />
                    <span>Atalho (.url)</span>
                  </button>
                </div>
              </div>

              {/* File Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-800">Nome do Arquivo:</label>
                <input
                  type="text"
                  placeholder={createType === 'text' ? 'Minha_Anotacao.txt' : createType === 'paint' ? 'Desenho.png' : 'Site_Favorito.url'}
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-white border border-gray-600 px-2 py-1 text-xs focus:outline-none font-mono"
                />
              </div>

              {/* Dynamic Content Editor based on Type */}
              {createType === 'text' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">Conteúdo do Documento:</label>
                  <textarea
                    rows={6}
                    placeholder="Escreva suas anotações, ideias ou especificações técnicas aqui..."
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full bg-white border border-gray-600 p-2 text-xs font-mono focus:outline-none resize-none"
                  />
                </div>
              )}

              {createType === 'paint' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">Prancheta Pixel:</span>
                    <div className="flex items-center gap-1">
                      {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                        <div
                          key={c}
                          onClick={() => setPaintColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-4 h-4 rounded-full cursor-pointer border ${
                            paintColor === c ? 'ring-2 ring-blue-700' : 'border-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <canvas
                    ref={paintCanvasRef}
                    width={380}
                    height={160}
                    onMouseDown={startPaint}
                    onMouseMove={drawPaint}
                    onMouseUp={stopPaint}
                    onMouseLeave={stopPaint}
                    className="w-full h-40 bg-white border border-gray-600 cursor-crosshair block"
                  />
                </div>
              )}

              {createType === 'link' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-800">URL de Destino:</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com.br"
                    value={newFileContent}
                    onChange={(e) => setNewFileContent(e.target.value)}
                    className="w-full bg-white border border-gray-600 px-2 py-1 text-xs focus:outline-none font-mono"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-400">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-retro px-3 py-1 text-xs text-gray-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewFileSubmit}
                  className="btn-retro px-4 py-1 text-xs font-bold text-blue-950 bg-yellow-200 border-2 border-yellow-600 flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-green-800" />
                  <span>Salvar na Pasta</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL: VISUALIZADOR / EDITOR DE ARQUIVO --- */}
        {activeFile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-[#c0c0c0] border-2 border-white border-r-gray-800 border-b-gray-800 w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col font-sans">
              {/* Window Titlebar */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-blue-300" />
                  <span className="truncate">{activeFile.name} - Visualizador Mateus OS</span>
                </div>
                <button
                  onClick={() => setActiveFile(null)}
                  className="p-0.5 hover:bg-red-600 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Editor Toolbar */}
              <div className="flex items-center justify-between gap-2 p-2 border-b border-gray-400 bg-[#ece9d8] text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Nome:</span>
                  <input
                    type="text"
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                    className="bg-white border border-gray-600 px-2 py-0.5 text-xs font-mono w-48 sm:w-64"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveActiveFile}
                    className="btn-retro px-3 py-1 text-xs font-bold text-blue-950 flex items-center gap-1 cursor-pointer bg-yellow-100"
                  >
                    <Check className="w-3.5 h-3.5 text-green-800" />
                    <span>Salvar Alterações</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile(activeFile)}
                    className="btn-retro px-3 py-1 text-xs text-gray-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>

              {/* Body Content by Type */}
              <div className="flex-1 p-3 overflow-y-auto bg-white min-h-[250px]">
                {activeFile.type === 'image' || activeFile.type === 'paint' ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <img
                      src={activeFile.content}
                      alt={activeFile.name}
                      className="max-h-[350px] max-w-full rounded border border-gray-300 shadow-md object-contain"
                    />
                    <span className="text-xs text-gray-500 font-mono mt-3">
                      Tamanho: {formatFileSize(activeFile.sizeBytes)} • Formato: {activeFile.extension.toUpperCase()}
                    </span>
                  </div>
                ) : activeFile.type === 'link' ? (
                  <div className="p-6 text-center space-y-3">
                    <LinkIcon className="w-12 h-12 text-blue-600 mx-auto" />
                    <h3 className="font-bold text-sm text-gray-900">{activeFile.name}</h3>
                    <p className="text-xs font-mono text-gray-600 break-all">{activeFile.content}</p>
                    <a
                      href={activeFile.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-retro inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-blue-950 font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visitar Endereço</span>
                    </a>
                  </div>
                ) : (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full h-72 border-none outline-none font-mono text-xs text-gray-900 leading-relaxed resize-none p-1"
                    placeholder="Escreva aqui..."
                  />
                )}
              </div>

              {/* Status Bar */}
              <div className="p-1.5 border-t border-gray-400 bg-[#c0c0c0] text-[11px] font-mono text-gray-700 flex justify-between">
                <span>{editingContent.length} caracteres</span>
                <span>Última modificação: {new Date(activeFile.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // MODERN SPACE 2026 QUANTUM FOLDER VIEW
  // ===========================================================================
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className="flex flex-col h-full select-none font-sans text-slate-200 relative overflow-hidden"
    >
      {/* Hidden File Input for Physical Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Top Address & Breadcrumb Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">DESKTOP</span>
          <span className="text-slate-500">/</span>
          <span className="text-white font-bold tracking-wider">{folder.name.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono">
            {filteredFiles.length} ITENS SALVOS
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/10 font-mono">
            {formatFileSize(totalSize)}
          </span>
        </div>
      </div>

      {/* Modern Space Action Bar */}
      <div className="p-3 bg-slate-950/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setCreateType('text');
              setShowCreateModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Arquivo</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              fileInputRef.current?.click();
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Quantum</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setCreateType('paint');
              setShowCreateModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Desenho</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar arquivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-48"
          />
        </div>
      </div>

      {/* Drag Over Holographic Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-cyan-950/70 backdrop-blur-sm border-2 border-dashed border-cyan-400 flex flex-col items-center justify-center text-cyan-200 text-center p-6">
          <Upload className="w-14 h-14 mb-3 text-cyan-400 animate-bounce" />
          <h3 className="text-base font-bold font-mono text-white">Importação Quantum Direta</h3>
          <p className="text-xs font-mono text-cyan-300 mt-1">Solte os arquivos para salvar neste container 2026.</p>
        </div>
      )}

      {/* Modern Space Grid View */}
      <div
        onClick={() => setSelectedFileId(null)}
        className="flex-1 p-4 overflow-y-auto custom-scrollbar"
      >
        {filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-white tracking-wide">{folder.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
                Container quantum inicializado. Salve anotações, desenhos ou carregue arquivos do seu computador.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCreateType('text');
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 hover:bg-cyan-500/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Anotação</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-mono flex items-center gap-2 hover:bg-slate-800 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Enviar Arquivo</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredFiles.map((file) => {
              const isSelected = selectedFileId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFileId(file.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleOpenFile(file);
                  }}
                  className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative backdrop-blur-xl ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                      : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/40 hover:bg-slate-900/90'
                  }`}
                >
                  {/* File Header Icon & Type Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {file.type === 'image' || file.type === 'paint' ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/30 bg-black shrink-0">
                        <img src={file.content} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shrink-0">
                        {file.type === 'text' && <FileText className="w-5 h-5" />}
                        {file.type === 'code' && <FileCode className="w-5 h-5" />}
                        {file.type === 'link' && <LinkIcon className="w-5 h-5" />}
                        {file.type === 'file' && <GenericFileIcon className="w-5 h-5" />}
                      </div>
                    )}
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-slate-400 border border-white/10 uppercase">
                      {file.extension || file.type}
                    </span>
                  </div>

                  {/* File Title & Info */}
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 break-all">
                      {file.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {formatFileSize(file.sizeBytes)}
                    </p>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-slate-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFile(file);
                      }}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Abrir</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(file);
                        }}
                        className="p-1 hover:text-white transition cursor-pointer"
                        title="Baixar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file.id);
                        }}
                        className="p-1 hover:text-red-400 transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: CRIAR NOVO ARQUIVO SPACE 2026 --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(6,182,212,0.3)] p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>CRIAR ARQUIVO NO CONTAINER</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCreateType('text')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  createType === 'text'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Texto</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType('paint')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  createType === 'paint'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <Palette className="w-5 h-5 text-purple-400" />
                <span>Desenho</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType('link')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  createType === 'link'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <LinkIcon className="w-5 h-5 text-emerald-400" />
                <span>Link URL</span>
              </button>
            </div>

            {/* File Name */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold">Nome do Arquivo:</label>
              <input
                type="text"
                placeholder={createType === 'text' ? 'Anotacao_Quantum.txt' : createType === 'paint' ? 'Arte_Espacial.png' : 'Atalho.url'}
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Body / Content */}
            {createType === 'text' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">Conteúdo:</label>
                <textarea
                  rows={5}
                  placeholder="Escreva suas anotações, especificações ou ideias..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-none font-mono"
                />
              </div>
            )}

            {createType === 'paint' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Cores Quantum:</span>
                  <div className="flex items-center gap-1.5">
                    {['#22d3ee', '#38bdf8', '#a855f7', '#ec4899', '#22c55e', '#ffffff'].map((c) => (
                      <div
                        key={c}
                        onClick={() => setPaintColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-4 h-4 rounded-full cursor-pointer border ${
                          paintColor === c ? 'ring-2 ring-cyan-400' : 'border-black'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <canvas
                  ref={paintCanvasRef}
                  width={380}
                  height={150}
                  onMouseDown={startPaint}
                  onMouseMove={drawPaint}
                  onMouseUp={stopPaint}
                  onMouseLeave={stopPaint}
                  className="w-full h-36 bg-black rounded-xl border border-cyan-500/30 cursor-crosshair block"
                />
              </div>
            )}

            {createType === 'link' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">URL de Destino:</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-black/40 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNewFileSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar no Container</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SPACE 2026 FILE VIEWER / EDITOR --- */}
      {activeFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-mono">
          <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-bold text-xs tracking-wide truncate">
                  {activeFile.name}
                </span>
              </div>
              <button
                onClick={() => setActiveFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Título:</span>
                <input
                  type="text"
                  value={editingFileName}
                  onChange={(e) => setEditingFileName(e.target.value)}
                  className="bg-black/60 border border-white/10 px-2 py-1 rounded text-white text-xs w-44 sm:w-56 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveActiveFile}
                  className="px-3 py-1 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer hover:bg-cyan-500/30 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(activeFile)}
                  className="px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-[260px]">
              {activeFile.type === 'image' || activeFile.type === 'paint' ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <img
                    src={activeFile.content}
                    alt={activeFile.name}
                    className="max-h-[350px] max-w-full rounded-2xl border border-cyan-500/30 shadow-2xl object-contain"
                  />
                  <span className="text-xs text-cyan-400 font-mono mt-3">
                    DIMENSÃO: {formatFileSize(activeFile.sizeBytes)} • FORMATO: {activeFile.extension.toUpperCase()}
                  </span>
                </div>
              ) : activeFile.type === 'link' ? (
                <div className="p-8 text-center space-y-4">
                  <LinkIcon className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h3 className="font-bold text-base text-white">{activeFile.name}</h3>
                  <p className="text-xs font-mono text-cyan-300 break-all">{activeFile.content}</p>
                  <a
                    href={activeFile.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Acessar Hiperlink Externo</span>
                  </a>
                </div>
              ) : (
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full h-72 bg-transparent text-slate-200 border-none outline-none font-mono text-xs leading-relaxed resize-none"
                  placeholder="Escreva aqui..."
                />
              )}
            </div>

            {/* Bottom info */}
            <div className="p-3 bg-black/60 border-t border-white/10 text-[11px] text-slate-400 flex justify-between">
              <span>{editingContent.length} CARACTERES</span>
              <span className="text-cyan-400">STATUS: SINCRONIZADO EM LOCALSTORAGE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

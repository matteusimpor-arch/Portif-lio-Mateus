import { FolderFileItem } from '../types';

const STORAGE_KEY_PREFIX = 'mateus_folder_files_';

export const getFolderFiles = (folderId: string): FolderFileItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${folderId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    // Return a default welcome file for newly created folders
    const defaultFile: FolderFileItem = {
      id: `file-welcome-${folderId}`,
      folderId,
      name: 'Bem-vindo_a_esta_pasta.txt',
      type: 'text',
      extension: 'txt',
      content: `MATEUS OS - SISTEMA DE ARQUIVOS E PASTAS\n=========================================\n\nVocê pode salvar qualquer conteúdo dentro desta pasta:\n\n1. Criar novos Documentos de Texto (.txt) ou Anotações\n2. Criar Desenhos e Pinturas Pixel Art (.bmp / .png)\n3. Salvar Links e Atalhos da Web (.url)\n4. Carregar/Enviar arquivos do seu computador (Imagens, PDFs, Documentos, etc.) ou arrastar e soltar direto na janela!\n5. Baixar seus arquivos salvos a qualquer momento.\n\nExperimente clicar no botão "Novo Arquivo" ou "Enviar Arquivo" na barra de ferramentas acima!`,
      sizeBytes: 520,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveFolderFiles(folderId, [defaultFile]);
    return [defaultFile];
  } catch (e) {
    console.error('Error loading folder files:', e);
    return [];
  }
};

export const saveFolderFiles = (folderId: string, files: FolderFileItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${folderId}`, JSON.stringify(files));
    window.dispatchEvent(new CustomEvent('folder-files-changed', { detail: { folderId } }));
  } catch (e) {
    console.error('Error saving folder files:', e);
  }
};

export const addFolderFile = (file: Omit<FolderFileItem, 'id' | 'createdAt' | 'updatedAt'>): FolderFileItem => {
  const newFile: FolderFileItem = {
    ...file,
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const currentFiles = getFolderFiles(file.folderId);
  const updatedFiles = [newFile, ...currentFiles];
  saveFolderFiles(file.folderId, updatedFiles);
  return newFile;
};

export const updateFolderFile = (
  folderId: string,
  fileId: string,
  updates: Partial<FolderFileItem>
): void => {
  const currentFiles = getFolderFiles(folderId);
  const updatedFiles = currentFiles.map((f) =>
    f.id === fileId ? { ...f, ...updates, updatedAt: Date.now() } : f
  );
  saveFolderFiles(folderId, updatedFiles);
};

export const deleteFolderFile = (folderId: string, fileId: string): void => {
  const currentFiles = getFolderFiles(folderId);
  const updatedFiles = currentFiles.filter((f) => f.id !== fileId);
  saveFolderFiles(folderId, updatedFiles);
};

export const duplicateFolderFile = (folderId: string, fileId: string): FolderFileItem | null => {
  const currentFiles = getFolderFiles(folderId);
  const target = currentFiles.find((f) => f.id === fileId);
  if (!target) return null;

  const baseName = target.name.replace(/\.[^/.]+$/, '');
  const ext = target.extension ? `.${target.extension}` : '';
  const copyName = `${baseName}_copia${ext}`;

  const copyFile: FolderFileItem = {
    ...target,
    id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: copyName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveFolderFiles(folderId, [copyFile, ...currentFiles]);
  return copyFile;
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

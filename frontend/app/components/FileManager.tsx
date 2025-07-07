'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle, FaTimes, FaTrash } from 'react-icons/fa';
import { UploadedFile } from './PDFUpload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FileManagerProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onClearAll: () => void;
}

export default function FileManager({ files, onFilesChange, onClearAll }: FileManagerProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/clear-files`);
      onClearAll();
    } catch (error) {
      console.error('Failed to clear files:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const toggleFileRAG = (fileName: string) => {
    const updatedFiles = files.map(file => 
      file.name === fileName 
        ? { ...file, includedInRAG: !file.includedInRAG }
        : file
    );
    onFilesChange(updatedFiles);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = files.filter(file => file.name !== fileName);
    onFilesChange(updatedFiles);
    
    // If no files left, clear the backend state
    if (updatedFiles.length === 0) {
      handleClearAll();
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📁';
    }
  };

  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'success':
        return <FaCheckCircle className="text-neon-green text-sm" />;
      case 'error':
        return <FaExclamationCircle className="text-red-400 text-sm" />;
      case 'uploading':
        return <div className="w-3 h-3 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-dark border-2 border-neon-blue rounded-lg shadow-neon p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-neon-blue font-orbitron text-lg">Uploaded Files</h3>
        <button
          onClick={handleClearAll}
          disabled={isClearing}
          className="text-neon-pink hover:text-red-500 text-xs font-orbitron flex items-center gap-1 disabled:opacity-50"
          title="Clear all files"
        >
          <FaTrash className="text-sm" />
          Clear All
        </button>
      </div>
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              file.status === 'success' 
                ? 'border-neon-green bg-neon-green/10' 
                : file.status === 'error'
                ? 'border-red-400 bg-red-400/10'
                : 'border-neon-pink bg-neon-pink/10'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(file)}</span>
              {getStatusIcon(file)}
              <span className={`font-orbitron text-sm truncate ${
                file.status === 'success' ? 'text-neon-green' : 
                file.status === 'error' ? 'text-red-400' : 'text-neon-pink'
              }`}>
                {file.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {file.status === 'success' && (
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={file.includedInRAG}
                    onChange={() => toggleFileRAG(file.name)}
                    className="accent-neon-green w-3 h-3"
                    title="Include in RAG"
                  />
                  <span className="text-neon-green text-xs font-orbitron">RAG</span>
                </label>
              )}
              
              <button
                onClick={() => removeFile(file.name)}
                className="text-neon-pink hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {files.some(f => f.status === 'success') && (
        <div className="mt-3 p-2 bg-neon-blue/10 border border-neon-blue rounded text-xs text-neon-blue font-orbitron">
          💡 Toggle RAG for individual files to control which ones are used for context-aware responses.
        </div>
      )}
    </div>
  );
} 
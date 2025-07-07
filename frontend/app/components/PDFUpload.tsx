'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { FaFileUpload, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FileUploadProps {
  onFilesUploaded: (hasFiles: boolean) => void;
  onRAGToggle: (rag: boolean) => void;
  hasFiles: boolean;
  ragEnabled: boolean;
}

interface UploadedFile {
  name: string;
  status: 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

export default function FileUpload({ onFilesUploaded, onRAGToggle, hasFiles, ragEnabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'uploading'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const invalidFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !allowedTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      setUploadStatus('error');
      setErrorMsg(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Allowed: PDF, DOCX, TXT`);
      return;
    }

    setUploadStatus('uploading');
    setErrorMsg(null);

    // Initialize files with uploading status
    const initialFiles: UploadedFile[] = files.map(file => ({
      name: file.name,
      status: 'uploading'
    }));
    setUploadedFiles(initialFiles);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/api/upload-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadStatus('success');
      setErrorMsg(null);
      
      // Update files with success status
      setUploadedFiles(files.map(file => ({
        name: file.name,
        status: 'success'
      })));

      onFilesUploaded(true);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMsg(error.response?.data?.detail || 'Upload failed');
      
      // Update files with error status
      setUploadedFiles(files.map(file => ({
        name: file.name,
        status: 'error',
        errorMsg: error.response?.data?.detail || 'Upload failed'
      })));

      onFilesUploaded(false);
    }
  };

  const handleClearFiles = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/clear-files`);
      setUploadStatus('idle');
      setUploadedFiles([]);
      setErrorMsg(null);
      onFilesUploaded(false);
      onRAGToggle(false);
    } catch (error) {
      setUploadStatus('error');
      setErrorMsg('Failed to clear files');
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
    if (uploadedFiles.length <= 1) {
      onFilesUploaded(false);
      onRAGToggle(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* File Upload Icon Button */}
      <button
        type="button"
        onClick={handleIconClick}
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-neon-pink bg-dark hover:bg-neon-pink/20 transition-colors shadow-neon focus:outline-none focus:ring-2 focus:ring-neon-pink ${uploadStatus === 'uploading' ? 'animate-pulse' : ''}`}
        title={hasFiles ? 'Files loaded' : 'Upload bootcamp files (PDF, DOCX, TXT)'}
      >
        <FaFileUpload className="text-neon-pink text-2xl" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-1">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-1 text-xs font-orbitron">
              {file.status === 'success' && (
                <FaCheckCircle className="text-neon-green text-sm" />
              )}
              {file.status === 'error' && (
                <FaExclamationCircle className="text-red-400 text-sm" />
              )}
              {file.status === 'uploading' && (
                <div className="w-3 h-3 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
              )}
              <span className={`truncate max-w-[120px] ${
                file.status === 'success' ? 'text-neon-green' : 
                file.status === 'error' ? 'text-red-400' : 'text-neon-pink'
              }`}>
                {file.name}
              </span>
              {file.status === 'success' && (
                <button
                  onClick={() => removeFile(file.name)}
                  className="ml-1 text-neon-pink hover:text-red-500 text-xs"
                  title="Remove file"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'error' && errorMsg && (
        <span className="flex items-center gap-1 text-red-400 text-xs font-orbitron">
          <FaExclamationCircle className="text-sm" />
          {errorMsg}
        </span>
      )}

      {/* Clear All Button */}
      {hasFiles && (
        <button
          onClick={handleClearFiles}
          className="text-neon-pink hover:text-red-500 text-xs font-orbitron"
          title="Clear all files"
        >
          Clear All
        </button>
      )}

      {/* RAG Toggle */}
      {hasFiles && (
        <label className="flex items-center gap-1 ml-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={ragEnabled}
            onChange={e => onRAGToggle(e.target.checked)}
            className="accent-neon-green w-4 h-4"
          />
          <span className="text-neon-green text-xs font-orbitron">RAG</span>
        </label>
      )}
    </div>
  );
} 
'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { FaFileUpload, FaExclamationCircle } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface FileUploadProps {
  onFilesUploaded: (hasFiles: boolean, files: UploadedFile[]) => void;
  onRAGToggle: (rag: boolean) => void;
  hasFiles: boolean;
  ragEnabled: boolean;
}

export interface UploadedFile {
  name: string;
  status: 'uploading' | 'success' | 'error';
  errorMsg?: string;
  includedInRAG?: boolean;
}

export default function FileUpload({ onFilesUploaded, onRAGToggle, hasFiles, ragEnabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'uploading'>('idle');
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
      status: 'uploading',
      includedInRAG: true // Default to included
    }));

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
      const successFiles: UploadedFile[] = files.map(file => ({
        name: file.name,
        status: 'success',
        includedInRAG: true
      }));

      onFilesUploaded(true, successFiles);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMsg(error.response?.data?.detail || 'Upload failed');
      
      // Update files with error status
      const errorFiles: UploadedFile[] = files.map(file => ({
        name: file.name,
        status: 'error',
        errorMsg: error.response?.data?.detail || 'Upload failed',
        includedInRAG: false
      }));

      onFilesUploaded(false, errorFiles);
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
      
      {/* Status Messages */}
      {uploadStatus === 'error' && errorMsg && (
        <span className="flex items-center gap-1 text-red-400 text-xs font-orbitron">
          <FaExclamationCircle className="text-sm" />
          {errorMsg}
        </span>
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
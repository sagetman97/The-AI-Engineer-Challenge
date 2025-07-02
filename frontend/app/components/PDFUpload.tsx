'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { FaFilePdf, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PDFUploadProps {
  onPDFUploaded: (hasPDF: boolean) => void;
  onRAGToggle: (rag: boolean) => void;
  hasPDF: boolean;
  ragEnabled: boolean;
}

export default function PDFUpload({ onPDFUploaded, onRAGToggle, hasPDF, ragEnabled }: PDFUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'uploading'>('idle');
  const [filename, setFilename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus('error');
      setErrorMsg('Only PDF files are allowed!');
      return;
    }
    setUploadStatus('uploading');
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/api/upload-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('success');
      setFilename(file.name);
      setErrorMsg(null);
      onPDFUploaded(true);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMsg(error.response?.data?.detail || 'Upload failed');
      setFilename(null);
      onPDFUploaded(false);
    }
  };

  const handleClearPDF = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/clear-pdf`);
      setUploadStatus('idle');
      setFilename(null);
      setErrorMsg(null);
      onPDFUploaded(false);
      onRAGToggle(false);
    } catch (error) {
      setUploadStatus('error');
      setErrorMsg('Failed to clear PDF');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* PDF Icon Button */}
      <button
        type="button"
        onClick={handleIconClick}
        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-neon-pink bg-dark hover:bg-neon-pink/20 transition-colors shadow-neon focus:outline-none focus:ring-2 focus:ring-neon-pink ${uploadStatus === 'uploading' ? 'animate-pulse' : ''}`}
        title={hasPDF ? 'PDF loaded' : 'Attach PDF'}
      >
        <FaFilePdf className="text-neon-pink text-2xl" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      {/* Status Indicator */}
      {uploadStatus === 'success' && filename && (
        <span className="flex items-center gap-1 text-neon-green text-xs font-orbitron">
          <FaCheckCircle className="text-lg" />
          <span className="truncate max-w-[80px]">{filename}</span>
          <button
            onClick={handleClearPDF}
            className="ml-1 text-neon-pink hover:text-red-500 text-xs"
            title="Remove PDF"
          >
            ✕
          </button>
        </span>
      )}
      {uploadStatus === 'error' && (
        <span className="flex items-center gap-1 text-red-400 text-xs font-orbitron">
          <FaExclamationCircle className="text-lg" />
          {errorMsg}
        </span>
      )}
      {/* RAG Toggle */}
      {hasPDF && (
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
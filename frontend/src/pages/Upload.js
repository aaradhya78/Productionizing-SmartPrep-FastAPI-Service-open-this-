import React, { useState, useEffect } from 'react';
import { UploadCloud, File, Trash2, Edit2, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const Upload = () => {
  const toast = useToast();
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await apiService.materials.get();
      setUploadedMaterials(data);
    } catch {
      toast.error('Failed to load materials list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const processFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      name: file.name,
      size: file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        : (file.size / 1024).toFixed(1) + ' KB',
      raw: file
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) processFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    try {
      const raws = selectedFiles.map(f => f.raw);
      const res = await apiService.materials.upload(raws);
      if (res.success) {
        toast.success(`Successfully uploaded ${selectedFiles.length} file(s)!`);
        setSelectedFiles([]);
        loadMaterials();
      }
    } catch {
      toast.error('Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = (idx) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDelete = async (id, filename) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      try {
        await apiService.materials.delete(id);
        toast.success('Material deleted successfully.');
        loadMaterials();
      } catch {
        toast.error('Failed to delete material.');
      }
    }
  };

  const startRename = (id, currentName) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameSubmit = async (id) => {
    if (!renameValue.trim()) return;
    try {
      await apiService.materials.rename(id, renameValue.trim());
      toast.success('Material renamed successfully.');
      setRenamingId(null);
      loadMaterials();
    } catch {
      toast.error('Failed to rename material.');
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      toast.info(`Downloading ${filename}...`);
      await apiService.materials.download(id, filename);
    } catch {
      toast.error('Download failed.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">Study Materials</h2>
        <p className="page-header-sub">Upload your PDFs, documents, and slides for AI notes and quiz generation.</p>
      </div>

      {/* Upload Zone */}
      <label
        className="upload-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <UploadCloud size={40} className="upload-dropzone-icon" />
        <h3>Drop files here or click to browse</h3>
        <p>Supports PDF, DOCX, PPTX — up to 50 MB each</p>
        <span className="upload-browse-btn">
          <UploadCloud size={15} /> Browse Files
        </span>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          style={{ display: 'none' }}
        />
      </label>

      {/* Selected queue */}
      {selectedFiles.length > 0 && (
        <div className="feature-card">
          <div className="file-list-header">
            <p className="section-label">Ready to Upload ({selectedFiles.length})</p>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={isUploading}
              isLoading={isUploading}
            >
              Upload All
            </Button>
          </div>

          {selectedFiles.map((file, idx) => (
            <div key={idx} className="file-item">
              <div className="file-icon-wrap"><File size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{file.size}</p>
              </div>
              <button className="remove-btn" onClick={() => removeSelectedFile(idx)} aria-label="Remove file">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Materials List */}
      <div className="feature-card">
        <div className="file-list-header">
          <p className="section-label">My Study Materials</p>
          <button onClick={loadMaterials} className="refresh-btn" title="Refresh files" aria-label="Refresh files">
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton height="54px" />
            <Skeleton height="54px" />
          </div>
        ) : uploadedMaterials.length === 0 ? (
          <div className="empty-materials-state">
            <File size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p>No materials uploaded yet. Drop a PDF file above to get started!</p>
          </div>
        ) : (
          uploadedMaterials.map((material) => (
            <div key={material.id} className="file-item">
              <div className="file-icon-wrap"><File size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {renamingId === material.id ? (
                  <div className="rename-row">
                    <input
                      type="text"
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(material.id)}
                      autoFocus
                    />
                    <Button variant="primary" size="sm" onClick={() => handleRenameSubmit(material.id)} style={{ height: '28px', padding: '0 8px' }}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRenamingId(null)} style={{ height: '28px', padding: '0 8px' }}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="file-name">{material.filename}</p>
                    <p className="file-size">
                      Uploaded {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              
              {renamingId !== material.id && (
                <div className="file-actions">
                  <button className="file-action-btn" onClick={() => startRename(material.id, material.filename)} title="Rename" aria-label="Rename file">
                    <Edit2 size={15} />
                  </button>
                  <button className="file-action-btn" onClick={() => handleDownload(material.id, material.filename)} title="Download" aria-label="Download file">
                    <Download size={15} />
                  </button>
                  <button className="file-action-btn danger" onClick={() => handleDelete(material.id, material.filename)} title="Delete" aria-label="Delete file">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Upload;
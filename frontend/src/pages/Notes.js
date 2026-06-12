import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Edit2, Trash2, Download, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiService } from '../api/apiService';
import { useToast } from '../context/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import './pages.css';

const Notes = () => {
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState(null);

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const notesList = await apiService.notes.get();
      const mats = await apiService.materials.get();
      setNotes(notesList);
      setMaterials(mats);
      if (mats.length > 0) setSelectedMaterial(mats[0].id);
    } catch {
      toast.error('Failed to load notes or materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateNotes = async () => {
    if (!selectedMaterial) {
      toast.warning('Please select a study material first.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await apiService.notes.generate(selectedMaterial);
      if (res.success) {
        toast.success(`Generated ${res.notes.length} note sections!`);
        // Expand the first new note
        if (res.notes.length > 0) setExpandedNote(res.notes[0].id);
        loadData();
      }
    } catch {
      toast.error('Failed to generate notes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = (note, e) => {
    e.stopPropagation();
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setExpandedNote(note.id); // Ensure it's expanded
  };

  const handleSaveEdit = async (id, e) => {
    e.stopPropagation();
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      await apiService.notes.update(id, { title: editTitle.trim(), content: editContent.trim() });
      toast.success('Note updated successfully.');
      setEditingId(null);
      loadData();
    } catch {
      toast.error('Failed to save changes.');
    }
  };

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete notes for "${title}"?`)) {
      try {
        await apiService.notes.delete(id);
        toast.success('Note deleted.');
        loadData();
      } catch {
        toast.error('Failed to delete note.');
      }
    }
  };

  const handleExportPDF = (note, e) => {
    e.stopPropagation();
    try {
      toast.info(`Exporting "${note.title}" to PDF...`);
      // Create a print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Popup blocked. Please enable popups to export.');
        return;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${note.title}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              padding: 40px;
              color: #0F172A;
              line-height: 1.6;
            }
            .header {
              border-bottom: 2px solid #E2E8F0;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .topic {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              color: #2563EB;
              letter-spacing: 0.05em;
            }
            h1 {
              font-size: 24px;
              margin: 8px 0 0 0;
              font-weight: 700;
              letter-spacing: -0.02em;
            }
            .content {
              font-size: 14px;
              white-space: pre-wrap;
              color: #334155;
            }
            .footer {
              margin-top: 48px;
              font-size: 11px;
              color: #94A3B8;
              text-align: center;
              border-top: 1px solid #E2E8F0;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="topic">${note.topic}</div>
            <h1>${note.title}</h1>
          </div>
          <div class="content">${note.content}</div>
          <div class="footer">
            Generated via SmartPrep AI
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch {
      toast.error('Failed to export PDF.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-header-title">AI Notes</h2>
        <p className="page-header-sub">Generate and manage key takeaways from your study materials.</p>
      </div>

      {/* Select and generate */}
      <div className="action-banner">
        <div className="action-banner-info">
          <div className="action-banner-icon"><BookOpen size={20} /></div>
          <div>
            <p className="action-banner-title">Generate Study Notes</p>
            <p className="action-banner-sub">Select material to summarize and extract main topics.</p>
          </div>
        </div>
        
        <div className="notes-generation-controls">
          <select
            className="form-select"
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            disabled={isGenerating || materials.length === 0}
            style={{ marginRight: '12px', height: '36px', fontSize: '0.875rem' }}
          >
            {materials.length === 0 ? (
              <option>No materials available</option>
            ) : (
              materials.map(m => (
                <option key={m.id} value={m.id}>{m.filename}</option>
              ))
            )}
          </select>
          <Button
            variant="primary"
            onClick={generateNotes}
            disabled={isGenerating || materials.length === 0}
            isLoading={isGenerating}
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="loading-state">
          <Skeleton height="20px" width="150px" style={{ marginBottom: '16px' }} />
          <Skeleton height="14px" width="100%" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" width="100%" style={{ marginBottom: '8px' }} />
          <Skeleton height="14px" width="80%" />
          <p style={{ marginTop: '16px' }}>AI is extracting concepts and compiling smart notes…</p>
        </div>
      )}

      {/* Notes Accordion */}
      {!isGenerating && (
        <div className="feature-card">
          <div className="file-list-header">
            <p className="section-label">My Study Notes ({notes.length})</p>
            <button onClick={loadData} className="refresh-btn" title="Refresh notes" aria-label="Refresh notes">
              <RefreshCw size={15} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton height="48px" />
              <Skeleton height="48px" />
            </div>
          ) : notes.length === 0 ? (
            <div className="loading-state" style={{ border: 'none', padding: '1rem 0' }}>
              <p>No notes generated yet. Select a material above and click "Generate".</p>
            </div>
          ) : (
            <div className="notes-accordion">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <div
                    className="note-header"
                    onClick={() => editingId !== note.id && setExpandedNote(expandedNote === note.id ? null : note.id)}
                  >
                    <div className="note-title-area">
                      {editingId === note.id ? (
                        <input
                          type="text"
                          className="rename-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontWeight: 600, fontSize: '0.9375rem', width: '250px' }}
                        />
                      ) : (
                        <>
                          <span className="topic-badge">{note.topic}</span>
                          <h4>{note.title}</h4>
                        </>
                      )}
                    </div>
                    
                    <div className="note-header-actions">
                      {editingId === note.id ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="note-action-btn success" onClick={(e) => handleSaveEdit(note.id, e)} title="Save" aria-label="Save note">
                            <Check size={16} />
                          </button>
                          <button className="note-action-btn" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} title="Cancel" aria-label="Cancel editing">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="note-action-btn" onClick={(e) => handleStartEdit(note, e)} title="Edit note" aria-label="Edit note">
                            <Edit2 size={14} />
                          </button>
                          <button className="note-action-btn" onClick={(e) => handleExportPDF(note, e)} title="Export PDF" aria-label="Export note to PDF">
                            <Download size={14} />
                          </button>
                          <button className="note-action-btn danger" onClick={(e) => handleDelete(note.id, note.title, e)} title="Delete note" aria-label="Delete note">
                            <Trash2 size={14} />
                          </button>
                          <button className="expand-btn" aria-label={expandedNote === note.id ? 'Collapse' : 'Expand'}>
                            {expandedNote === note.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedNote === note.id && (
                    <div className="note-body">
                      {editingId === note.id ? (
                        <textarea
                          className="note-edit-textarea"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          style={{
                            width: '100%',
                            fontFamily: 'inherit',
                            fontSize: '0.875rem',
                            padding: '8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--surface-color)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            lineHeight: 1.6
                          }}
                        />
                      ) : (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notes;
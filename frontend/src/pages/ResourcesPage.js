import React, { useCallback, useEffect, useState } from 'react';
import {
  createResource,
  deleteResource,
  getBucketPdfs,
  getResourceDownload,
  getResources,
  updateResource,
  uploadResourcePdf,
} from '../api/resourceApi';
import { useAuth } from '../context/AuthContext';

const TYPES = [
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'Previous-year paper' },
  { value: 'important-questions', label: 'Important questions' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  subject: '',
  topic: '',
  type: 'notes',
  s3Key: '',
  originalFileName: '',
};

const ResourceCard = ({ resource, onDownload, canManage, onEdit, onDelete }) => (
  <article className="resource-card">
    <div className="resource-card-top">
      <span className={`resource-type type-${resource.type}`}>
        {TYPES.find((type) => type.value === resource.type)?.label || resource.type}
      </span>
      <span className="resource-date">
        {new Date(resource.createdAt).toLocaleDateString()}
      </span>
    </div>
    <h3>{resource.title}</h3>
    <p className="resource-subject">{resource.subject} <span>·</span> {resource.topic}</p>
    {resource.description && <p className="resource-description">{resource.description}</p>}
    <p className="resource-file">PDF · {resource.originalFileName}</p>
    <div className="resource-card-actions">
      <button className="btn btn-primary btn-sm" onClick={() => onDownload(resource)}>
        Open PDF
      </button>
      {canManage && (
        <>
          <button className="btn btn-outline btn-sm" onClick={() => onEdit(resource)}>Edit</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onDelete(resource)}>Delete</button>
        </>
      )}
    </div>
    <p className="resource-uploader">Published by {resource.uploadedBy?.name || 'Teacher'}</p>
  </article>
);

const ResourcesPage = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const [resources, setResources] = useState([]);
  const [myResources, setMyResources] = useState([]);
  const [filters, setFilters] = useState({ q: '', type: 'all' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [bucketPdfs, setBucketPdfs] = useState([]);
  const [bucketCursor, setBucketCursor] = useState(null);
  const [loadingBucket, setLoadingBucket] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.type !== 'all') params.type = filters.type;
      const data = await getResources(params);
      setResources(data.resources);
      setPages(Math.max(1, data.pagination.pages));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadMyResources = useCallback(async () => {
    if (!isTeacher) return;
    try {
      const data = await getResources({ mine: 'true', limit: 50 });
      setMyResources(data.resources);
    } catch (err) {
      setError(err.message);
    }
  }, [isTeacher]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    loadMyResources();
  }, [loadMyResources]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setEditingId(null);
  };

  const handleBucketList = async (loadMore = false) => {
    setLoadingBucket(true);
    setError('');
    try {
      const data = await getBucketPdfs(loadMore ? bucketCursor : null);
      setBucketPdfs((current) => loadMore ? [...current, ...data.files] : data.files);
      setBucketCursor(data.nextCursor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingBucket(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      let s3Key = form.s3Key;
      let originalFileName = form.originalFileName;
      if (selectedFile) {
        const uploaded = await uploadResourcePdf(selectedFile);
        s3Key = uploaded.key;
        originalFileName = uploaded.originalFileName;
      }
      if (!s3Key) {
        throw new Error('Upload a PDF or select an existing stored PDF.');
      }
      const payload = { ...form, s3Key, originalFileName };
      if (editingId) {
        await updateResource(editingId, payload);
        setNotice('Resource updated.');
      } else {
        await createResource(payload);
        setNotice('Resource published.');
      }
      resetForm();
      await Promise.all([loadResources(), loadMyResources()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (resource) => {
    setError('');
    try {
      const file = await getResourceDownload(resource._id);
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resource.originalFileName || 'resource.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (resource) => {
    setError('');
    setNotice('');
    setEditingId(resource._id);
    setForm({
      title: resource.title,
      description: resource.description || '',
      subject: resource.subject,
      topic: resource.topic,
      type: resource.type,
      s3Key: resource.s3Key,
      originalFileName: resource.originalFileName,
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Remove "${resource.title}" from the resource hub? The PDF file will be kept.`)) {
      return;
    }
    setError('');
    setNotice('');
    try {
      await deleteResource(resource._id);
      if (editingId === resource._id) resetForm();
      setNotice('Resource removed from the hub.');
      await Promise.all([loadResources(), loadMyResources()]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="resource-hub">
      <header className="hub-heading">
        <div>
          <p className="eyebrow">{isTeacher ? 'TEACHER DASHBOARD' : 'STUDENT PORTAL'}</p>
          <h1>
            {isTeacher 
              ? '📚 Manage Your Resources' 
              : '🔍 Discover Learning Materials'}
          </h1>
          <p className="hub-intro">
            {isTeacher
              ? 'Upload, organize, and share educational content with your students.'
              : 'Access course notes, previous-year papers, and important questions all in one place.'}
          </p>
        </div>
        <div className="hub-user-badge">
          <span className="hub-user-initial">{user?.name?.charAt(0).toUpperCase()}</span>
          <span>
            <strong>{user?.name}</strong>
            <small>{isTeacher ? '👨‍🏫 Teacher Account' : '👨‍🎓 Student Account'}</small>
          </span>
        </div>
      </header>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {isTeacher && (
        <section className="teacher-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">📤 UPLOAD CENTER</p>
              <h2>{editingId ? '✏️ Edit Resource' : '➕ Publish New Resource'}</h2>
              <p className="section-subtitle">
                {editingId 
                  ? 'Update the details or replace the PDF file for this resource.'
                  : 'Share your knowledge by uploading educational materials for students.'}
              </p>
            </div>
            {editingId && <button className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>}
          </div>
          <form className="resource-form" onSubmit={handleSave}>
            <div className="resource-form-grid">
              <div className="form-group">
                <label htmlFor="resource-title">Title</label>
                <input id="resource-title" maxLength={120} required value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="resource-subject">Subject</label>
                <input id="resource-subject" maxLength={100} required value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="resource-topic">Topic / unit</label>
                <input id="resource-topic" maxLength={100} required value={form.topic}
                  onChange={(event) => setForm({ ...form, topic: event.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="resource-type">Resource type</label>
                <select id="resource-type" value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}>
                  {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div className="form-group resource-description-field">
                <label htmlFor="resource-description">Description <span>Optional</span></label>
                <textarea id="resource-description" rows={3} maxLength={1000} value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
            </div>

            <div className="resource-file-controls">
              <div className="form-group">
                <label htmlFor="resource-file">Upload a PDF (max 20 MB)</label>
                <input id="resource-file" type="file" accept="application/pdf,.pdf"
                  onChange={(event) => {
                    setSelectedFile(event.target.files[0] || null);
                    if (event.target.files[0]) setForm((current) => ({ ...current, s3Key: '' }));
                  }} />
              </div>
              <button type="button" className="btn btn-outline" onClick={() => handleBucketList(false)} disabled={loadingBucket}>
                {loadingBucket ? 'Loading files…' : 'Choose an existing PDF'}
              </button>
              {bucketPdfs.length > 0 && (
                <div className="form-group existing-pdf-select">
                  <label htmlFor="existing-pdf">Existing file</label>
                  <select id="existing-pdf" value={form.s3Key} onChange={(event) => {
                    const selected = bucketPdfs.find((file) => file.key === event.target.value);
                    setSelectedFile(null);
                    setForm((current) => ({
                      ...current,
                      s3Key: event.target.value,
                      originalFileName: selected?.fileName || '',
                    }));
                  }}>
                    <option value="">Select a PDF</option>
                    {bucketPdfs.map((file) => <option key={file.key} value={file.key}>{file.key}</option>)}
                  </select>
                  {bucketCursor && <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleBucketList(true)}>Load more</button>}
                </div>
              )}
            </div>
            {(selectedFile || form.originalFileName) && (
              <p className="selected-pdf">Selected PDF: {selectedFile?.name || form.originalFileName}</p>
            )}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving resource…' : editingId ? 'Save changes' : 'Publish resource'}
            </button>
          </form>
        </section>
      )}

      <section className="browse-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{isTeacher ? '📚 RESOURCE LIBRARY' : '🎓 AVAILABLE RESOURCES'}</p>
            <h2>{isTeacher ? 'All Published Resources' : 'Browse & Download'}</h2>
            <p className="section-subtitle">
              {isTeacher 
                ? 'View all resources in the system. You can edit or delete your own publications.'
                : 'Search and filter to find exactly what you need for your studies.'}
            </p>
          </div>
          {isTeacher && myResources.length > 0 && (
            <span className="resource-count">📝 {myResources.length} by you</span>
          )}
        </div>
        <div className="resource-filters">
          <label className="search-control" htmlFor="resource-search">
            <span aria-hidden="true">⌕</span>
            <input id="resource-search" type="search" placeholder="Search subject, topic, or title"
              value={filters.q}
              onChange={(event) => {
                setFilters((current) => ({ ...current, q: event.target.value }));
                setPage(1);
              }} />
          </label>
          <select aria-label="Filter by resource type" value={filters.type}
            onChange={(event) => {
              setFilters((current) => ({ ...current, type: event.target.value }));
              setPage(1);
            }}>
            <option value="all">All resource types</option>
            {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading resources…</div>
        ) : resources.length ? (
          <div className="resource-grid">
            {resources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} onDownload={handleDownload} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">▤</span>
            <h3>No resources found</h3>
            <p>Try another search, or check back when a teacher publishes new material.</p>
          </div>
        )}
        {pages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>

      {isTeacher && (
        <section className="manage-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🎯 MY PUBLICATIONS</p>
              <h2>Manage Your Resources</h2>
              <p className="section-subtitle">
                View, edit, or remove resources you've published. Click any resource to edit its details.
              </p>
            </div>
          </div>
          {myResources.length ? (
            <div className="resource-grid">
              {myResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} onDownload={handleDownload}
                  canManage onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          ) : <p className="muted-copy">You have not published any resources yet.</p>}
        </section>
      )}
    </main>
  );
};

export default ResourcesPage;

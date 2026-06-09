import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import { useNotes } from '../hooks/useNotes'
import { supabase } from '../supabase'

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics']
const EMPTY_FORM = { id: null, title: '', subject: 'Physics', chapter: '', topic: '' }
const STORAGE_BUCKET = 'note-attachments'
const MAX_FILES = 3
const MAX_SIZE = 3 * 1024 * 1024

const FILE_ICON = {
  'application/pdf': 'picture_as_pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
}

async function uploadFiles(userId, files) {
  const results = []
  for (const file of files) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: false })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path)
      results.push({ name: file.name, url: publicUrl, type: file.type })
    }
  }
  return results
}

function ToolBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{
        padding: '3px 8px',
        borderRadius: 5,
        border: '1px solid var(--border)',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#000' : 'var(--fg)',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.6,
      }}
    >
      {label}
    </button>
  )
}

function Toolbar({ editor }) {
  if (!editor) return null
  const c = () => editor.chain().focus()
  return (
    <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
      <ToolBtn label="B" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()} />
      <ToolBtn label="I" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()} />
      <ToolBtn label="S" active={editor.isActive('strike')} onClick={() => c().toggleStrike().run()} />
      <ToolBtn label="H2" active={editor.isActive('heading', { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <ToolBtn label="H3" active={editor.isActive('heading', { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <ToolBtn label="• List" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()} />
      <ToolBtn label="1. List" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()} />
      <ToolBtn label="Code" active={editor.isActive('code')} onClick={() => c().toggleCode().run()} />
    </div>
  )
}

function FileChip({ name, type, onRemove, pending }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 6,
        border: `1px solid ${pending ? 'var(--primary)' : 'var(--border)'}`,
        background: 'var(--surface)',
        fontSize: 12, color: 'var(--fg)',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
        {FILE_ICON[type] || 'attach_file'}
      </span>
      {name}
      <button
        type="button"
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#ef4444' }}
        aria-label="Remove"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
      </button>
    </span>
  )
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{note.title}</h3>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button className="btn-ghost" style={{ padding: '4px 6px', borderRadius: 6 }} onClick={() => onEdit(note)} aria-label="Edit note">
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
          </button>
          <button className="btn-ghost" style={{ padding: '4px 6px', borderRadius: 6, color: '#ef4444' }} onClick={() => onDelete(note.id)} aria-label="Delete note">
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
          </button>
        </div>
      </div>
      {(note.chapter || note.topic) && (
        <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
          {[note.chapter, note.topic].filter(Boolean).join(' · ')}
        </p>
      )}
      {note.content && (
        <div className="note-card-preview" dangerouslySetInnerHTML={{ __html: note.content }} />
      )}
      {note.attachments?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {note.attachments.map((att, i) => (
            <a
              key={i}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--on-sv)', fontSize: 12,
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {FILE_ICON[att.type] || 'attach_file'}
              </span>
              {att.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--fg)',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
}
const labelStyle = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelText = { fontSize: 11, fontWeight: 700, color: 'var(--on-sv)', letterSpacing: '0.05em' }

export default function Notes() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('Physics')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [attachments, setAttachments] = useState([])

  const handleClose = useCallback(() => setModalOpen(false), [])

  const { notes, loading, saveNote, removeNote } = useNotes({ userId: user?.id, subject })

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: { attributes: { class: 'notes-prosemirror' } },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: accepted => {
      setPendingFiles(prev => {
        const remaining = MAX_FILES - attachments.length - prev.length
        return remaining > 0 ? [...prev, ...accepted.slice(0, remaining)] : prev
      })
    },
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: MAX_SIZE,
    multiple: true,
  })

  function openNew() {
    setForm({ ...EMPTY_FORM, subject })
    setFormError(null)
    setPendingFiles([])
    setAttachments([])
    editor?.commands.setContent('')
    setModalOpen(true)
  }

  function openEdit(note) {
    setForm({
      id: note.id,
      title: note.title || '',
      subject: note.subject || 'Physics',
      chapter: note.chapter || '',
      topic: note.topic || '',
    })
    setFormError(null)
    setPendingFiles([])
    setAttachments(note.attachments || [])
    editor?.commands.setContent(note.content || '')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    setSaving(true)
    setFormError(null)
    const uploaded = pendingFiles.length > 0 ? await uploadFiles(user.id, pendingFiles) : []
    const { error } = await saveNote({
      id: form.id,
      title: form.title.trim(),
      content: editor ? editor.getHTML() : '',
      subject: form.subject,
      chapter: form.chapter.trim() || null,
      topic: form.topic.trim() || null,
      attachments: [...attachments, ...uploaded],
    })
    setSaving(false)
    if (error) setFormError(error.message)
    else handleClose()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return
    await removeNote(id)
  }

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const totalFiles = attachments.length + pendingFiles.length
  const atLimit = totalFiles >= MAX_FILES

  return (
    <>
      <style>{`
        .notes-prosemirror {
          min-height: 150px;
          padding: 10px 12px;
          outline: none;
          font-size: 14px;
          line-height: 1.7;
          color: var(--fg);
        }
        .notes-prosemirror > * + * { margin-top: 4px; }
        .notes-prosemirror p { margin: 0; }
        .notes-prosemirror h2 { font-size: 16px; font-weight: 700; margin: 6px 0 2px; }
        .notes-prosemirror h3 { font-size: 14px; font-weight: 700; margin: 4px 0 2px; }
        .notes-prosemirror ul, .notes-prosemirror ol { padding-left: 20px; margin: 4px 0; }
        .notes-prosemirror li { margin: 2px 0; }
        .notes-prosemirror code {
          background: rgba(255,255,255,0.08);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
        }
        .notes-prosemirror strong { font-weight: 700; }
        .notes-prosemirror em { font-style: italic; }
        .notes-prosemirror s { text-decoration: line-through; }
        .note-card-preview {
          font-size: 13px;
          color: var(--on-sv);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          line-height: 1.6;
        }
        .note-card-preview p { margin: 0; }
        .note-card-preview strong { font-weight: 700; }
        .note-card-preview em { font-style: italic; }
      `}</style>

      <div className="page-canvas">
        <header className="editorial-header">
          <div className="editorial-tag">
            <div className="line" />
            <span>Study Notes</span>
          </div>
          <h1 className="page-title">Notes</h1>
          <p className="page-sub">Capture ideas, formulas, and concepts as you study.</p>
        </header>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 10,
              border: '2px solid var(--primary)', background: 'var(--surface)',
              color: 'var(--fg)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="btn-outline"
            style={{ padding: '10px 18px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap' }}
            onClick={openNew}
          >
            + New Note
          </button>
        </div>

        <div className="glass-card editorial-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ fontWeight: 600, margin: 0, marginBottom: (!loading && notes.length === 0) ? 8 : 0 }}>
            {loading ? 'Loading…' : `${notes.length} ${notes.length === 1 ? 'Note' : 'Notes'}`}
          </p>
          {!loading && notes.length === 0 && (
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              No notes yet. Hit "New Note" to get started.
            </p>
          )}
        </div>

        {!loading && notes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notes.map(note => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        <Modal
          open={modalOpen}
          onClose={handleClose}
          title={form.id ? 'Edit Note' : 'New Note'}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={handleClose} disabled={saving}>Cancel</button>
              <button className="btn-outline" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{formError}</p>}

            <label style={labelStyle}>
              <span style={labelText}>TITLE *</span>
              <input type="text" value={form.title} onChange={set('title')} placeholder="Note title" style={inputStyle} />
            </label>

            <label style={labelStyle}>
              <span style={labelText}>SUBJECT</span>
              <select value={form.subject} onChange={set('subject')} style={inputStyle}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                <span style={labelText}>CHAPTER</span>
                <input type="text" value={form.chapter} onChange={set('chapter')} placeholder="Optional" style={inputStyle} />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                <span style={labelText}>TOPIC</span>
                <input type="text" value={form.topic} onChange={set('topic')} placeholder="Optional" style={inputStyle} />
              </label>
            </div>

            <div style={labelStyle}>
              <span style={labelText}>CONTENT</span>
              <div style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
                <Toolbar editor={editor} />
                <EditorContent editor={editor} />
              </div>
            </div>

            <div style={labelStyle}>
              <span style={labelText}>ATTACHMENTS</span>
              {!atLimit && (
                <div
                  {...getRootProps()}
                  style={{
                    padding: '18px 14px',
                    borderRadius: 8,
                    border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
                    background: isDragActive ? 'rgba(180,255,0,0.04)' : 'transparent',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <input {...getInputProps()} />
                  <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--on-sv)', display: 'block', marginBottom: 4 }}>
                    upload_file
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--on-sv)' }}>
                    {isDragActive ? 'Drop files here…' : 'Drag & drop or click to upload'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--on-sv)', opacity: 0.6 }}>
                    PDF, JPG, PNG, WEBP, DOCX · max 3 MB · up to {MAX_FILES} files
                  </p>
                </div>
              )}
              {atLimit && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--on-sv)', opacity: 0.6 }}>
                  Maximum {MAX_FILES} attachments reached.
                </p>
              )}
              {(attachments.length > 0 || pendingFiles.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {attachments.map((att, i) => (
                    <FileChip
                      key={`saved-${i}`}
                      name={att.name}
                      type={att.type}
                      pending={false}
                      onRemove={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                  {pendingFiles.map((file, i) => (
                    <FileChip
                      key={`pending-${i}`}
                      name={file.name}
                      type={file.type}
                      pending={true}
                      onRemove={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

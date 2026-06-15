import { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import { useNotes } from '../hooks/useNotes'
import { useStudyNotes } from '../hooks/useStudyNotes'
import { renderMath } from '../lib/mathRender'

// Study notes store math as raw LaTeX ($…$ / $$…$$, plus bare \begin{}… blocks)
// mixed into HTML. renderMath renders the math in place, leaving the surrounding
// HTML (tables, lists, images) intact.
function StudyNoteBody({ html }) {
  const rendered = useMemo(() => renderMath(html), [html])
  return <div className="study-reader-content" dangerouslySetInnerHTML={{ __html: rendered }} />
}

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics']
const EMPTY_FORM = { id: null, title: '', subject: 'Physics', chapter: '', topic: '' }
const MAX_FILES = 3
const MAX_SIZE = 3 * 1024 * 1024

// Attachments upload straight to Cloudinary from the browser via an unsigned
// preset (the API secret must never reach the client). `auto` lets Cloudinary
// detect images vs raw files (pdf/docx).
const CLOUDINARY_CLOUD = 'dlfcvfgkm'
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset'

const FILE_ICON = {
  'application/pdf': 'picture_as_pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
}

async function uploadFiles(files) {
  const results = []
  for (const file of files) {
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      throw new Error(detail?.error?.message || `Couldn't upload "${file.name}".`)
    }
    const data = await res.json()
    results.push({ name: file.name, url: data.secure_url, type: file.type })
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

// Activate a div[role="button"] card with Enter/Space, matching native buttons.
function cardKeyDown(onActivate) {
  return e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }
}

export default function Notes() {
  const { user } = useAuth()
  const [tab, setTab] = useState('my')
  const [subject, setSubject] = useState('Physics')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [attachments, setAttachments] = useState([])

  const [studySubject, setStudySubject] = useState(null)
  const [studyChapter, setStudyChapter] = useState(null)
  const [studyTopic, setStudyTopic] = useState(null)
  const [readingNote, setReadingNote] = useState(null)
  const [readingLoading, setReadingLoading] = useState(false)

  const handleClose = useCallback(() => setModalOpen(false), [])

  const { notes, loading, saveNote, removeNote } = useNotes({ userId: user?.id, subject })
  const { tree, loading: studyLoading, fetchNoteContent } = useStudyNotes({ subject: studySubject })

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
    let uploaded = []
    try {
      if (pendingFiles.length > 0) uploaded = await uploadFiles(pendingFiles)
    } catch (e) {
      setSaving(false)
      setFormError(e.message || 'Attachment upload failed.')
      return
    }
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

  async function openStudyNote(note) {
    setReadingLoading(true)
    setReadingNote(note) // show the title immediately while the full content loads
    window.scrollTo({ top: 0 })
    try {
      const full = await fetchNoteContent(note.id)
      setReadingNote(full)
    } catch {
      setReadingNote(null)
    } finally {
      setReadingLoading(false)
    }
  }

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const totalFiles = attachments.length + pendingFiles.length
  const atLimit = totalFiles >= MAX_FILES

  const studySubjects = studySubject ? [studySubject] : Object.keys(tree)
  const chapters = studySubject ? Object.keys(tree[studySubject] || {}) : []
  const topics = studySubject && studyChapter ? Object.keys(tree[studySubject]?.[studyChapter] || {}) : []
  const topicNotes = studySubject && studyChapter && studyTopic ? (tree[studySubject]?.[studyChapter]?.[studyTopic] || []) : []

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
        .study-reader-content {
          font-size: 14px;
          line-height: 1.8;
          color: var(--fg);
        }
        .study-reader-content h2 { font-size: 18px; font-weight: 700; margin: 16px 0 8px; }
        .study-reader-content h3 { font-size: 16px; font-weight: 700; margin: 12px 0 6px; }
        .study-reader-content p { margin: 8px 0; }
        .study-reader-content ul, .study-reader-content ol { padding-left: 24px; margin: 8px 0; }
        .study-reader-content li { margin: 4px 0; }
        .study-reader-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 12px 0;
          /* Diagrams are black line-art on transparent bg — invisible on the dark
             theme without a light backing. White padding makes them readable. */
          background: #fff;
          padding: 8px;
          box-sizing: border-box;
        }
        .study-reader-content code {
          background: rgba(255,255,255,0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: monospace;
        }
        .study-reader-content strong { font-weight: 700; }
        .study-reader-content em { font-style: italic; }
        .study-reader-content figure { margin: 12px 0; max-width: 100%; overflow-x: auto; }
        .study-reader-content figure table { margin: 0; }
        .study-reader-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 12px 0;
          font-size: 13px;
        }
        .study-reader-content th, .study-reader-content td {
          border: 1px solid var(--border);
          padding: 8px 10px;
          text-align: left;
          vertical-align: top;
        }
        .study-reader-content th { background: var(--surface); font-weight: 700; }
        .tab-bar {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--surface);
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .tab-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--on-sv);
          background: transparent;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--primary);
          color: var(--on-primary);
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--on-sv);
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .breadcrumb-link {
          color: var(--primary);
          cursor: pointer;
          text-decoration: underline;
        }
        .breadcrumb-sep { opacity: 0.5; }
        .breadcrumb-back {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          background: none;
          border: none;
          font: inherit;
          font-size: 13px;
          color: var(--on-sv);
          cursor: pointer;
        }
        .breadcrumb-back:hover { color: var(--primary); }
        .breadcrumb-back .material-symbols-outlined { font-size: 16px; }
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

        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
            My Notes
          </button>
          <button className={`tab-btn ${tab === 'study' ? 'active' : ''}`} onClick={() => setTab('study')}>
            Study Notes
          </button>
        </div>

        {tab === 'my' && (
          <>
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
          </>
        )}

        {tab === 'study' && (
          <>
            {studySubject && (
              <div className="breadcrumb">
                <button
                  type="button"
                  className="breadcrumb-back"
                  onClick={() => {
                    if (readingNote) setReadingNote(null)
                    else if (studyTopic) setStudyTopic(null)
                    else if (studyChapter) setStudyChapter(null)
                    else setStudySubject(null)
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Back
                </button>
                <span className="breadcrumb-sep">/</span>
                {studyChapter ? (
                  <span className="breadcrumb-link" onClick={() => { setStudyChapter(null); setStudyTopic(null); setReadingNote(null) }}>{studySubject}</span>
                ) : (
                  <span>{studySubject}</span>
                )}
                {studyChapter && (
                  <>
                    <span className="breadcrumb-sep">/</span>
                    {studyTopic ? (
                      <span className="breadcrumb-link" onClick={() => { setStudyTopic(null); setReadingNote(null) }}>{studyChapter}</span>
                    ) : (
                      <span>{studyChapter}</span>
                    )}
                  </>
                )}
                {studyTopic && (
                  <>
                    <span className="breadcrumb-sep">/</span>
                    {readingNote ? (
                      <span className="breadcrumb-link" onClick={() => setReadingNote(null)}>{studyTopic}</span>
                    ) : (
                      <span>{studyTopic}</span>
                    )}
                  </>
                )}
                {readingNote && (
                  <>
                    <span className="breadcrumb-sep">/</span>
                    <span>{readingNote.title || 'Loading…'}</span>
                  </>
                )}
              </div>
            )}

            {studyLoading && (
              <div className="glass-card editorial-card" style={{ padding: '16px 20px' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>Loading…</p>
              </div>
            )}

            {!studyLoading && !studySubject && (
              <div className="bento-3">
                {studySubjects.map(s => (
                  <div
                    key={s}
                    role="button"
                    tabIndex={0}
                    className="glass-card subject-card glass-card-hover accent-card"
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => setStudySubject(s)}
                    onKeyDown={cardKeyDown(() => setStudySubject(s))}
                  >
                    <div className="curriculum-icon">
                      <span className="material-symbols-outlined">
                        {s === 'Physics' ? 'bolt' : s === 'Chemistry' ? 'science' : 'functions'}
                      </span>
                    </div>
                    <h3>{s}</h3>
                    <p>{Object.keys(tree[s] || {}).length} chapters</p>
                    <button type="button" tabIndex={-1} className="subject-enter-btn">Browse</button>
                  </div>
                ))}
              </div>
            )}

            {!studyLoading && studySubject && !studyChapter && (
              <div className="bento-4">
                {chapters.map((ch, i) => (
                  <div
                    key={ch}
                    role="button"
                    tabIndex={0}
                    className="glass-card subject-card glass-card-hover curriculum-card"
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => setStudyChapter(ch)}
                    onKeyDown={cardKeyDown(() => setStudyChapter(ch))}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div className="curriculum-icon">
                        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu_book</span>
                      </div>
                      <span className="text-micro">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 style={{ fontSize: 16, marginBottom: 8 }}>{ch}</h3>
                    <p className="text-micro" style={{ opacity: 0.6 }}>
                      {Object.keys(tree[studySubject]?.[ch] || {}).length} topics
                    </p>
                    <div style={{ marginTop: 'auto' }}>
                      <button type="button" tabIndex={-1} className="subject-enter-btn" style={{ padding: 10, fontSize: 11 }}>View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!studyLoading && studySubject && studyChapter && !studyTopic && (
              <div className="bento-4">
                {topics.map((t, i) => (
                  <div
                    key={t}
                    role="button"
                    tabIndex={0}
                    className="glass-card subject-card glass-card-hover curriculum-card"
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => setStudyTopic(t)}
                    onKeyDown={cardKeyDown(() => setStudyTopic(t))}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                      <div className="curriculum-icon curriculum-icon-lg">
                        <span className="material-symbols-outlined" style={{ fontSize: 36 }}>label</span>
                      </div>
                      <span className="text-sm">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3>{t}</h3>
                    <p>{(tree[studySubject]?.[studyChapter]?.[t] || []).length} notes</p>
                    <div style={{ marginTop: 'auto' }}>
                      <button type="button" tabIndex={-1} className="subject-enter-btn">Read</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!studyLoading && studySubject && studyChapter && studyTopic && !readingNote && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topicNotes.map(note => (
                  <button
                    key={note.id}
                    className="glass-card"
                    style={{ padding: '16px 20px', textAlign: 'left', cursor: 'pointer' }}
                    onClick={() => openStudyNote(note)}
                  >
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                      {note.chapter} · {note.topic}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {readingNote && (
              <article className="glass-card" style={{ padding: '28px 32px' }}>
                {readingLoading ? (
                  <p style={{ color: 'var(--on-sv)', fontSize: 14, margin: 0 }}>Loading content…</p>
                ) : readingNote.content ? (
                  <>
                    <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                      {readingNote.title}
                    </h2>
                    <StudyNoteBody html={readingNote.content} />
                  </>
                ) : (
                  <p style={{ color: 'var(--on-sv)', fontSize: 14, margin: 0 }}>No content available.</p>
                )}
              </article>
            )}
          </>
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

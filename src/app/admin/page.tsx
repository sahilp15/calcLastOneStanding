'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  Star,
} from 'lucide-react'
import { MathRenderer } from '@/components/shared/MathRenderer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

interface Question {
  id: string
  latex: string
  options: string[]
  answer: string
  explanation?: string | null
  difficulty: number
  topic: string
  isActive: boolean
  createdAt: string
}

interface QuestionForm {
  latex: string
  options: [string, string, string, string]
  answer: string
  explanation: string
  difficulty: number
  topic: string
}

const EMPTY_FORM: QuestionForm = {
  latex: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
  difficulty: 2,
  topic: 'limits',
}

const TOPICS = [
  'limits',
  'derivatives',
  'integrals',
  'series',
  'convergence',
  'taylor-series',
  'multivariable',
  'differential-equations',
  'optimization',
  'applications',
]

const DIFFICULTY_LABELS = ['', 'Easy', 'Easy-Med', 'Medium', 'Hard', 'Expert']

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple client-side check; real auth lives on API routes
    const adminPw = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123'
    if (password === adminPw) {
      sessionStorage.setItem('los_admin', '1')
      onAuth()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a0f' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm px-6"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)' }}
          >
            <Lock size={24} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Question management</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl space-y-4"
          style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
        >
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <XCircle size={14} /> Incorrect password
            </p>
          )}
          <Button type="submit" className="w-full">
            Enter Admin Panel
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Question Form ─────────────────────────────────────────────────────────────
function QuestionFormPanel({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: QuestionForm
  onSave: (form: QuestionForm) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [form, setForm] = useState<QuestionForm>(initial)
  const [previewMode, setPreviewMode] = useState(false)

  const setOption = (i: number, value: string) => {
    const opts = [...form.options] as [string, string, string, string]
    opts[i] = value
    setForm((f) => ({ ...f, options: opts }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #1e1e2e' }}
      >
        <h2 className="font-bold text-white">
          {initial.latex ? 'Edit Question' : 'New Question'}
        </h2>
        <button
          onClick={() => setPreviewMode((p) => !p)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <Eye size={14} />
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {previewMode ? (
          <div className="space-y-4">
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              {form.latex ? (
                <MathRenderer latex={form.latex} displayMode />
              ) : (
                <p className="text-gray-500 italic">No LaTeX entered</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {form.options.map((opt, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{
                    background: opt === form.answer ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: opt === form.answer ? '1px solid rgba(16,185,129,0.3)' : '1px solid #1e1e2e',
                  }}
                >
                  <span className="text-xs font-bold text-gray-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt ? <MathRenderer latex={opt} /> : <span className="text-gray-600 italic text-sm">empty</span>}
                  {opt === form.answer && (
                    <CheckCircle2 size={14} className="text-emerald-400 ml-auto flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            {form.explanation && (
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}
              >
                <p className="text-xs text-cyan-400 mb-2">Explanation</p>
                <MathRenderer latex={form.explanation} />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* LaTeX Question */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Question (LaTeX) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.latex}
                onChange={(e) => setForm((f) => ({ ...f, latex: e.target.value }))}
                placeholder="e.g. \sum_{n=1}^{\infty} \frac{1}{n^2}"
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono resize-none"
                style={{ background: '#0a0a0f', borderColor: '#1e1e2e' }}
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Answer Options (LaTeX) <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold"
                      style={{ color: '#6b7280' }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="pl-7 font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Correct answer */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Correct Answer <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {form.options.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, answer: opt }))}
                    disabled={!opt}
                    className="py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background:
                        form.answer === opt && opt
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(255,255,255,0.03)',
                      border:
                        form.answer === opt && opt
                          ? '1px solid rgba(16,185,129,0.5)'
                          : '1px solid #1e1e2e',
                      color: form.answer === opt && opt ? '#10b981' : '#6b7280',
                      cursor: opt ? 'pointer' : 'not-allowed',
                      opacity: opt ? 1 : 0.4,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic + Difficulty */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Topic</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ background: '#0a0a0f', borderColor: '#1e1e2e' }}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Difficulty: {DIFFICULTY_LABELS[form.difficulty]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background:
                          form.difficulty >= d ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                        border:
                          form.difficulty === d
                            ? '1px solid rgba(124,58,237,0.5)'
                            : '1px solid #1e1e2e',
                        color: form.difficulty >= d ? '#a78bfa' : '#6b7280',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Explanation (LaTeX, optional)
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                placeholder="e.g. Using the p-series test with p=2>1, the series converges."
                rows={2}
                className="w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono resize-none"
                style={{ background: '#0a0a0f', borderColor: '#1e1e2e' }}
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.latex || !form.answer || form.options.some((o) => !o)}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Save Question
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Check session
  useEffect(() => {
    if (sessionStorage.getItem('los_admin') === '1') setAuthed(true)
  }, [])

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(filterTopic && { topic: filterTopic }),
        ...(filterDiff && { difficulty: filterDiff }),
      })
      const res = await fetch(`/api/questions?${params}`)
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setTotalPages(data.pagination?.pages ?? 1)
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }, [page, filterTopic, filterDiff])

  useEffect(() => {
    if (authed) fetchQuestions()
  }, [authed, fetchQuestions])

  const handleSave = async (form: QuestionForm) => {
    setIsSaving(true)
    try {
      const url = editingQuestion
        ? `/api/questions/${editingQuestion.id}`
        : '/api/questions'
      const method = editingQuestion ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Save failed')
      }

      toast.success(editingQuestion ? 'Question updated!' : 'Question created!')
      setShowForm(false)
      setEditingQuestion(null)
      fetchQuestions()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, preview: string) => {
    if (!window.confirm(`Delete question: "${preview}"?`)) return
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Question deleted')
      fetchQuestions()
    } catch {
      toast.error('Failed to delete question')
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported!')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        const qs: QuestionForm[] = Array.isArray(data) ? data : [data]
        let created = 0
        for (const q of qs) {
          const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
          })
          if (res.ok) created++
        }
        toast.success(`Imported ${created} question(s)`)
        fetchQuestions()
      } catch {
        toast.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = questions.filter((q) => {
    if (!search) return true
    return (
      q.latex.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1e1e2e', background: '#13131a' }}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-purple-400" />
          <h1 className="text-xl font-black text-white">Question Admin</h1>
          <Badge variant="secondary">{questions.length} questions</Badge>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1e1e2e' }}
          >
            <Upload size={14} />
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <Button variant="secondary" size="sm" onClick={handleExport} className="gap-2">
            <Download size={14} />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingQuestion(null)
              setShowForm(true)
            }}
            className="gap-2"
          >
            <Plus size={14} />
            New Question
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Form */}
        <AnimatePresence>
          {(showForm || editingQuestion) && (
            <QuestionFormPanel
              key="form"
              initial={
                editingQuestion
                  ? {
                      latex: editingQuestion.latex,
                      options: editingQuestion.options as [string, string, string, string],
                      answer: editingQuestion.answer,
                      explanation: editingQuestion.explanation ?? '',
                      difficulty: editingQuestion.difficulty,
                      topic: editingQuestion.topic,
                    }
                  : EMPTY_FORM
              }
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingQuestion(null)
              }}
              isSaving={isSaving}
            />
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-9"
            />
          </div>
          <select
            value={filterTopic}
            onChange={(e) => { setFilterTopic(e.target.value); setPage(1) }}
            className="rounded-xl border px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: '#13131a', borderColor: '#1e1e2e' }}
          >
            <option value="">All Topics</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterDiff}
            onChange={(e) => { setFilterDiff(e.target.value); setPage(1) }}
            className="rounded-xl border px-3 py-2 text-sm text-white focus:outline-none"
            style={{ background: '#13131a', borderColor: '#1e1e2e' }}
          >
            <option value="">All Difficulties</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterTopic(''); setFilterDiff('') }}>
            <Filter size={14} className="mr-1" /> Clear
          </Button>
        </div>

        {/* Question list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No questions found</p>
            <p className="text-gray-600 text-sm mt-1">
              Add your first question using the button above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl overflow-hidden group"
                style={{ background: '#13131a', border: '1px solid #1e1e2e' }}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    {/* Question preview */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="secondary">{q.topic}</Badge>
                      <Badge
                        variant={
                          q.difficulty <= 2 ? 'success' : q.difficulty <= 3 ? 'warning' : 'destructive'
                        }
                      >
                        <Star size={10} className="mr-1" />
                        {DIFFICULTY_LABELS[q.difficulty]}
                      </Badge>
                      {!q.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div
                      className="rounded-xl px-4 py-3 mb-3 text-sm overflow-hidden"
                      style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}
                    >
                      <MathRenderer latex={q.latex} />
                    </div>
                    {/* Options preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg text-xs text-center"
                          style={{
                            background: opt === q.answer ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                            border: opt === q.answer ? '1px solid rgba(16,185,129,0.3)' : '1px solid #1e1e2e',
                          }}
                        >
                          <span className="text-gray-500 mr-1">{String.fromCharCode(65 + i)}.</span>
                          <MathRenderer latex={opt} className="inline text-xs" />
                          {opt === q.answer && (
                            <CheckCircle2 size={10} className="inline ml-1 text-emerald-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingQuestion(q)
                        setShowForm(false)
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.latex.slice(0, 40))}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-gray-400 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

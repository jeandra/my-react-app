import { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [titleInput, setTitleInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // state untuk search bar
  const [status, setStatus] = useState('');
  const [editId, setEditId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!isFormOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) {
        setIsFormOpen(false);
        setEditId(null);
        setTitleInput('');
        setBodyInput('');
        setStatus('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, isSaving]);

  useEffect(() => {
    if (!postToDelete || isFormOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isDeleting) setPostToDelete(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [postToDelete, isFormOpen, isDeleting]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/post');
        const data = await res.json();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        console.error('gagal ambil data:', err);
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus('');

    if (editId) {
      try {
        const res = await fetch(`http://localhost:8080/api/post/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleInput,
            body: bodyInput
          })
        });

        if (!res.ok) throw new Error('gagal memperbarui data');
        setPosts((currentPosts) => currentPosts.map((post) => (
          post.id === editId ? { ...post, title: titleInput, body: bodyInput } : post
        )));
        setToast('data berhasil diperbarui');
        closeForm();
      } catch (err) {
        console.error('gagal update:', err);
        setStatus('gagal memperbarui data.');
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        const res = await fetch('http://localhost:8080/api/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleInput,
            body: bodyInput
          })
        });

        if (!res.ok) throw new Error('gagal menyimpan data');
        const result = await res.json();
        const createdPost = result.data;
        if (
          !createdPost ||
          (typeof createdPost.id !== 'number' && typeof createdPost.id !== 'string') ||
          String(createdPost.id).trim() === ''
        ) {
          throw new Error('respons server tidak menyertakan id post');
        }

        setPosts((currentPosts) => [{
          ...createdPost,
          body: createdPost.body ?? createdPost.content ?? bodyInput
        }, ...currentPosts]);
        setToast('data berhasil ditambahkan');
        closeForm();
      } catch (err) {
        console.error('gagal simpan:', err);
        setStatus('gagal menyimpan data.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditClick = (post) => {
    setEditId(post.id);
    setTitleInput(post.title);
    setBodyInput(post.body);
    setStatus('');
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditId(null);
    setTitleInput('');
    setBodyInput('');
    setStatus('');
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/post/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('gagal menghapus data');
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
      setToast('data berhasil dihapus');
      setPostToDelete(null);
    } catch (err) {
      console.error('gagal hapus data:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // logika filter realtime berdasarkan pencarian
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Fullstack React <span className="text-emerald-400">+</span> CodeIgniter 4
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Sistem Manajemen Post REST API Realtime dengan Search Filter
          </p>
        </div>

        {/* List Cards & Search Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-100">
                Daftar Post <span className="text-xs font-normal text-slate-400">({filteredPosts.length} data)</span>
              </h2>
              <button
                type="button"
                onClick={openCreateForm}
                className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] cursor-pointer"
              >
                + Tambah Post
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari post..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm animate-pulse">Mengambil data dari server CI4...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">
                {searchTerm ? `Tidak ada post yang cocok dengan "${searchTerm}"` : 'Belum ada data post tersimpan.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id || index}
                  className="bg-slate-800/90 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-5 shadow-lg transition-all group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.body}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-form-title"
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl shadow-black/40"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 id="post-form-title" className="flex items-center gap-2 text-xl font-bold text-slate-100">
                <span className={`h-3 w-3 rounded-full ${editId ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {editId ? 'Edit Data Post' : 'Tambah Data Baru'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Tutup dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-50 cursor-pointer"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="post-title" className="mb-1 block text-sm font-medium text-slate-300">
                  Judul Post
                </label>
                <input
                  id="post-title"
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  required
                  placeholder="Masukkan judul menarik..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label htmlFor="post-body" className="mb-1 block text-sm font-medium text-slate-300">
                  Isi Konten
                </label>
                <textarea
                  id="post-body"
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  required
                  rows="4"
                  placeholder="Tuliskan konten di sini..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              {status && (
                <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-center text-xs font-semibold text-rose-300">
                  {status}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer ${
                    editId
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 hover:bg-amber-600'
                      : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:bg-emerald-600'
                  }`}
                >
                  {isSaving ? 'Menyimpan...' : editId ? 'Update Data' : 'Simpan ke Database'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-slate-600 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {postToDelete && !isFormOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setPostToDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl shadow-black/50"
          >
            <div className="p-6">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0 pt-0.5">
                  <h2 id="delete-dialog-title" className="text-lg font-bold text-white">
                    Hapus post ini?
                  </h2>
                  <p id="delete-dialog-description" className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    Tindakan ini tidak bisa dibatalkan. Post berikut akan dihapus permanen:
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-100">{postToDelete.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{postToDelete.body}</p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-slate-600 bg-slate-700/60 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(postToDelete.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-400 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M3 6h18m-2 0-.87 14H5.87L5 6m4 0V4h6v2m-5 4v6m4-6v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Ya, hapus post
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-slate-800 px-5 py-4 text-sm font-semibold text-emerald-300 shadow-2xl shadow-black/30 sm:right-6 sm:top-6"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300" aria-hidden="true">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
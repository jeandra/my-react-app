import { useState, useEffect } from 'react';
import api from './lib/api';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

function PostDashboard() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setLogout = useAuthStore((state) => state.setLogout);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [refreshPosts, setRefreshPosts] = useState(0);

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
    let isCurrentRequest = true;

    const loadPosts = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response = await api.get('/post');
        const data = response.data;
        if (!Array.isArray(data)) throw new Error('format data dari server tidak valid');
        if (isCurrentRequest) setPosts(data);
      } catch (err) {
        console.error('gagal ambil data:', err);
        if (isCurrentRequest) {
          setLoadError(err.response?.status
            ? `data gagal dimuat (HTTP ${err.response.status}). pastikan server API aktif, lalu coba lagi.`
            : 'data gagal dimuat. pastikan server API aktif, lalu coba lagi.');
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      isCurrentRequest = false;
    };
  }, [token, refreshPosts]);

  const handleLogout = () => {
    setLogout();
    setPosts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus('');

    if (editId) {
      try {
        await api.put(`/post/${editId}`, {
          title: titleInput,
          body: bodyInput
        });

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
        const response = await api.post('/post', {
          title: titleInput,
          body: bodyInput
        });

        const createdPost = response.data.data;
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
      await api.delete(`/post/${id}`);
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#080d16] px-4 py-6 text-slate-100 selection:bg-emerald-400/30 sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -right-48 -top-52 h-[34rem] w-[34rem] rounded-full bg-emerald-500/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-64 -left-48 h-[36rem] w-[36rem] rounded-full bg-cyan-500/[0.06] blur-3xl" />
      <div className="relative mx-auto max-w-5xl space-y-8 sm:space-y-10">
        <header className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3.5 backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300 text-slate-950 shadow-lg shadow-emerald-950/30">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3H19v15H7.75A2.75 2.75 0 0 0 5 20.75v-15Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6v14m3-13h7m-7 4h7" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="font-bold tracking-tight text-white">Postspace</p>
              <p className="hidden text-xs text-slate-500 sm:block">ruang untuk ide-ide kamu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.5)]" />
              <span className="max-w-44 truncate text-xs text-slate-400">{user?.email || user?.username || 'akun'}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white sm:px-4 sm:text-sm"
            >
              Keluar
            </button>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-emerald-950/35 p-6 shadow-2xl shadow-black/20 sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-14 -top-20 h-72 w-72 rounded-full border border-emerald-100/[0.07]" />
          <div className="pointer-events-none absolute -right-1 -top-1 h-48 w-48 rounded-full border border-emerald-100/[0.06]" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                ruang kerja personal
              </span>
              <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ide bagus layak
                <br className="hidden sm:block" /> <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">disimpan di sini.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
                Tulis, simpan, dan temukan kembali catatan pentingmu dengan mudah.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/15 px-4 py-3.5 backdrop-blur sm:px-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-white">{posts.length}</p>
                <p className="text-xs text-slate-500">post tersimpan</p>
              </div>
            </div>
          </div>
        </section>

        {/* List Cards & Search Section */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">koleksi kamu</p>
              <div className="mt-1.5 flex items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Daftar post</h2>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-400">
                  {filteredPosts.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-64">
                <span className="sr-only">Cari post</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul atau isi..."
                  className="w-full rounded-xl border border-white/[0.09] bg-slate-900/75 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/[0.08]"
                />
                <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </label>
              <button
                type="button"
                onClick={openCreateForm}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 active:translate-y-0"
              >
                <svg className="h-4 w-4 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Tulis post
              </button>
            </div>
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] px-5 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M12 8v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="mt-4 text-sm text-rose-200">{loadError}</p>
              <button
                type="button"
                onClick={() => setRefreshPosts((count) => count + 1)}
                className="mt-5 rounded-xl border border-rose-300/20 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/10"
              >
                Coba lagi
              </button>
            </div>
          ) : loading ? (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="flex animate-pulse gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/[0.07]" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 w-1/3 rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-4/5 rounded-full bg-white/[0.05]" />
                  <div className="h-3 w-2/3 rounded-full bg-white/[0.05]" />
                </div>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] px-5 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-slate-400">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                {searchTerm ? 'Tidak ada hasil yang cocok' : 'Mulai dari ide pertamamu'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {searchTerm ? `Coba kata kunci lain selain “${searchTerm}”.` : 'Tulis catatan atau ide baru, lalu semua post kamu akan tersimpan di sini.'}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/[0.12]"
                >
                  <span aria-hidden="true">+</span> Buat post pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3.5">
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id || index}
                  className="group relative flex flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-slate-900/90 to-slate-900/60 p-5 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/20 hover:shadow-xl hover:shadow-black/20 sm:flex-row sm:items-start sm:p-6"
                >
                  <span className="absolute bottom-5 left-0 top-5 w-0.5 rounded-full bg-emerald-300/0 transition group-hover:bg-emerald-300/60" />
                  <div className="min-w-0 flex-1 space-y-2 pl-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">post</span>
                    </div>
                    <h3 className="break-words text-lg font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-emerald-100 sm:text-xl">
                      {post.title}
                    </h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
                      {post.body}
                    </p>
                  </div>

                  <div className="flex w-full items-center justify-end gap-2 border-t border-white/[0.06] pt-3 sm:w-auto sm:border-0 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(post)}
                      className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-amber-200/20 hover:bg-amber-200/[0.06] hover:text-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-300/20 hover:bg-rose-300/[0.06] hover:text-rose-200"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/[0.06] pt-5 text-center text-xs text-slate-600">
          Postspace <span className="mx-1.5 text-slate-700">·</span> semua ide baik dimulai dari satu catatan.
        </footer>
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#03060b]/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-form-title"
            className="w-full max-w-lg rounded-[1.5rem] border border-white/10 bg-[#101823] p-6 shadow-[0_32px_100px_-30px_rgba(0,0,0,0.8)] sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{editId ? 'perbarui koleksi' : 'catatan baru'}</p>
                <h2 id="post-form-title" className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-white">
                  {editId ? 'Edit post' : 'Tulis post'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Tutup dialog"
                className="rounded-xl border border-white/[0.07] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50 cursor-pointer"
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
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 transition-all focus:border-emerald-300/50 focus:outline-none focus:ring-4 focus:ring-emerald-300/[0.08]"
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
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm leading-6 text-slate-100 placeholder-slate-600 transition-all focus:border-emerald-300/50 focus:outline-none focus:ring-4 focus:ring-emerald-300/[0.08]"
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
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer ${
                    editId
                      ? 'bg-amber-300 text-slate-950 shadow-amber-950/20 hover:bg-amber-200'
                      : 'bg-emerald-300 text-slate-950 shadow-emerald-950/20 hover:bg-emerald-200'
                  }`}
                >
                  {isSaving ? 'Menyimpan...' : editId ? 'Update Data' : 'Simpan ke Database'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.05] hover:text-white disabled:opacity-50 cursor-pointer"
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
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#03060b]/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setPostToDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101823] shadow-[0_32px_100px_-30px_rgba(0,0,0,0.8)]"
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

              <div className="mb-6 rounded-xl border border-white/[0.07] bg-slate-950/50 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-100">{postToDelete.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{postToDelete.body}</p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPostToDelete(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(postToDelete.id)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-rose-950/20 transition hover:bg-rose-300 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 cursor-pointer"
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
          className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-[#101823]/95 px-5 py-4 text-sm font-semibold text-emerald-100 shadow-2xl shadow-black/40 backdrop-blur-xl sm:right-6 sm:top-6"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200" aria-hidden="true">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <PostDashboard />
    </ProtectedRoute>
  );
}

export default App;
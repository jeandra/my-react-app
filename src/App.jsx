import { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [titleInput, setTitleInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // state untuk search bar
  const [status, setStatus] = useState('');

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      setStatus('sedang mengupdate data...');
      try {
        const res = await fetch(`http://localhost:8080/api/post/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleInput,
            body: bodyInput
          })
        });

        await res.json();
        setPosts(posts.map((post) => (post.id === editId ? { ...post, title: titleInput, body: bodyInput } : post)));
        setStatus('berhasil memperbarui data!');
        resetForm();
      } catch (err) {
        console.error('gagal update:', err);
        setStatus('gagal memperbarui data.');
      }
    } else {
      setStatus('sedang menyimpan...');
      try {
        const res = await fetch('http://localhost:8080/api/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titleInput,
            body: bodyInput
          })
        });

        const result = await res.json();
        setPosts([result.data, ...posts]);
        setStatus('berhasil tersimpan!');
        resetForm();
      } catch (err) {
        console.error('gagal simpan:', err);
        setStatus('gagal menyimpan data.');
      }
    }
  };

  const handleEditClick = (post) => {
    setEditId(post.id);
    setTitleInput(post.title);
    setBodyInput(post.body);
  };

  const resetForm = () => {
    setEditId(null);
    setTitleInput('');
    setBodyInput('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('yakin mau hapus data ini?')) return;

    try {
      await fetch(`http://localhost:8080/api/post/${id}`, {
        method: 'DELETE'
      });
      setPosts(posts.filter((post) => post.id !== id));
    } catch (err) {
      console.error('gagal hapus data:', err);
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

        {/* Form Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${editId ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            {editId ? 'Edit Data Post' : 'Tambah Data Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Judul Post
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                required
                placeholder="Masukkan judul menarik..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Isi Konten
              </label>
              <textarea
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                required
                rows="3"
                placeholder="Tuliskan konten di sini..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-[0.98] cursor-pointer ${
                  editId
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {editId ? 'Update Data' : 'Simpan ke Database'}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {status && (
            <p className="mt-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-center">
              {status}
            </p>
          )}
        </div>

        {/* List Cards & Search Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h2 className="text-xl font-bold text-slate-100">
              Daftar Post <span className="text-xs font-normal text-slate-400">({filteredPosts.length} data)</span>
            </h2>

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
                      onClick={() => handleDelete(post.id)}
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
    </div>
  );
}

export default App;
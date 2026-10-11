import { useState } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

function getErrorMessage(error) {
  const responseData = error.response?.data;
  const message = responseData?.messages?.error
    || responseData?.message
    || responseData?.error;

  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  if (message && typeof message === 'object') return Object.values(message).join(', ');

  return error.message || 'autentikasi gagal. coba lagi.';
}

function Login() {
  const setLogin = useAuthStore((state) => state.setLogin);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = authMode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await api.post(`/auth/${isRegistering ? 'register' : 'login'}`, {
        ...(isRegistering ? { username } : {}),
        email,
        password
      });
      const { token, user } = response.data?.data ?? {};

      if (typeof token !== 'string' || !token) {
        throw new Error('server tidak mengirim token login yang valid.');
      }

      setLogin(token, user ?? { email });
    } catch (error) {
      console.error('gagal autentikasi:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setAuthMode(isRegistering ? 'login' : 'register');
    setErrorMessage('');
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#080d16] px-4 py-10 text-slate-100 selection:bg-emerald-400/30">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/75 shadow-[0_32px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-10 lg:flex xl:p-14">
          <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full border border-emerald-200/10" />
          <div className="pointer-events-none absolute -right-8 top-36 h-52 w-52 rounded-full border border-emerald-200/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3H19v15H7.75A2.75 2.75 0 0 0 5 20.75v-15Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6v14m3-13h7m-7 4h7" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="font-bold tracking-tight text-white">Postspace</p>
              <p className="text-xs text-slate-400">ruang untuk ide-ide kamu</p>
            </div>
          </div>

          <div className="relative my-12">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-3 py-1.5 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
              ruang kerja yang lebih teratur
            </span>
            <h2 className="max-w-md text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
              Simpan ide.
              <br />
              <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">Temukan inspirasi.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Semua catatan dan tulisan tersusun rapi dalam satu tempat yang nyaman, aman, dan mudah diakses.
            </p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-slate-200">Sederhana, fokus, produktif</p>
              </div>
              <div className="space-y-2.5">
                <div className="h-2 w-4/5 rounded-full bg-white/10" />
                <div className="h-2 w-full rounded-full bg-white/[0.07]" />
                <div className="h-2 w-2/3 rounded-full bg-white/[0.07]" />
              </div>
            </div>
          </div>

          <p className="relative text-xs text-slate-500">dibuat untuk membantu ide baik tetap hidup.</p>
        </div>

        <div className="p-7 sm:p-10 lg:flex lg:flex-col lg:justify-center xl:p-14">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3H19v15H7.75A2.75 2.75 0 0 0 5 20.75v-15Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 6v14m3-13h7m-7 4h7" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="font-bold text-white">Postspace</p>
              <p className="text-xs text-slate-500">ruang untuk ide-ide kamu</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {isRegistering ? 'mulai sekarang' : 'selamat datang kembali'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {isRegistering ? 'Buat akun baru' : 'Masuk ke akun'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isRegistering ? 'Satu langkah lagi untuk mulai merapikan ide kamu.' : 'Masuk untuk melanjutkan mengelola tulisan kamu.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div>
                <label htmlFor="auth-username" className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  minLength="3"
                  maxLength="100"
                  required
                  placeholder="nama kamu"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-slate-300">Alamat email</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength="254"
                required
                placeholder="kamu@email.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="mb-2 block text-sm font-medium text-slate-300">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isRegistering ? 8 : undefined}
                required
                placeholder={isRegistering ? 'minimal 8 karakter' : 'masukkan password'}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/10"
              />
              {isRegistering && <p className="mt-2 text-xs text-slate-500">gunakan minimal 8 karakter untuk keamanan akun.</p>}
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-3.5 text-sm leading-5 text-rose-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 hover:shadow-emerald-500/10 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses...' : isRegistering ? 'Buat akun' : 'Masuk'}
              {!isSubmitting && (
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </form>

          <p className="mt-8 border-t border-white/[0.07] pt-6 text-center text-sm text-slate-500">
            {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button type="button" onClick={switchMode} className="font-semibold text-emerald-300 transition hover:text-emerald-200">
              {isRegistering ? 'Masuk di sini' : 'Daftar gratis'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;

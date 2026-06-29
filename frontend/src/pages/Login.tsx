import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Users } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', sans-serif";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => navigate('/exams'), 800);
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: FONT }}>
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0056D2 0%, #003A8C 60%, #001A5E 100%)' }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/3 -left-16 w-52 h-52 rounded-full opacity-[0.06] bg-white" />
        <div className="absolute bottom-12 right-16 w-36 h-36 rounded-full opacity-[0.08] bg-white" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">AWS Quiz App</span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-300 text-sm font-semibold tracking-widest uppercase mb-4">
            Learn · Test · Grow
          </p>
          <h1 className="text-5xl font-bold text-white leading-[1.15] mb-6">
            Advance your<br />
            knowledge with<br />
            <span className="text-blue-300">AWS certification</span> quizzes
          </h1>
          <p className="text-blue-100/80 text-base leading-relaxed max-w-sm">
            Practice AWS certification exams with real questions and instant feedback.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: Users, num: '48K+', label: 'Learners' },
            { icon: BookOpen, num: '80+', label: 'Exams' },
            { icon: Award, num: '2.4K+', label: 'Questions' },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <Icon className="w-5 h-5 text-blue-300 mb-2" />
              <p className="text-white text-xl font-bold">{num}</p>
              <p className="text-blue-200/70 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">AWS Quiz App</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Sign in to continue learning</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Username or email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                className="w-full px-4 py-3.5 bg-[#F3F4F8] border border-transparent rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <button type="button" className="text-xs text-primary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 bg-[#F3F4F8] border border-transparent rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: loading ? '#6B9FE4' : 'linear-gradient(135deg, #0056D2, #0041A8)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="mt-4 w-full py-3.5 rounded-xl border border-border text-sm font-semibold text-foreground flex items-center justify-center gap-3 hover:bg-[#F3F4F8] transition-all">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to AWS Quiz App?{' '}
            <button type="button" className="text-primary font-semibold hover:underline">
              Join for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

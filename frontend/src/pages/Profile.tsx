import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User as UserIcon, Award, Target } from 'lucide-react';
import { clearCurrentUser, getCurrentUser, getUserInitials } from '../user';
import { getAccuracyInsight, getCompletedExams } from '../completion';

const FONT = "'Plus Jakarta Sans', sans-serif";

export default function Profile() {
  const navigate = useNavigate();
  const user = getCurrentUser() ?? 'Learner';
  const completed = getCompletedExams().length;
  const accuracy = getAccuracyInsight();

  function handleLogout() {
    clearCurrentUser();
    navigate('/', { replace: true });
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground">Profile</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-border p-6 mb-5 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            {getUserInitials(user)}
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">{user}</h1>
          <p className="text-sm text-muted-foreground">AWS Quiz learner</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-border p-4 text-center">
            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-foreground">{completed}</p>
            <p className="text-xs text-muted-foreground font-medium">Completed</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-foreground">
              {accuracy.examsAttempted > 0 ? `${accuracy.accuracy}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground font-medium">Avg accuracy</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <UserIcon className="w-3.5 h-3.5" />
          Progress is saved on this device for {user}
        </div>
      </main>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, User } from 'lucide-react';

const FONT = "'Plus Jakarta Sans', sans-serif";

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/exams', label: 'Exams', icon: BookOpen, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
] as const;

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border safe-area-bottom"
      style={{ fontFamily: FONT }}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[72px] py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                      isActive ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[11px] font-semibold ${isActive ? 'text-primary' : ''}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

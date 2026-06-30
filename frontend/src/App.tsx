import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exams from './pages/Exams';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Score from './pages/Score';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/quiz/:examId" element={<Quiz />} />
        <Route path="/score" element={<Score />} />
      </Route>
    </Routes>
  );
}

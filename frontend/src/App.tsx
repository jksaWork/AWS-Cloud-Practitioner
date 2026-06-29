import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Exams from './pages/Exams';
import Quiz from './pages/Quiz';
import Score from './pages/Score';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/quiz/:examId" element={<Quiz />} />
      <Route path="/score" element={<Score />} />
    </Routes>
  );
}

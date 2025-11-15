import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Book } from './ui/views/Book';
import Editor from './ui/views/Editor';
import { Custom } from './ui/views/Custom';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Book />} />
        <Route path="/custom" element={<Custom />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:bookId" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App

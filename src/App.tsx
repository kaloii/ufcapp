import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ChatWidget } from './components/chat/ChatWidget';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { FighterProfile } from './pages/FighterProfile';
import { Rankings } from './pages/Rankings';
import { Compare } from './pages/Compare';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg-dark">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/fighters/:slug" element={<FighterProfile />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './pages/LandingPage';
import JoinPage from './pages/JoinPage';
import PlayPage from './pages/PlayPage';
import AdminPage from './pages/AdminPage';
import AssetSharePage from './pages/AssetSharePage';

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/join/:roomId?" element={<JoinPage />} />
          <Route path="/play/:roomId" element={<PlayPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/asset/:uniqueId" element={<AssetSharePage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;

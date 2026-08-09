// src/App.jsx — temporary, just for testing
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Log from "./pages/Log";

// TODO (teammate 2): wrap <Log /> and <Home /> in an auth check once
// signup/login is built — redirect to a /login route if there's no
// active Supabase session. For now both routes are open so Samir can
// keep testing without being blocked on auth UI.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<Log />} />
        {/* Fallback: unknown paths redirect to Home rather than showing a blank page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
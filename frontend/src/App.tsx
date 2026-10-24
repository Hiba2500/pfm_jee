import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Teams from "./pages/public/Teams";
import Members from "./pages/public/Members";
import Publications from "./pages/public/Publications";
import Events from "./pages/public/Events";
import Calendar from "./pages/public/Calendar";
import Apply from "./pages/public/Apply";

// Auth Pages
import Login from "./pages/auth/Login";

// Dashboard Pages
import DashboardWrapper from "./pages/dashboard/DashboardWrapper";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/members" element={<Members />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/*" element={<DashboardWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

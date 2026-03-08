import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import PilotApplyPage from "@/pages/PilotApplyPage";
import ThankYouPage from "@/pages/ThankYouPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import PilotGuidePDF from "@/pages/PilotGuidePDF";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<PilotApplyPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/pilot-guide" element={<PilotGuidePDF />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

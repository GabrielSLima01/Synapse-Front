/**
 * App.tsx - Componente raiz da aplicação FENEARTE
 * 
 * Configura rotas e provedores de contexto
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Páginas
import Index from "./pages/Index";
import LanguageSelection from "./pages/LanguageSelection";
import Home from "./pages/Home";
import Information from "./pages/Information";
import Map from "./pages/Map";
import TopStands from "./pages/TopStands";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import Photos from "./pages/Photos";
import StandDetail from "./pages/StandDetail";
import PublicPhotos from "./pages/PublicPhotos";
import Rating from "./pages/Rating";
import Profile from "./pages/Profile";
import TrailMissionPage from "./pages/TrailMission";
import NotFound from "./pages/NotFound";

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/language" element={<LanguageSelection />} />
            <Route path="/home" element={<Home />} />
            <Route path="/information" element={<Information />} />
            <Route path="/map" element={<Map />} />
            <Route path="/mapa" element={<Map />} />
            <Route path="/top-stands" element={<TopStands />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/stands/:id" element={<StandDetail />} />
            <Route path="/public-photos" element={<PublicPhotos />} />
            <Route path="/rating" element={<Rating />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trilha" element={<TrailMissionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;

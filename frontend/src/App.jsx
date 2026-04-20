import { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./componants/Navbar";
import Footer from "./componants/Footer";

// Lazy-load all page components for automatic code splitting
const Contact = lazy(() => import("./pages/Contact"));
const Donate = lazy(() => import("./pages/Donate"));
const Event = lazy(() => import("./pages/Event"));
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const DonorDashboard = lazy(() => import("./pages/DonorDashboard"));
const NGODashboard = lazy(() => import("./pages/NGODashboard"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const MapPage = lazy(() => import("./pages/MapPage"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const DonorItemHistory = lazy(() => import("./pages/DonorItemHistory"));
const NGOItemDashboard = lazy(() => import("./pages/NGOItemDashboard"));
const NGOProfile = lazy(() => import("./pages/NGOProfile"));

import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./componants/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lightweight fallback spinner
const PageLoader = () => (
  <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      border: "3px solid #e2e8f0", borderTopColor: "#004B8D",
      animation: "spin 0.7s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <Navbar />
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <main className="flex-grow">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/Contact" element={<Contact />} />
                  <Route path="/donate" element={<Campaigns />} />
                  <Route path="/event" element={<Event />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/campaign/:id" element={<CampaignDetail />} />

                  {/* Protected Donor Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
                    <Route path="/donor-dashboard" element={<DonorDashboard />} />
                    <Route path="/create-listing" element={<CreateListing />} />
                    <Route path="/donor-history" element={<DonorItemHistory />} />
                  </Route>

                  {/* Protected NGO Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
                    <Route path="/ngo-dashboard" element={<NGODashboard />} />
                    <Route path="/ngo-items" element={<NGOItemDashboard />} />
                    <Route path="/ngo-profile" element={<NGOProfile />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

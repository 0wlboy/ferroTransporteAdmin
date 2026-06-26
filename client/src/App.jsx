import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import AuthProvider from "./context/AuthContext";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Public routes (loaded immediately, used before auth)
const Login           = lazy(() => import("./pages/public/Login"));
const Register        = lazy(() => import("./pages/public/Register"));
const RecoveryEmail   = lazy(() => import("./pages/public/RecoveryEmail"));
const ResetPassword   = lazy(() => import("./pages/public/ResetPassword"));

// Protected routes (split into separate chunks — loaded on demand)
const Home            = lazy(() => import("./pages/auth/view/Home"));
const PassengerView   = lazy(() => import("./pages/auth/view/PassengerView"));
const DriversView     = lazy(() => import("./pages/auth/view/DriversView"));
const CarView         = lazy(() => import("./pages/auth/view/CarView"));
const PetitionsView   = lazy(() => import("./pages/auth/view/PetitionsView"));
const LocationView    = lazy(() => import("./pages/auth/view/LocationView"));
const UserActivity    = lazy(() => import("./pages/auth/view/UserActivity"));
const CarActivity     = lazy(() => import("./pages/auth/view/CarActivity"));
const AddCar          = lazy(() => import("./pages/auth/add/AddCar"));
const AddLocation     = lazy(() => import("./pages/auth/add/AddLocation"));
const AddUser         = lazy(() => import("./pages/auth/add/AddUser"));
const UpdateAdminProfile = lazy(() => import("./pages/auth/update/UpdateAdminProfile"));
const UpdateCar       = lazy(() => import("./pages/auth/update/UpdateCar"));
const UpdateUser      = lazy(() => import("./pages/auth/update/UpdateUser"));
const UpdateLocation  = lazy(() => import("./pages/auth/update/UpdateLocation"));

// ── Shared loading fallback ───────────────────────────────────────────────────
function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recovery-email" element={<RecoveryEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Layout />}>
              <Route path="" element={<Navigate to="home-view" replace />} />
              <Route path="home-view" element={<Home />} />
              <Route path="passenger-view" element={<PassengerView />} />
              <Route path="drivers-view" element={<DriversView />} />
              <Route path="vehicle-view" element={<CarView />} />
              <Route path="add-car" element={<AddCar />} />
              <Route path="petitions-view" element={<PetitionsView />} />
              <Route path="locations-view" element={<LocationView />} />
              <Route path="add-user" element={<AddUser />} />
              <Route path="add-location" element={<AddLocation />} />
              <Route path="user-activity/:id" element={<UserActivity />} />
              <Route path="car-activity/:id" element={<CarActivity />} />
              <Route path="update-profile" element={<UpdateAdminProfile />} />
              <Route path="update-car/:id" element={<UpdateCar />} />
              <Route path="update-user/:id" element={<UpdateUser />} />
              <Route path="update-location/:id" element={<UpdateLocation />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { CarView, DriversView, PassengerView, PetitionsView, LocationView, Login, Register, UserActivity, CarActivity, Home, AddCar, AddLocation, UpdateAdminProfile, UpdateCar, AddUser } from "./pages/exporter";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import AuthProvider from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

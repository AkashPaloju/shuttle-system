import theme from "./theme";
import "./App.css";
import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import WalletPage from "./pages/WalletPage";
import BookingHistory from "./pages/BookingHistory";
import ShuttleBooking from "./pages/ShuttleBooking";
import ManageUsersWallet from "./pages/admin/ManageUsersWallet";
import ManageStops from "./pages/admin/ManageStops";
import ManageRoutes from "./pages/admin/ManageRoutes";
import ManageShuttles from "./pages/admin/ManageShuttles";

// import LiveShuttleTracking from "./pages/LiveShuttleTracking";
// import ShuttleBooking from "./pages/ShuttleBooking";
// import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <BookingHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <ShuttleBooking />
                  </ProtectedRoute>
                }
              />
              {/* 
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracking"
                element={
                  <ProtectedRoute>
                    <LiveShuttleTracking />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageUsersWallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stops"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageStops />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/routes"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shuttles"
                element={
                  <ProtectedRoute adminOnly>
                    <ManageShuttles />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

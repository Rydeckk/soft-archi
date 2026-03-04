import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReservationProvider } from "@/contexts/ReservationsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { AdminPage } from "@/pages/AdminPage";
import { StatsPage } from "@/pages/StatsPage";
import { HistoryPage } from "@/pages/HistoryPage";

function App() {
  return (
    <AuthProvider>
      <ReservationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                index
                element={
                  <Layout>
                    <DashboardPage />
                  </Layout>
                }
              />
              <Route
                path="history"
                element={
                  <Layout>
                    <HistoryPage />
                  </Layout>
                }
              />

              {/* Secretary Only */}
              <Route element={<ProtectedRoute allowedRoles={["SECRETARY"]} />}>
                <Route
                  path="admin"
                  element={
                    <Layout>
                      <AdminPage />
                    </Layout>
                  }
                />
              </Route>

              {/* Manager Only */}
              <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
                <Route
                  path="stats"
                  element={
                    <Layout>
                      <StatsPage />
                    </Layout>
                  }
                />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ReservationProvider>
    </AuthProvider>
  );
}

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SearchPapersPage from './pages/SearchPapersPage';
import AIToolsPage from './pages/AIToolsPage';
import UploadPDFPage from './pages/UploadPDFPage';
import WorkspacePage from './pages/WorkspacePage';
import DocSpacePage from './pages/DocSpacePage';
import { useAuth } from './state/AuthContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<Navigate to={token ? '/home' : '/login'} replace />}
      />

      <Route
        path="/home"
        element={(
          <PrivateRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/dashboard"
        element={(
          <PrivateRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/search"
        element={(
          <PrivateRoute>
            <AppLayout>
              <SearchPapersPage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/ai-tools"
        element={(
          <PrivateRoute>
            <AppLayout>
              <AIToolsPage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/workspace"
        element={(
          <PrivateRoute>
            <AppLayout>
              <WorkspacePage />
            </AppLayout>
          </PrivateRoute>
        )}
      />
      <Route
        path="/workspace/:workspaceId"
        element={(
          <PrivateRoute>
            <AppLayout>
              <WorkspacePage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/upload"
        element={(
          <PrivateRoute>
            <AppLayout>
              <UploadPDFPage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route
        path="/docspace"
        element={(
          <PrivateRoute>
            <AppLayout>
              <DocSpacePage />
            </AppLayout>
          </PrivateRoute>
        )}
      />

      <Route path="*" element={<Navigate to={token ? '/home' : '/login'} replace />} />
    </Routes>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GettingStartedPage from './pages/GettingStartedPage'
import CollectionPage from './pages/CollectionPage'
import CollectionItemPage from './pages/CollectionItemPage'
import AddFragrancePage from './pages/AddFragrancePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/collection/add" element={<AddFragrancePage />} />
            <Route path="/collection/:id" element={<CollectionItemPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

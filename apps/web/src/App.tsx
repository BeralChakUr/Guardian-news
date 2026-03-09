import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ActusPage from './pages/ActusPage'
import NewsDetailPage from './pages/NewsDetailPage'
import AttaquesPage from './pages/AttaquesPage'
import OutilsPage from './pages/OutilsPage'
import UrgencePage from './pages/UrgencePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Dashboard with AppShell */}
      <Route path="/dashboard" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="news" element={<ActusPage />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
        <Route path="attaques" element={<AttaquesPage />} />
        <Route path="outils" element={<OutilsPage />} />
        <Route path="urgence" element={<UrgencePage />} />
        <Route path="parametres" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

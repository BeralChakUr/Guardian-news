import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import AppShell from './components/AppShell'
import HomePage from './pages/HomePage'
import SimpleDashboard from './pages/SimpleDashboard'
import ActusPage from './pages/ActusPage'
import NewsDetailPage from './pages/NewsDetailPage'
import AttaquesPage from './pages/AttaquesPage'
import OutilsPage from './pages/OutilsPage'
import UrgencePage from './pages/UrgencePage'
import SourcesPage from './pages/SourcesPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<HomePage />} />
        
        {/* Simple Dashboard - Power BI Style */}
        <Route path="/dashboard" element={<SimpleDashboard />} />
        
        {/* Dashboard with AppShell for other pages */}
        <Route path="/dashboard" element={<AppShell />}>
          <Route path="news" element={<ActusPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="attaques" element={<AttaquesPage />} />
          <Route path="outils" element={<OutilsPage />} />
          <Route path="urgence" element={<UrgencePage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="parametres" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  )
}

import { Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import ActusPage from './pages/ActusPage'
import NewsDetailPage from './pages/NewsDetailPage'
import UrgencePage from './pages/UrgencePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<ActusPage />} />
        <Route path="news/:id" element={<NewsDetailPage />} />
        <Route path="urgence" element={<UrgencePage />} />
        <Route path="parametres" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

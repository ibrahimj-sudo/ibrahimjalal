import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import NewReport from './components/NewReport'
import Dashboard from './components/Dashboard'
import ReportEdit from './components/ReportEdit'

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new-report" element={<NewReport />} />
          <Route path="/report/:id/interview" element={<NewReport />} />
          <Route path="/report/:id/generate" element={<NewReport />} />
          <Route path="/report/:id/edit" element={<ReportEdit />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  )
}

export default App

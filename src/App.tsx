import { Navigate, Route, Routes } from 'react-router-dom'
import SignupForm from './components/SignupForm'
import LoginPage from './pages/Login'
import SchedulesPage from './pages/Schedules'
import CreateSchedulePage from './pages/CreateSchedule'

function App() {
  return (
    <div className="page">
      <div className="floating-shape" aria-hidden />
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/schedules/new" element={<CreateSchedulePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

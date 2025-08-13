import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LoginPage from "./views/LoginPage"
import RegistrationPage from "./views/RegistratiomPage"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegistrationPage/>}/>
        <Route path="/login" element={<LoginPage/>}/>
      </Routes>
    </Router>
  )
}
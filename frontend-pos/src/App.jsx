import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LoginPage from "./views/Login/LoginPage"
import RegistrationPage from "./views/Registration/RegistrationPage"

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
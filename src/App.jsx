import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SnakeGamePage from "./pages/SnakeGamePage";
import SimonSaysGamePage from "./pages/SimonSaysGamePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/snake" element={<SnakeGamePage />} />
        <Route path="/simon" element={<SimonSaysGamePage />} />

        {/* <Route
          path="/snake"
          element={
            <ProtectedRoute>
              <SnakeGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/simon"
          element={
            <ProtectedRoute>
              <SimonSaysGamePage />
            </ProtectedRoute>
          }
        /> */}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;

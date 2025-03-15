import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "./components/NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import RealMoneyPage from "./pages/RealMoneyPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/real-money-calculator" element={<RealMoneyPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

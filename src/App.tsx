import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "@/components/NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "@/pages/HomePage";
import RealMoneyPage from "@/pages/RealMoneyPage";
import ImbuingsPage from "@/pages/ImbuingsPage";
import HuntingSpotsPage from "@/pages/HuntingSpotsPage";
import VocationHuntSpotsPage from "@/pages/VocationHuntSpotsPage";
import ExaltationPage from "@/pages/ExaltationPage";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/real-money-calculator" element={<RealMoneyPage />} />
            <Route path="/imbuings" element={<ImbuingsPage />} />
            <Route path="/hunting-spots" element={<HuntingSpotsPage />} />
            <Route
              path="/hunting-spots/:vocationId"
              element={<VocationHuntSpotsPage />}
            />
            <Route path="/exaltation" element={<ExaltationPage />}></Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

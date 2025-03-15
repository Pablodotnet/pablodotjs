import { ThemeProvider } from "@/components/theme-provider";
import { NavBar } from "./components/nav-bar";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-svh"></div>
    </ThemeProvider>
  );
}

export default App;

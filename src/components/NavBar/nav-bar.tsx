import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { PandaIcon } from "./panda-icon";
import { NavMenu } from "./nav-menu";

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-950/90">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center">
            <PandaIcon className="h-6 w-6" />
            <span className="sr-only">Pablodotjs</span>
          </div>
          <nav className="hidden md:flex gap-4">
            <Link
              to="/"
              className="font-medium flex items-center text-sm transition-colors hover:underline"
            >
              Home
            </Link>
            <Link
              to="/real-money-calculator"
              className="font-medium flex items-center text-sm transition-colors hover:underline"
            >
              Real Money Spend Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <NavMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

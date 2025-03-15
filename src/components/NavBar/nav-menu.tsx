import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" onClick={toggleMenu}>
          {isOpen ? (
            <X className="h-[1.5rem] w-[1.5rem] text-black dark:text-white" />
          ) : (
            <Menu className="h-[1.5rem] w-[1.5rem] text-black dark:text-white" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>

      {isOpen && (
        <DropdownMenuContent align="end" className="p-4">
          <DropdownMenuItem>
            <Link to="/" className="block py-2" onClick={handleNavItemClick}>
              Home
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              to="/real-money-calculator"
              className="block py-2"
              onClick={handleNavItemClick}
            >
              Real Money Calculator
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

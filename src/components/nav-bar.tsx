import { ModeToggle } from "./mode-toggle";

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm dark:bg-gray-950/90">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center">
            <MountainIcon className="h-6 w-6" />
            <span className="sr-only">Pablodotjs</span>
          </div>
          <nav className="hidden md:flex gap-4">
            <div className="font-medium flex items-center text-sm transition-colors hover:underline">
              Home
            </div>
            <div className="font-medium flex items-center text-sm transition-colors hover:underline">
              About
            </div>
            <div className="font-medium flex items-center text-sm transition-colors hover:underline">
              Services
            </div>
            <div className="font-medium flex items-center text-sm transition-colors hover:underline">
              Contact
            </div>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

type MountainIconProps = React.SVGProps<SVGSVGElement>;

function MountainIcon(props: MountainIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

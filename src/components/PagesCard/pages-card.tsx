import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PagesIcons } from "./pages-icons";

type PageListItem = {
  title: string;
  url: string;
  description: string;
  icon: string;
};

export function PagesCard() {
  const pagesList: PageListItem[] = [
    {
      title: "Real Money Calculator",
      url: "/real-money-calculator",
      description: "Calculate how much real money will cost your Tibia gold.",
      icon: PagesIcons.goldcoinGif,
    },
    {
      title: "Imbuing System",
      url: "/imbuings",
      description: "What imbuings can you put on your items?",
      icon: PagesIcons.imbuingshrineGif,
    },
    {
      title: "Hunting Spots",
      url: "/hunting-spots",
      description:
        "Find the best hunting spots for your level and which set to use.",
      icon: PagesIcons.guzzlemawGif,
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilities</CardTitle>
        <CardDescription>
          Useful or not so useful tools, just for practice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pagesList.map((page: PageListItem) => (
          <Card key={page.url} className="px-4 mb-4">
            <Link to={page.url} className="w-full flex items-center">
              <img src={page.icon} alt="icon" className="w-10 h-10 mr-4" />
              <div>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {page.title}
                </h4>
                <small className="text-sm font-medium leading-none">
                  {page.description}
                </small>
              </div>
            </Link>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { VocationsIcons } from "@/helpers";
import { Link } from "react-router-dom";

type VocationsListItem = {
  id: string;
  name: string;
  icon: string;
};

export const HuntingSpotsCard = () => {
  const vocations: VocationsListItem[] = [
    {
      id: "druid",
      name: "Druid",
      icon: VocationsIcons.druidGif,
    },
    {
      id: "knight",
      name: "Knight",
      icon: VocationsIcons.knightGif,
    },
    {
      id: "monk",
      name: "Monk",
      icon: VocationsIcons.monkGif,
    },
    {
      id: "paladin",
      name: "Paladin",
      icon: VocationsIcons.paladinGif,
    },
    {
      id: "sorcerer",
      name: "Sorcerer",
      icon: VocationsIcons.sorcererGif,
    },
  ];
  return (
    <>
      <CardContent>
        {vocations.map((vocation: VocationsListItem) => (
          <Card key={vocation.id} className="px-4 mb-4">
            <Link
              to={`/hunting-spots/${vocation.id}`}
              className="w-full flex items-center"
            >
              <img src={vocation.icon} alt="icon" className="w-10 h-10 mr-4" />
              <div>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {vocation.name}
                </h4>
              </div>
            </Link>
          </Card>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </>
  );
};

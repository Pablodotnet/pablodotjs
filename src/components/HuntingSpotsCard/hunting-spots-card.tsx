import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { VocationsIcons } from "@/helpers";
import { Link } from "react-router-dom";

type VocationsListItem = {
  title: string;
  icon: string;
};

export const HuntingSpotsCard = () => {
  const vocations: VocationsListItem[] = [
    {
      title: "Druid",
      icon: VocationsIcons.druidGif,
    },
    {
      title: "Knight",
      icon: VocationsIcons.knightGif,
    },
    {
      title: "Monk",
      icon: VocationsIcons.monkGif,
    },
    {
      title: "Paladin",
      icon: VocationsIcons.paladinGif,
    },
    {
      title: "Sorcerer",
      icon: VocationsIcons.sorcererGif,
    },
  ];
  return (
    <>
      <CardContent>
        {vocations.map((vocation: VocationsListItem) => (
          <Card key={vocation.title} className="px-4 mb-4">
            <div className="w-full flex items-center">
              <img src={vocation.icon} alt="icon" className="w-10 h-10 mr-4" />
              <div>
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {vocation.title}
                </h4>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </>
  );
};

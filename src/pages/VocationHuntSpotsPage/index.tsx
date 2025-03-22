import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "react-router-dom";

const VocationHuntSpotsPage = () => {
  const { vocationId } = useParams();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Find the best hunting spots for {vocationId}</CardTitle>
        <CardDescription>
          Here you can find hunting spots as well as recommendations of set to
          use there and which imbuements to use.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default VocationHuntSpotsPage;

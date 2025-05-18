import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ExaltationPage = () => {
  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>
          Where can I hunt at certain level? What set should I use?
        </CardTitle>
        <CardDescription>
          Here you can find hunting spots as well as recommendations of set to
          use there and which imbuements to use.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ExaltationPage;

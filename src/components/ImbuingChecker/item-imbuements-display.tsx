import React from "react";
import { imbuements, imbuingsAvailableByType } from "./imbuements";
import { Card } from "@/components/ui/card";
import { getImbuementIcon } from "@/helpers";

type ItemType = keyof typeof imbuingsAvailableByType;

interface ItemImbuementsDisplayProps {
  selectedSearch: {
    type: string | null;
    item: string | null;
  } | null;
}

const ItemImbuementsDisplay: React.FC<ItemImbuementsDisplayProps> = ({
  selectedSearch,
}) => {
  const itemType = (selectedSearch?.type || "") as ItemType;
  const availableImbuementsForItem = imbuingsAvailableByType[
    itemType
  ] as (keyof typeof imbuements)[];

  return selectedSearch ? (
    <>
      <h3>You can imbue:</h3>
      {availableImbuementsForItem && availableImbuementsForItem.length > 0 && (
        <div>
          {availableImbuementsForItem.map(
            (imbuement: keyof typeof imbuements) => (
              <Card key={imbuement} className="px-4 mb-4">
                <div className="w-full flex items-center">
                  <img
                    src={getImbuementIcon(imbuements[imbuement].icon)}
                    alt={imbuements[imbuement].name}
                    className="w-10 h-10 mr-4"
                  />
                  <div>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                      {imbuements[imbuement].name}
                    </h4>
                    <small className="text-sm font-medium leading-none">
                      {imbuements[imbuement].effect}
                    </small>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </>
  ) : (
    <>
      <h3>Error, missing selected search.</h3>
    </>
  );
};

export default ItemImbuementsDisplay;

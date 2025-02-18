import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface EditPopupProps {
  onClose: () => void;
}
export default function EditPopup({ onClose }:Readonly<EditPopupProps>) {
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(600);

  return (
    <div className ="flex flex-start w-96">
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="p-4 w-96">
        <div className="flex flex-col space-y-4">
          <label>
            Height:<input
              type="number"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className="border p-2 w-full"
            />
          </label>
          <label>
            Width:<input
              type="number"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              className="border p-2 w-full"
            />
          </label>
          <Button onClick={onClose} className="bg-gray-700 text-white">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
    </div>
  );
}

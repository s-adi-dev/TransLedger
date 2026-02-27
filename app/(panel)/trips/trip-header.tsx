"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TripsHeaderProps {
  handleAddTrip: () => void;
}

export function TripsHeader({ handleAddTrip }: TripsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Trips</h1>
        <p className="text-muted-foreground">Manage and track all your trips</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAddTrip} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Trip
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const errorMessage = error.message || "Something went wrong!";

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/50 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
            <CardDescription className="text-base">
              An error occurred while processing your request
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">{errorMessage}</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} className="sm:flex-1 gap-2" size="lg">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

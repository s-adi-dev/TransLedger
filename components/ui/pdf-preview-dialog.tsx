"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState, type ReactElement } from "react";

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PdfLoadingSkeleton /> },
);

function PdfLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Generating PDF...</p>
      </div>
    </div>
  );
}

interface PdfPreviewDialogProps {
  /** The title shown in the dialog header */
  title: string;
  /** The filename used when downloading (without .pdf extension) */
  fileName: string;
  /** The react-pdf Document element to render */
  document: ReactElement<DocumentProps>;
  /** Optional custom trigger button. Defaults to an "Export PDF" outline button. */
  trigger?: ReactElement;
}

export function PdfPreviewDialog({
  title,
  fileName,
  document: pdfDocument,
  trigger,
}: PdfPreviewDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setDownloading(false);
    }
  }, [pdfDocument, fileName]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pr-8">
          <DialogTitle>{title}</DialogTitle>
          <Button size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            {pdfDocument}
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

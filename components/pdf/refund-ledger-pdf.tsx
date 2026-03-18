"use client";

import { AppConfig } from "@/lib/config";
import { fmtAmount } from "@/lib/str";
import type { RefundsByDate } from "@/validators";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate } from "date-fns";
import { PDFHeader, PDFFooter, pdfLayoutStyles } from "./pdf-layout";
import { registerFonts } from "./font";

registerFonts();

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },

  // ── Section (per transporter) ──────────────────────────────────────────────
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Roboto",
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    color: "#1a1a1a",
    padding: 8,
    paddingHorizontal: 10,
    marginBottom: 0,
    textAlign: "center",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#d0d0d0",
  },

  // ── Table ──────────────────────────────────────────────────────────────────
  table: {
    marginTop: 0,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#d0d0d0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d0d0d0",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d0d0d0",
    backgroundColor: "#fafafa",
  },
  tableRowLast: {
    flexDirection: "row",
    borderBottomWidth: 0,
    backgroundColor: "#ffffff",
  },

  // ── Table Cells ────────────────────────────────────────────────────────────
  cellHeader: {
    fontFamily: "Roboto",
    fontWeight: "semibold",
    fontSize: 8,
    padding: 5,
    textAlign: "center",
    color: "#ffffff",
  },
  cell: {
    fontSize: 8,
    padding: 5,
    textAlign: "center",
    color: "#404040",
  },

  // Column widths
  colSr: { width: "8%" },
  colDate: { width: "27%" },
  colTrips: { width: "20%", textAlign: "center" },
  colAmount: { width: "25%", textAlign: "right" },
  colAction: { width: "20%", textAlign: "center" },

  // ── Summary row ────────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    backgroundColor: "#f9f9f9",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
  },
  summarySectionLeft: {
    flexDirection: "column",
    justifyContent: "center",
  },
  summarySectionRight: {
    flexDirection: "column",
    justifyContent: "center",
  },
  summaryText: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: "semibold",
    color: "#1a1a1a",
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface RefundLedgerPdfProps {
  companyName: string;
  refunds: RefundsByDate[];
}

interface RefundRowProps {
  refund: RefundsByDate;
  index: number;
  isLast: boolean;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const TableHeader = () => (
  <View style={styles.tableHeaderRow} fixed>
    <Text style={[styles.cellHeader, styles.colSr]}>#</Text>
    <Text style={[styles.cellHeader, styles.colDate]}>DATE</Text>
    <Text style={[styles.cellHeader, styles.colTrips]}>TRIPS</Text>
    <Text style={[styles.cellHeader, styles.colAmount]}>AMOUNT</Text>
  </View>
);

const RefundRow = ({ refund, index, isLast }: RefundRowProps) => {
  const rowStyle = isLast
    ? styles.tableRowLast
    : index % 2 === 0
      ? styles.tableRow
      : styles.tableRowAlt;

  return (
    <View style={rowStyle} wrap={false}>
      <Text style={[styles.cell, styles.colSr]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.colDate]}>
        {formatDate(refund.refundDate, "dd MMM yyyy")}
      </Text>
      <Text style={[styles.cell, styles.colTrips]}>{refund.tripCount}</Text>
      <Text style={[styles.cell, styles.colAmount]}>
        {fmtAmount(refund.refundAmt)}
      </Text>
    </View>
  );
};

interface SummaryProps {
  totalRefunds: number;
  totalTrips: number;
  totalAmount: number;
}

const SummarySection = ({
  totalRefunds,
  totalTrips,
  totalAmount,
}: SummaryProps) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryText}>Total Entries: {totalRefunds}</Text>
    <Text style={styles.summaryText}>Total Trips: {totalTrips}</Text>
    <Text style={styles.summaryText}>
      Total Amount: {fmtAmount(totalAmount)}
    </Text>
  </View>
);

// ─── Component ───────────────────────────────────────────────────────────────

export function RefundLedgerPdf({
  companyName,
  refunds,
}: RefundLedgerPdfProps) {
  const totalAmount = refunds.reduce((sum, r) => sum + r.refundAmt, 0);
  const totalTrips = refunds.reduce((sum, r) => sum + r.tripCount, 0);
  const reportDate = formatDate(new Date(), "dd MMM yyyy");

  return (
    <Document title="Refund Ledger Report" author={AppConfig.company.name}>
      <Page size="A4" style={styles.page}>
        {/* Reusable Header from pdf-layout */}
        <PDFHeader reportDate={reportDate} />

        {/* Table Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text>{companyName}</Text>
          </View>

          <View style={styles.table}>
            {/* Table Headers */}
            <TableHeader />

            {/* Table Rows */}
            {refunds.map((refund, i) => (
              <RefundRow
                key={i}
                refund={refund}
                index={i}
                isLast={i === refunds.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Summary Section */}
        <SummarySection
          totalRefunds={refunds.length}
          totalTrips={totalTrips}
          totalAmount={totalAmount}
        />

        {/* Reusable Footer from pdf-layout */}
        <PDFFooter />
      </Page>
    </Document>
  );
}

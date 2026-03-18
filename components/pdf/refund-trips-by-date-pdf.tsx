"use client";

import { AppConfig } from "@/lib/config";
import { fmtAmount } from "@/lib/str";
import { generateTripNo } from "@/validators";
import type { z } from "zod";
import type { tripBaseSchema } from "@/validators/trip.schema";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate } from "date-fns";
import { PDFHeader, PDFFooter, pdfLayoutStyles } from "./pdf-layout";
import { registerFonts } from "./font";

registerFonts();

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 8,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },

  // ── Section (per date) ──────────────────────────────────────────────
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
    fontSize: 7,
    padding: 4,
    textAlign: "center",
    color: "#ffffff",
  },
  cell: {
    fontSize: 7,
    padding: 4,
    textAlign: "center",
    color: "#404040",
  },

  // Columns
  colSr: { width: "5%" },
  colTripNo: { width: "15%" },
  colTruckNo: { width: "20%" },
  colRoute: { width: "30%" },
  colDate: { width: "15%" },
  colAmount: { width: "15%", textAlign: "right" },

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
  summaryText: {
    fontSize: 10,
    fontFamily: "Roboto",
    fontWeight: "semibold",
    color: "#1a1a1a",
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

type Trip = z.infer<typeof tripBaseSchema>;

interface RefundTripsByDatePdfProps {
  companyName: string;
  date: string;
  trips: Trip[];
}

interface TripRowProps {
  trip: Trip;
  index: number;
  isLast: boolean;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const TableHeader = () => (
  <View style={styles.tableHeaderRow} fixed>
    <Text style={[styles.cellHeader, styles.colSr]}>#</Text>
    <Text style={[styles.cellHeader, styles.colTripNo]}>TRIP NO</Text>
    <Text style={[styles.cellHeader, styles.colTruckNo]}>TRUCK NO</Text>
    <Text style={[styles.cellHeader, styles.colRoute]}>ROUTE</Text>
    <Text style={[styles.cellHeader, styles.colDate]}>TRIP DATE</Text>
    <Text style={[styles.cellHeader, styles.colAmount]}>AMOUNT</Text>
  </View>
);

const TripRow = ({ trip, index, isLast }: TripRowProps) => {
  const rowStyle = isLast
    ? styles.tableRowLast
    : index % 2 === 0
      ? styles.tableRow
      : styles.tableRowAlt;

  const materialRefund = trip.materialPayment?.refund?.refundAmount || 0;
  const truckRefund = trip.truckPayment?.refund?.refundAmount || 0;
  // Show truck amount if available, otherwise show material amount
  const displayAmount = truckRefund > 0 ? truckRefund : materialRefund;

  return (
    <View style={rowStyle} wrap={false}>
      <Text style={[styles.cell, styles.colSr]}>{index + 1}</Text>
      <Text style={[styles.cell, styles.colTripNo]}>
        {generateTripNo(trip.tripNo)}
      </Text>
      <Text style={[styles.cell, styles.colTruckNo]}>{trip.truckNo}</Text>
      <Text style={[styles.cell, styles.colRoute]}>
        {`${trip.from} -> ${trip.to}`}
      </Text>
      <Text style={[styles.cell, styles.colDate]}>
        {formatDate(new Date(trip.date), "dd MMM yyyy")}
      </Text>
      <Text style={[styles.cell, styles.colAmount]}>
        {displayAmount > 0 ? fmtAmount(displayAmount) : "—"}
      </Text>
    </View>
  );
};

interface SummaryProps {
  totalTrips: number;
  totalMaterial: number;
  totalTruck: number;
  totalRefund: number;
}

const SummarySection = ({
  totalTrips,
  totalMaterial,
  totalTruck,
  totalRefund,
}: SummaryProps) => {
  // Show truck total if available, otherwise show material total
  const displayTotal = totalTruck > 0 ? totalTruck : totalMaterial;

  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryText}>Total Trips: {totalTrips}</Text>
      <Text style={styles.summaryText}>
        Total Amount: {fmtAmount(displayTotal)}
      </Text>
    </View>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export function RefundTripsByDatePdf({
  companyName,
  date,
  trips,
}: RefundTripsByDatePdfProps) {
  const totalMaterialRefund = trips.reduce(
    (sum, trip) => sum + (trip.materialPayment?.refund?.refundAmount || 0),
    0,
  );
  const totalTruckRefund = trips.reduce(
    (sum, trip) => sum + (trip.truckPayment?.refund?.refundAmount || 0),
    0,
  );
  const totalRefund = totalMaterialRefund + totalTruckRefund;
  const reportDate = formatDate(new Date(date), "dd MMM yyyy");

  return (
    <Document
      title="Refund Trips by Date Report"
      author={AppConfig.company.name}
    >
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
            {trips.map((trip, i) => (
              <TripRow
                key={trip.id}
                trip={trip}
                index={i}
                isLast={i === trips.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Summary Section */}
        <SummarySection
          totalTrips={trips.length}
          totalMaterial={totalMaterialRefund}
          totalTruck={totalTruckRefund}
          totalRefund={totalRefund}
        />

        {/* Reusable Footer from pdf-layout */}
        <PDFFooter />
      </Page>
    </Document>
  );
}

"use client";

import { AppConfig } from "@/lib/config";
import { generateTripNo } from "@/validators";
import type { z } from "zod";
import type { tripBaseSchema } from "@/validators/trip.schema";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate } from "date-fns";

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#FFFFFF",
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  headerLeft: {},
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#6b7280",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 1,
  },

  // Summary row
  summaryRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a1a1a",
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopWidth: 2,
    borderTopColor: "#d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  // Column widths
  colSno: { width: "6%" },
  colTripNo: { width: "12%" },
  colTruckNo: { width: "14%" },
  colRoute: { width: "22%" },
  colDate: { width: "12%" },
  colMaterialRefund: { width: "12%", textAlign: "right" },
  colTruckRefund: { width: "12%", textAlign: "right" },
  colTotalRefund: { width: "10%", textAlign: "right" },

  // Cell text
  thText: {
    fontSize: 7.5,
    fontWeight: 600,
    color: "#374151",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tdText: {
    fontSize: 9,
    color: "#1f2937",
  },
  tdTextRight: {
    fontSize: 9,
    color: "#1f2937",
    textAlign: "right",
  },
  tdTextMuted: {
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "right",
  },
  footerText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a1a1a",
  },

  // Page footer
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  pageFooterText: {
    fontSize: 7,
    color: "#9ca3af",
  },
});

// ─── Types ───────────────────────────────────────────────────────────────────

type Trip = z.infer<typeof tripBaseSchema>;

interface RefundTripsByDatePdfProps {
  companyName: string;
  date: string;
  trips: Trip[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

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
  const generatedAt = formatDate(new Date(), "dd MMM yyyy, hh:mm a");
  const formattedDate = formatDate(new Date(date), "dd MMM yyyy");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{AppConfig.company.name}</Text>
            <Text style={styles.headerSubtitle}>{AppConfig.description}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Refund Trips</Text>
            <Text style={styles.headerMeta}>{companyName}</Text>
            <Text style={styles.headerMeta}>Date: {formattedDate}</Text>
            <Text style={styles.headerMeta}>Generated: {generatedAt}</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Trips</Text>
            <Text style={styles.summaryValue}>{trips.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Material Refund</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalMaterialRefund)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Truck Refund</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalTruckRefund)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Refund</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalRefund)}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <View style={styles.colSno}>
              <Text style={styles.thText}>#</Text>
            </View>
            <View style={styles.colTripNo}>
              <Text style={styles.thText}>Trip No</Text>
            </View>
            <View style={styles.colTruckNo}>
              <Text style={styles.thText}>Truck No</Text>
            </View>
            <View style={styles.colRoute}>
              <Text style={styles.thText}>Route</Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.thText}>Trip Date</Text>
            </View>
            <View style={styles.colMaterialRefund}>
              <Text style={[styles.thText, { textAlign: "right" }]}>
                Material
              </Text>
            </View>
            <View style={styles.colTruckRefund}>
              <Text style={[styles.thText, { textAlign: "right" }]}>
                Truck
              </Text>
            </View>
            <View style={styles.colTotalRefund}>
              <Text style={[styles.thText, { textAlign: "right" }]}>
                Total
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          {trips.map((trip, index) => {
            const materialRefund =
              trip.materialPayment?.refund?.refundAmount || 0;
            const truckRefund = trip.truckPayment?.refund?.refundAmount || 0;
            const tripTotal = materialRefund + truckRefund;

            return (
              <View
                key={trip.id}
                style={[
                  styles.tableRow,
                  index % 2 !== 0 ? styles.tableRowAlt : {},
                ]}
              >
                <View style={styles.colSno}>
                  <Text style={styles.tdText}>{index + 1}</Text>
                </View>
                <View style={styles.colTripNo}>
                  <Text style={styles.tdText}>
                    {generateTripNo(trip.tripNo)}
                  </Text>
                </View>
                <View style={styles.colTruckNo}>
                  <Text style={styles.tdText}>{trip.truckNo}</Text>
                </View>
                <View style={styles.colRoute}>
                  <Text style={styles.tdText}>
                    {trip.from} → {trip.to}
                  </Text>
                </View>
                <View style={styles.colDate}>
                  <Text style={styles.tdText}>
                    {formatDate(new Date(trip.date), "dd MMM yyyy")}
                  </Text>
                </View>
                <View style={styles.colMaterialRefund}>
                  <Text
                    style={
                      materialRefund > 0
                        ? styles.tdTextRight
                        : styles.tdTextMuted
                    }
                  >
                    {materialRefund > 0
                      ? formatCurrency(materialRefund)
                      : "—"}
                  </Text>
                </View>
                <View style={styles.colTruckRefund}>
                  <Text
                    style={
                      truckRefund > 0 ? styles.tdTextRight : styles.tdTextMuted
                    }
                  >
                    {truckRefund > 0 ? formatCurrency(truckRefund) : "—"}
                  </Text>
                </View>
                <View style={styles.colTotalRefund}>
                  <Text style={styles.tdTextRight}>
                    {formatCurrency(tripTotal)}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Footer Total Row */}
          <View style={styles.tableFooter}>
            <View style={styles.colSno}>
              <Text style={styles.footerText} />
            </View>
            <View style={styles.colTripNo}>
              <Text style={styles.footerText} />
            </View>
            <View style={styles.colTruckNo}>
              <Text style={styles.footerText} />
            </View>
            <View style={styles.colRoute}>
              <Text style={styles.footerText} />
            </View>
            <View style={styles.colDate}>
              <Text style={styles.footerText}>Total</Text>
            </View>
            <View style={styles.colMaterialRefund}>
              <Text style={[styles.footerText, { textAlign: "right" }]}>
                {formatCurrency(totalMaterialRefund)}
              </Text>
            </View>
            <View style={styles.colTruckRefund}>
              <Text style={[styles.footerText, { textAlign: "right" }]}>
                {formatCurrency(totalTruckRefund)}
              </Text>
            </View>
            <View style={styles.colTotalRefund}>
              <Text style={[styles.footerText, { textAlign: "right" }]}>
                {formatCurrency(totalRefund)}
              </Text>
            </View>
          </View>
        </View>

        {/* Page Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>
            {AppConfig.company.name} — Refund Trips
          </Text>
          <Text
            style={styles.pageFooterText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

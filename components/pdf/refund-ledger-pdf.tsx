"use client";

import { AppConfig } from "@/lib/config";
import type { RefundsByDate } from "@/validators";
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
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
  },

  // Column widths
  colSno: { width: "10%" },
  colDate: { width: "30%" },
  colTrips: { width: "20%", textAlign: "center" },
  colAmount: { width: "40%", textAlign: "right" },

  // Cell text
  thText: {
    fontSize: 8,
    fontWeight: 600,
    color: "#374151",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tdText: {
    fontSize: 10,
    color: "#1f2937",
  },
  tdTextCenter: {
    fontSize: 10,
    color: "#1f2937",
    textAlign: "center",
  },
  tdTextRight: {
    fontSize: 10,
    color: "#1f2937",
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

interface RefundLedgerPdfProps {
  companyName: string;
  refunds: RefundsByDate[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RefundLedgerPdf({
  companyName,
  refunds,
}: RefundLedgerPdfProps) {
  const totalAmount = refunds.reduce((sum, r) => sum + r.refundAmt, 0);
  const totalTrips = refunds.reduce((sum, r) => sum + r.tripCount, 0);
  const generatedAt = formatDate(new Date(), "dd MMM yyyy, hh:mm a");

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
            <Text style={styles.reportTitle}>Refund Ledger</Text>
            <Text style={styles.headerMeta}>{companyName}</Text>
            <Text style={styles.headerMeta}>Generated: {generatedAt}</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Entries</Text>
            <Text style={styles.summaryValue}>{refunds.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Trips</Text>
            <Text style={styles.summaryValue}>{totalTrips}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Refund Amount</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalAmount)}
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
            <View style={styles.colDate}>
              <Text style={styles.thText}>Refund Date</Text>
            </View>
            <View style={styles.colTrips}>
              <Text style={[styles.thText, { textAlign: "center" }]}>
                Trips
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={[styles.thText, { textAlign: "right" }]}>
                Refund Amount
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          {refunds.map((refund, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 !== 0 ? styles.tableRowAlt : {},
              ]}
            >
              <View style={styles.colSno}>
                <Text style={styles.tdText}>{index + 1}</Text>
              </View>
              <View style={styles.colDate}>
                <Text style={styles.tdText}>
                  {formatDate(refund.refundDate, "dd MMM yyyy")}
                </Text>
              </View>
              <View style={styles.colTrips}>
                <Text style={styles.tdTextCenter}>{refund.tripCount}</Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.tdTextRight}>
                  {formatCurrency(refund.refundAmt)}
                </Text>
              </View>
            </View>
          ))}

          {/* Footer Total Row */}
          <View style={styles.tableFooter}>
            <View style={styles.colSno}>
              <Text style={styles.footerText} />
            </View>
            <View style={styles.colDate}>
              <Text style={styles.footerText}>Total</Text>
            </View>
            <View style={styles.colTrips}>
              <Text style={[styles.footerText, { textAlign: "center" }]}>
                {totalTrips}
              </Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={[styles.footerText, { textAlign: "right" }]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Page Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>
            {AppConfig.company.name} — Refund Ledger
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

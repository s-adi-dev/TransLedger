"use client";

import { fmtAmount } from "@/lib/str";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFHeader, PDFFooter } from "./pdf-layout";
import { registerFonts } from "./font";
import { TripPDFOptions } from "@/app/(panel)/trips/trip-printer";
import { TripBaseType } from "@/validators";
import { formatDate } from "date-fns";

registerFonts();

// ─── Types ──────────────────────────────────────────────────────────────────────
interface TripPDFProps {
  options: TripPDFOptions;
  data: TripBaseType[];
}

interface PartyTripRow {
  sr: number;
  date?: string;
  truckNo?: string;
  biltiNo?: string;
  freight?: number;
  advance?: number;
  advanceDate?: string;
  loading?: number;
  unloading?: number;
  tds?: number;
  munshiana?: number;
  commission?: number;
  other?: number;
  otherType?: string;
  balance?: number;
}

interface PartySection {
  name: string;
  trips: PartyTripRow[];
}

interface ColumnConfig {
  key: keyof PartyTripRow;
  label: string;
  width: string;
}

interface TableRowProps {
  row: PartyTripRow;
  index: number;
  isLast: boolean;
  columns: ColumnConfig[];
}

interface TransporterSectionProps {
  name: string;
  trips: PartyTripRow[];
  columns: ColumnConfig[];
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 7,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },

  // ── Section (per party) ────────────────────────────────────────────────────
  section: {
    marginBottom: 12,
  },

  // ── Table ──────────────────────────────────────────────────────────────────
  table: {
    marginTop: 0,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#a0a0a0",
  },
  tableNameRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#a0a0a0",
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#b4c7e7",
    borderBottomWidth: 1.5,
    borderBottomColor: "#a0a0a0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    backgroundColor: "#f7f7f7",
  },
  tableRowLast: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8e8e8",
    backgroundColor: "#ffffff",
  },

  // ── Table Cells ────────────────────────────────────────────────────────────
  tableNameText: {
    fontSize: 12,
    fontFamily: "Roboto",
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  cellHeader: {
    fontFamily: "Roboto",
    fontWeight: "semibold",
    fontSize: 7,
    padding: 4.5,
    textAlign: "center",
    color: "#1a1a1a",
  },
  cell: {
    fontSize: 7,
    padding: 4,
    textAlign: "center",
    color: "#404040",
  },

  // ── Summary row ────────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "column",
    marginTop: 8,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1.5,
    borderTopColor: "#000000",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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

// ─── Utility: Get visible columns based on options ────────────────────────────
const getVisibleColumns = (options: TripPDFOptions): ColumnConfig[] => {
  const { fields } = options;

  const allColumns: Record<string, ColumnConfig> = {
    sr: { key: "sr", label: "#", width: "4%" },
    date: { key: "date", label: "DATE", width: "7%" },
    truckNo: { key: "truckNo", label: "TRUCK NO", width: "7%" },
    biltiNo: { key: "biltiNo", label: "BILTI NO", width: "7%" },
    freight: { key: "freight", label: "FREIGHT", width: "8%" },
    advance: { key: "advance", label: "ADVANCE", width: "8%" },
    advanceDate: { key: "advanceDate", label: "ADV DATE", width: "7%" },
    loading: { key: "loading", label: "LOADING", width: "7%" },
    unloading: { key: "unloading", label: "UNLOADING", width: "7%" },
    tds: { key: "tds", label: "TDS", width: "7%" },
    munshiana: { key: "munshiana", label: "MUNSHIANA", width: "8%" },
    commission: { key: "commission", label: "COMMISSION", width: "8%" },
    other: { key: "other", label: "Extra Charges", width: "7%" },
    otherType: { key: "otherType", label: "Charges Type", width: "7%" },
    balance: { key: "balance", label: "BALANCE", width: "8%" },
  };

  const visible: ColumnConfig[] = [allColumns.sr]; // Always show SR

  if (fields.date) visible.push(allColumns.date);
  if (fields.truckNo) visible.push(allColumns.truckNo);
  if (fields.biltiNo) visible.push(allColumns.biltiNo);
  if (fields.freight) visible.push(allColumns.freight);
  if (fields.advanceAdvanceDate) {
    visible.push(allColumns.advance);
    visible.push(allColumns.advanceDate);
  }
  if (fields.loading) visible.push(allColumns.loading);
  if (fields.unloading) visible.push(allColumns.unloading);
  if (fields.tds) visible.push(allColumns.tds);
  if (fields.munshiana) visible.push(allColumns.munshiana);
  if (fields.commission) visible.push(allColumns.commission);
  if (fields.other) {
    visible.push(allColumns.other);
    visible.push(allColumns.otherType);
  }
  if (fields.balance) visible.push(allColumns.balance);

  // ── Dynamic width redistribution ─────────────────────────────────────────
  const SR_WIDTH = 4;
  const TOTAL_WIDTH = 100;
  const distributableWidth = TOTAL_WIDTH - SR_WIDTH;

  const nonSrColumns = visible.slice(1);
  const usedWidth = nonSrColumns.reduce(
    (sum, col) => sum + parseFloat(col.width),
    0,
  );

  const leftover = distributableWidth - usedWidth;
  const bonusPerColumn =
    nonSrColumns.length > 0 ? leftover / nonSrColumns.length : 0;

  return [
    { ...allColumns.sr, width: `${SR_WIDTH}%` },
    ...nonSrColumns.map((col) => ({
      ...col,
      width: `${parseFloat(col.width) + bonusPerColumn}%`,
    })),
  ];
};

// ─── Utility: Format cell values ───────────────────────────────────────────────
const formatCellValue = (value: string | number | undefined): string => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    if (value === 0) return "0";
    return fmtAmount(value);
  }
  if (value === "") return "-";
  return String(value);
};

// ─── Utility: Transform trips to party sections ─────────────────────────────────
const transformTripsToPartySections = (
  trips: TripBaseType[],
  format: "material" | "truck",
): PartySection[] => {
  const partyMap = new Map<string, { name: string; trips: TripBaseType[] }>();

  trips.forEach((trip) => {
    const payment =
      format === "material" ? trip.materialPayment : trip.truckPayment;
    if (!payment?.party?.id) return;

    const partyId = payment.party.id;
    const partyName = payment.party.name;

    if (!partyMap.has(partyId)) {
      partyMap.set(partyId, { name: partyName, trips: [] });
    }
    partyMap.get(partyId)!.trips.push(trip);
  });

  return Array.from(partyMap.values()).map((group) => ({
    name: group.name,
    trips: group.trips.map((trip, index) => {
      const payment =
        format === "material" ? trip.materialPayment : trip.truckPayment;

      const fields = [
        "freightAmount",
        "advanceAmount",
        "loadingCharge",
        "unloadingCharge",
        "tdsAmount",
        "commissionAmount",
        "extraChargesAmount",
      ] as const;
      const [freight, ...deductions] = fields.map((f) => payment?.[f] || 0);
      const balance = freight - deductions.reduce((a, b) => a + b, 0);

      return {
        sr: index + 1,
        date: trip.date
          ? formatDate(new Date(trip.date), "dd/MM/yyyy")
          : undefined,
        truckNo: trip.truckNo,
        biltiNo: trip.bilti?.no,
        freight: payment?.freightAmount,
        advance: payment?.advanceAmount,
        advanceDate: payment?.advanceDate
          ? formatDate(new Date(payment.advanceDate), "dd/MM/yyyy")
          : undefined,
        loading: payment?.loadingCharge,
        unloading: payment?.unloadingCharge,
        tds: payment?.tdsAmount,
        munshiana: payment?.commissionAmount,
        commission: payment?.commissionAmount,
        other: payment?.extraChargesAmount,
        balance,
      };
    }),
  }));
};

// ─── Components ──────────────────────────────────────────────────────────────────

const TableHeader = ({ columns }: { columns: ColumnConfig[] }) => (
  <View style={styles.tableHeaderRow} fixed>
    {columns.map((col) => (
      <Text key={col.key} style={[styles.cellHeader, { width: col.width }]}>
        {col.label}
      </Text>
    ))}
  </View>
);

const TableRow = ({ row, index, isLast, columns }: TableRowProps) => {
  const rowStyle = isLast
    ? styles.tableRowLast
    : index % 2 === 0
      ? styles.tableRow
      : styles.tableRowAlt;

  return (
    <View style={rowStyle} wrap={false}>
      {columns.map((col) => (
        <Text key={col.key} style={[styles.cell, { width: col.width }]}>
          {formatCellValue(row[col.key])}
        </Text>
      ))}
    </View>
  );
};

const PartySection = ({ name, trips, columns }: TransporterSectionProps) => (
  <View style={styles.section}>
    <View style={styles.table}>
      {/* Party Name Row */}
      <View style={styles.tableNameRow}>
        <Text style={styles.tableNameText}>{name}</Text>
      </View>
      {/* Column Headers - Fixed to repeat on each page */}
      <TableHeader columns={columns} />
      {/* Data Rows */}
      {trips.map((row, i) => (
        <TableRow
          key={i}
          row={row}
          index={i}
          isLast={i === trips.length - 1}
          columns={columns}
        />
      ))}
    </View>
  </View>
);

// ─── Summary Section ────────────────────────────────────────────────────────────

interface SummaryProps {
  totalTrips: number;
  totalAdvance: number;
  totalBalance: number;
  options: TripPDFOptions;
}

const SummarySection = ({
  totalTrips,
  totalAdvance,
  totalBalance,
  options,
}: SummaryProps) => {
  const { fields } = options;

  // Default to true (shown) if the flag is not explicitly set to false
  const showTrips = fields.summaryTotalTrips !== false;
  const showAdvance = fields.summaryTotalAdvance !== false;
  const showBalance = fields.summaryTotalBalance !== false;

  const items = [
    showTrips && { label: "Total Trips", value: String(totalTrips) },
    showAdvance && { label: "Total Advance", value: fmtAmount(totalAdvance) },
    showBalance && { label: "Total Balance", value: fmtAmount(totalBalance) },
  ].filter(Boolean) as { label: string; value: string }[];

  if (items.length === 0) return null;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summarySection}>
        {items.map((item) => (
          <View key={item.label} style={styles.summarySectionLeft}>
            <Text style={styles.summaryText}>
              {item.label}: {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Main PDF Document ───────────────────────────────────────────────────────

export const TripPDF = ({ options, data }: TripPDFProps) => {
  const columns = getVisibleColumns(options);
  const partyData = transformTripsToPartySections(data, options.format);

  const totalTrips = partyData.reduce(
    (acc, section) => acc + section.trips.length,
    0,
  );

  const totalAdvance = partyData.reduce(
    (acc, section) =>
      acc + section.trips.reduce((a, row) => a + (row.advance || 0), 0),
    0,
  );

  const totalBalance = partyData.reduce(
    (acc, section) =>
      acc + section.trips.reduce((a, row) => a + (row.balance || 0), 0),
    0,
  );

  return (
    <Document title={`Trip Report - ${options.format}`} author="Kiran Roadways">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <PDFHeader reportDate={new Date().toDateString()} headerColor="red" />

        {/* Party Sections */}
        {partyData.map((section, i) => (
          <PartySection
            key={i}
            name={section.name}
            trips={section.trips}
            columns={columns}
          />
        ))}

        {/* Summary */}
        <SummarySection
          totalTrips={totalTrips}
          totalAdvance={totalAdvance}
          totalBalance={totalBalance}
          options={options}
        />

        {/* Footer */}
        <PDFFooter />
      </Page>
    </Document>
  );
};

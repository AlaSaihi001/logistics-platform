import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

export interface Bill {
  idAgent: string;
  idClient: string;
  idCommande: string;
  dateEmission: Date;
  montant: number;
  numeroFacture: number;
  status: string;
}
// Register font if needed (optional)
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  section: {
    width: "48%",
  },
  label: {
    fontSize: 10,
    color: "#718096",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 12,
    color: "#1a202c",
    marginBottom: 12,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export function InvoicePDF(bill: Bill) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FACTURE #{bill.numeroFacture}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <Text style={styles.label}>Date d'émission</Text>
            <Text style={styles.value}>
              {new Date(bill.dateEmission).toLocaleDateString("fr-FR")}
            </Text>

            <Text style={styles.label}>Agent</Text>
            <Text style={styles.value}>{bill.idAgent}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{bill.idClient}</Text>

            <Text style={styles.label}>Commande</Text>
            <Text style={styles.value}>{bill.idCommande}</Text>
          </View>
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Montant Total:</Text>
            <Text style={styles.totalValue}>
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(bill.montant)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.value}>{bill.status}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

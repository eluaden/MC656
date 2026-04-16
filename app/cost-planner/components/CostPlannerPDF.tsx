"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { CostPlannerState, CalculatedCosts } from "../types";
import { formatCurrency } from "../utils/formatCurrency";

interface PDFExportProps {
  state: CostPlannerState;
  totals: CalculatedCosts;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    backgroundColor: "#f3f4f6",
    padding: 8,
  },
  table: {
    width: "100%",
    marginBottom: 15,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
    color: "#1f2937",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
  },
  totalBox: {
    backgroundColor: "#d1fae5",
    padding: 15,
    borderRadius: 4,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  totalText: {
    fontSize: 12,
    color: "#065f46",
    marginBottom: 5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
  },
  categoryRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryLabel: {
    fontSize: 11,
    color: "#4b5563",
  },
  categoryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
});

export function CostPlannerPDF({ state, totals }: PDFExportProps) {
  const areaUnitLabel = state.globalParameters.areaUnit === "m²" ? "m²" : "Hectares";

  const itemsBySection = {
    preparo: state.items.filter((item) => item.section === "Preparo"),
    plantio: state.items.filter((item) => item.section === "Plantio"),
    manejo: state.items.filter((item) => item.section === "Manejo"),
    colheita: state.items.filter((item) => item.section === "Colheita"),
  };

  const sectionLabels = {
    preparo: "Preparação do Solo",
    plantio: "Plantio",
    manejo: "Manejo",
    colheita: "Colheita",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Planejador de Custos Agrícolas</Text>
          <Text style={styles.subtitle}>AgroGlobe</Text>
        </View>

        {/* Parâmetros Globais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parâmetros Globais</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Cultura:</Text>
            <Text style={styles.tableCell}>{state.globalParameters.crop}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Área de Plantio:</Text>
            <Text style={styles.tableCell}>
              {state.globalParameters.area} {areaUnitLabel}
            </Text>
          </View>
        </View>

        {/* Resumo de Custos por Categoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Custos</Text>
          <View>
            {Object.entries(totals.categoryTotals).map(([category, cost]) => (
              <View key={category} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <Text style={styles.categoryValue}>
                  {formatCurrency(cost, state.globalParameters.currency)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Custo Total Estimado</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totals.totalCost, state.globalParameters.currency)}
            </Text>
            <Text style={[styles.totalText, { marginTop: 10 }]}>
              Custo por {areaUnitLabel === "m²" ? "m²" : "Hectare"}:{" "}
              {formatCurrency(totals.costPerAreaUnit, state.globalParameters.currency)}
            </Text>
          </View>
        </View>

        {/* Itens por Seção */}
        {Object.entries(itemsBySection).map(([sectionKey, items]) => (
          items.length > 0 && (
            <View key={sectionKey} style={styles.section} break>
              <Text style={styles.sectionTitle}>
                {sectionLabels[sectionKey as keyof typeof sectionLabels]}
              </Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>Item</Text>
                  <Text style={styles.tableCell}>Preço Unit.</Text>
                  <Text style={styles.tableCell}>Qtd/{areaUnitLabel === "m²" ? "m²" : "Ha"}</Text>
                  <Text style={styles.tableCell}>Total</Text>
                </View>
                {items.map((item) => {
                  const isFixed = item.quantityType === "fixed";
                  const quantity = item.quantityPerAreaUnit;
                  const itemCost = isFixed
                    ? item.pricePerUnit * quantity
                    : item.pricePerUnit * quantity * state.globalParameters.area;
                  return (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2 }]}>
                        {item.name}
                      </Text>
                      <Text style={styles.tableCell}>
                        {formatCurrency(item.pricePerUnit, state.globalParameters.currency)}
                      </Text>
                      <Text style={styles.tableCell}>
                        {quantity} {isFixed && item.unit ? item.unit : ""}
                      </Text>
                      <Text style={styles.tableCell}>
                        {formatCurrency(itemCost, state.globalParameters.currency)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )
        ))}
      </Page>
    </Document>
  );
}

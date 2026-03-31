import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import type { InvoiceData, InvoiceStyleOptions } from './types.js';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
}

function createStyles(options?: InvoiceStyleOptions) {
  const primary = options?.primaryColor || '#4f46e5';
  const font = options?.fontFamily || 'Helvetica';

  return StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: 10,
      padding: 40,
      color: '#1f2937',
    },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 30,
    },
    logo: {
      width: 120,
      maxHeight: 60,
      objectFit: 'contain' as any,
    },
    invoiceTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: primary,
      textAlign: 'right',
    },
    invoiceMeta: {
      textAlign: 'right',
      marginTop: 4,
    },
    metaLabel: {
      fontSize: 9,
      color: '#6b7280',
    },
    metaValue: {
      fontSize: 10,
      fontWeight: 'bold',
    },

    // Addresses
    addressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    addressBlock: {
      width: '45%',
    },
    addressTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    addressName: {
      fontSize: 11,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    addressLine: {
      fontSize: 10,
      lineHeight: 1.5,
      color: '#374151',
    },

    // Table
    table: {
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: primary,
      color: '#ffffff',
      padding: '8 10',
      borderRadius: 2,
    },
    tableHeaderText: {
      fontWeight: 'bold',
      fontSize: 9,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      padding: '8 10',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: '8 10',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      backgroundColor: '#f9fafb',
    },
    colName: { width: '40%' },
    colDesc: { width: '20%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right' },
    itemName: { fontWeight: 'bold', fontSize: 10 },
    itemDesc: { fontSize: 9, color: '#6b7280' },

    // Totals
    totalsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 24,
    },
    totalsTable: {
      width: '40%',
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '4 0',
    },
    totalsLabel: {
      fontSize: 10,
      color: '#6b7280',
    },
    totalsValue: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    totalsDivider: {
      borderTopWidth: 1,
      borderTopColor: '#d1d5db',
      marginVertical: 4,
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: '6 0',
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: primary,
    },
    grandTotalValue: {
      fontSize: 12,
      fontWeight: 'bold',
      color: primary,
    },

    // Footer
    footer: {
      marginTop: 'auto',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    footerTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    footerText: {
      fontSize: 9,
      color: '#6b7280',
      lineHeight: 1.5,
    },
  });
}

interface InvoicePdfProps {
  data: InvoiceData;
  style?: InvoiceStyleOptions;
}

export function InvoicePdf({ data, style: styleOptions }: InvoicePdfProps) {
  const s = createStyles(styleOptions);
  const cur = data.currency;
  const taxLabel = data.taxLabel || 'Tax';

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            {data.companyLogo ? (
              <Image src={data.companyLogo} style={s.logo} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{data.companyName}</Text>
            )}
          </View>
          <View>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <View style={s.invoiceMeta}>
              <Text style={s.metaLabel}>Invoice No.</Text>
              <Text style={s.metaValue}>{data.invoiceNumber}</Text>
              <Text style={{ ...s.metaLabel, marginTop: 4 }}>Date</Text>
              <Text style={s.metaValue}>{data.invoiceDate}</Text>
              {data.dueDate && (
                <>
                  <Text style={{ ...s.metaLabel, marginTop: 4 }}>Due Date</Text>
                  <Text style={s.metaValue}>{data.dueDate}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Addresses */}
        <View style={s.addressRow}>
          <View style={s.addressBlock}>
            <Text style={s.addressTitle}>From</Text>
            <Text style={s.addressName}>{data.companyName}</Text>
            {data.companyAddress?.map((line, i) => (
              <Text key={i} style={s.addressLine}>{line}</Text>
            ))}
            {data.companyEmail && <Text style={s.addressLine}>{data.companyEmail}</Text>}
            {data.companyPhone && <Text style={s.addressLine}>{data.companyPhone}</Text>}
            {data.companyTaxId && <Text style={s.addressLine}>Tax ID: {data.companyTaxId}</Text>}
          </View>
          <View style={s.addressBlock}>
            <Text style={s.addressTitle}>Bill To</Text>
            <Text style={s.addressName}>{data.customerName}</Text>
            {data.customerAddress?.map((line, i) => (
              <Text key={i} style={s.addressLine}>{line}</Text>
            ))}
            <Text style={s.addressLine}>{data.customerEmail}</Text>
            {data.customerTaxId && <Text style={s.addressLine}>Tax ID: {data.customerTaxId}</Text>}
          </View>
        </View>

        {/* Line items table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={{ ...s.tableHeaderText, ...s.colName }}>Item</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colDesc }}>Description</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colQty }}>Qty</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colPrice }}>Price</Text>
            <Text style={{ ...s.tableHeaderText, ...s.colTotal }}>Total</Text>
          </View>
          {data.lineItems.map((item, i) => (
            <View key={i} style={i % 2 === 1 ? s.tableRowAlt : s.tableRow}>
              <Text style={{ ...s.itemName, ...s.colName }}>{item.name}</Text>
              <Text style={{ ...s.itemDesc, ...s.colDesc }}>{item.description || ''}</Text>
              <Text style={{ ...s.colQty, fontSize: 10 }}>{item.quantity}</Text>
              <Text style={{ ...s.colPrice, fontSize: 10 }}>{formatCurrency(item.unitPrice, cur)}</Text>
              <Text style={{ ...s.colTotal, fontSize: 10, fontWeight: 'bold' }}>{formatCurrency(item.total, cur)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsContainer}>
          <View style={s.totalsTable}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>{formatCurrency(data.subtotal, cur)}</Text>
            </View>

            {data.discount !== undefined && data.discount > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Discount</Text>
                <Text style={s.totalsValue}>-{formatCurrency(data.discount, cur)}</Text>
              </View>
            )}

            {data.shipping !== undefined && data.shipping > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Shipping</Text>
                <Text style={s.totalsValue}>{formatCurrency(data.shipping, cur)}</Text>
              </View>
            )}

            {data.tax !== undefined && data.tax > 0 && (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>
                  {taxLabel}{data.taxRate ? ` (${data.taxRate}%)` : ''}
                </Text>
                <Text style={s.totalsValue}>{formatCurrency(data.tax, cur)}</Text>
              </View>
            )}

            <View style={s.totalsDivider} />

            <View style={s.grandTotalRow}>
              <Text style={s.grandTotalLabel}>Total</Text>
              <Text style={s.grandTotalValue}>{formatCurrency(data.total, cur)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        {(data.notes || data.paymentTerms) && (
          <View style={s.footer}>
            {data.paymentTerms && (
              <>
                <Text style={s.footerTitle}>Payment Terms</Text>
                <Text style={s.footerText}>{data.paymentTerms}</Text>
              </>
            )}
            {data.notes && (
              <View style={{ marginTop: data.paymentTerms ? 8 : 0 }}>
                <Text style={s.footerTitle}>Notes</Text>
                <Text style={s.footerText}>{data.notes}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}

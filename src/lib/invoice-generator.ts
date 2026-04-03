import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type definition for the order handled by the generator
interface OrderData {
  id: string; // Order/Payment ID
  customer: string;
  total: number;
  subtotal: number;
  tax: number;
  protectFee: number;
  shipping: number;
  date: string;
  items: any[];
  delivery: any;
  paymentMethod?: string;
}

export const generateInvoice = async (order: OrderData) => {
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;

  // 1. Logo and Header
  try {
    const logoUrl = '/lemuria-logo.png';
    doc.addImage(logoUrl, 'PNG', margin, 10, 30, 30);
  } catch (e) {
    console.error('Logo loading failed', e);
  }

  // Header Title
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth - margin, 45, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Original for Recipient', pageWidth - margin, 50, { align: 'right' });

  // 2. Bill To / From
  doc.setFontSize(12);
  doc.setTextColor(30, 100, 255); // Blue
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin, 70);
  doc.text('FROM', pageWidth - margin, 70, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Bill To Details
  const delivery = typeof order.delivery === 'string' ? JSON.parse(order.delivery) : order.delivery;
  doc.setFont('helvetica', 'bold');
  doc.text(order.customer, margin, 80);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(delivery.address || 'N/A', 80);
  doc.text(addressLines, margin, 85);
  doc.text(`Pincode: ${delivery.pincode || 'N/A'}`, margin, 85 + (addressLines.length * 5));
  doc.text(`Phone: ${delivery.contact || 'N/A'}`, margin, 90 + (addressLines.length * 5));

  // From Details
  doc.setFont('helvetica', 'bold');
  doc.text('LEMURIA VARMAKALARI ADIMURAI WORLD ORGANIZATION', pageWidth - margin, 80, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('SELVA TOWER, 129 B, 3rd FLOOR', pageWidth - margin, 85, { align: 'right' });
  doc.text('VEPPAMOODU JUNCTION, NAGERCOIL - 629001', pageWidth - margin, 90, { align: 'right' });
  doc.text('KANYAKUMARI DISTRICT', pageWidth - margin, 95, { align: 'right' });
  doc.text('Mobile: 9443719569, 7871152163', pageWidth - margin, 100, { align: 'right' });

  // 3. Invoice Metadata Table
  const metaData = [
    ['Invoice #', `INV-${new Date(order.date).getFullYear()}-${order.id.slice(-4)}`],
    ['Order #', `ORD_${order.id.slice(-4)}`], // Using last 4 for consistency with mockup
    ['Order Date', new Date(order.date).toLocaleDateString()]
  ];

  autoTable(doc, {
    startY: 110,
    body: metaData,
    theme: 'plain',
    styles: { cellPadding: 1, fontSize: 10, halign: 'right' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
    margin: { left: pageWidth - 80 }
  });

  // 4. Ordered Products Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ordered Products', margin, (doc as any).lastAutoTable.finalY + 15);

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const productRows = items.map((item: any) => {
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    return [
      item.name || 'Unknown Artifact',
      item.description || 'Artifact of high heritage value, handcrafted with precision.',
      item.variantSize || 'Standard',
      quantity,
      `INR ${price.toLocaleString()}`,
      `INR ${(price * quantity).toLocaleString()}`
    ];
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Name', 'Description', 'Size', 'Qty', 'Unit Price', 'Total Price']],
    body: productRows,
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 80 },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    }
  });

  // 5. Order Summary Table
  doc.setFont('helvetica', 'bold');
  doc.text('Order Summary', margin, (doc as any).lastAutoTable.finalY + 15);

  const summaryData = [[
    `INR ${order.subtotal?.toLocaleString() || '0'}`,
    `INR ${order.protectFee?.toLocaleString() || '50'}`,
    `INR ${order.shipping?.toLocaleString() || '100'}`,
    `INR ${order.total.toLocaleString()}`,
    order.paymentMethod || 'Razorpay Online'
  ]];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Product Price', 'Protect Fee', 'Shipping', 'Total', 'Payment Method']],
    body: summaryData,
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { halign: 'center', fontSize: 10, cellPadding: 5 }
  });

  // 6. Terms & Conditions and Sold By
  const footerY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• Computer generated invoice. Signature not required.', margin, footerY + 7);
  doc.text('• Tax not payable on reverse charge basis.', margin, footerY + 12);
  doc.text('• Includes applicable discounts and offers.', margin, footerY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Sold by:', margin, footerY + 30);
  doc.setFont('helvetica', 'normal');
  doc.text('Lemuria Arts Private Limited, Thaikalam Nager, Ramanathichanputhur,', margin + 15, footerY + 30);
  doc.text('Marungoor, Kanyakumari District, Tamilnadu - 629402', margin + 15, footerY + 35);
  doc.text('Mobile: +91 77082 44424, +91 9944776601 | Email: lemuriamas@gmail.com', margin + 15, footerY + 40);

  // Save the PDF
  doc.save(`Invoice_${order.id.slice(-8)}.pdf`);
};

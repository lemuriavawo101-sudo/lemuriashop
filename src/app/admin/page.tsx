"use client";

import React, { useState, useEffect, useMemo } from 'react';
import styles from './admin.module.css';
import dynamic from 'next/dynamic';

const CinematicViewer = dynamic(() => import('@/components/ModelViewer/CinematicViewer'), { ssr: false });
const VisualRotator = dynamic(() => import('@/components/ModelViewer/VisualRotator'), { ssr: false });

interface ProductVariant {
  size: string;
  price: number;
  old_price: number;
  stock: number;
  refillLevel: number;
}

interface Product {
  id?: number;
  name: string;
  category: string;
  description: string;
  isWeapon: boolean;
  variants: ProductVariant[];
  image: string;
  model3d?: string;
  rotation?: number;
  modelRotation?: number;
  modelRotationX?: number;
  modelRotationZ?: number;
  artifactType: string;
  stock: 'In Stock' | 'Out of Stock';
  showInCollection?: boolean;
}

interface Order {
  id: string;
  customer: string;
  items: any[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
  delivery?: {
    address: string;
    contact: string;
    pincode: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  measurements?: string;
  materials?: string;
  status: string;
  date: string;
}

const CATEGORIES = [
  "Weapons", "Decoration", "Books", "Attire", "Tools"
];

const TAGS = ["", "Highlight", "Spotlight", "New", "Exclusive"];

const Sidebar = ({ activeView, setActiveView, counts }: { activeView: any, setActiveView: (v: any) => void, counts: { lowStock: number, pendingOrders: number, newEnquiries: number } }) => (
  <div className={styles.sidebar}>
    <div className={styles.logo}>LEMURIA</div>
    <nav className={styles.nav}>
      <button 
        className={`${styles.navItem} ${activeView === 'inventory' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('inventory')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        <span>Inventory</span>
        {counts.lowStock > 0 && <span className={styles.navBadge}>{counts.lowStock}</span>}
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'orders' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('orders')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Orders</span>
        {counts.pendingOrders > 0 && <span className={styles.navBadge}>{counts.pendingOrders}</span>}
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'enquiries' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('enquiries')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        <span>Inquiries</span>
        {counts.newEnquiries > 0 && <span className={styles.navBadge}>{counts.newEnquiries}</span>}
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'users' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('users')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Users</span>
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'leads' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('leads')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2 4-4"/><path d="m22 10-6-6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10Z"/><path d="M16 4v6h6"/></svg>
        <span>Leads</span>
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'deals' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('deals')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L12 18l-1.5-1.5-2 3.5 6.5-6.5h-3l2.5-11.5z"/></svg>
        <span>Deals</span>
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'showcase' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('showcase')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></svg>
        <span>Showcase</span>
      </button>
      <button 
        className={`${styles.navItem} ${activeView === 'maintenance' ? styles.navItemActive : ''}`}
        onClick={() => setActiveView('maintenance')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>Settings</span>
      </button>
    </nav>
  </div>
);

const ExportControls = ({ data, type, filename }: { data: any[], type: 'inventory' | 'orders' | 'users' | 'leads', filename: string }) => {
  const formatData = (items: any[], view: string) => {
    if (view === 'inventory') {
      return items.map(p => ({
        'Artifact Name': p.name || 'Unknown',
        'Category': p.category || 'Standard',
        'Type': p.artifactType || 'N/A',
        'Description': (p.description || '').substring(0, 100) + '...',
        'Variants': Array.isArray(p.variants) ? p.variants.map((v: any) => `${v.size}: ₹${v.price}`).join(' | ') : 'N/A'
      }));
    } else if (view === 'orders') {
      return items.map(o => ({
        'Order ID': o.id,
        'Customer': o.customer,
        'Total': `₹${o.total}`,
        'Status': o.status,
        'Date': o.date
      }));
    } else {
      return items.map(u => ({
        'Access ID': u.id,
        'Practitioner Name': u.name,
        'Vault Email': u.email,
        'Security Role': (u.role || '').toUpperCase()
      }));
    }
  };

  const exportToExcel = async () => {
    if (!data.length) return alert('No records to export');
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(formatData(data, type));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Archive_Log");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      alert('Failed to export to Excel.');
    }
  };

  const exportToCSV = async () => {
    if (!data.length) return alert('No records to export');
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(formatData(data, type));
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Failed to export to CSV.');
    }
  };

  const exportToPDF = async () => {
    if (!data.length) return alert('No records to export');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('l', 'pt', 'a4');
      const formatted = formatData(data, type);
      const headers = [Object.keys(formatted[0])];
      const body = formatted.map((item: any) => Object.values(item));

      autoTable(doc, {
        head: headers,
        body: body as any,
        theme: 'grid',
        headStyles: { fillColor: [17, 17, 17], textColor: [191, 149, 63] },
        styles: { fontSize: 8, cellPadding: 5 }
      });
      doc.save(`${filename}.pdf`);
    } catch (e) {
      alert('Failed to export to PDF.');
    }
  };

  return (
    <div className={styles.exportToolbar}>
      <button onClick={exportToCSV} className={styles.exportBtn}>CSV</button>
      <button onClick={exportToExcel} className={styles.exportBtn}>EXCEL</button>
      <button onClick={exportToPDF} className={styles.exportBtn}>PDF ARCHIVE</button>
    </div>
  );
};

const CategoryView = ({ products, onUpdate }: { products: Product[], onUpdate: () => void }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, [products]);

  const handleRename = async (oldName: string) => {
    if (!newName) return;
    const resp = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName })
    });
    if (resp.ok) {
      setEditingCategory(null);
      setNewName('');
      onUpdate();
    }
  };

  const handleDelete = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? All associated products will be moved to "Uncategorized".`)) return;
    const resp = await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryName })
    });
    if (resp.ok) {
      onUpdate();
    }
  };

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <h2 className={styles.title}>CATEGORIES</h2>
      </div>
      <div className={styles.productList}>
        {categories.map(cat => (
          <div key={cat} className={styles.productItem}>
            <div className={styles.details}>
              {editingCategory === cat ? (
                <div className={styles.renameActiveGroup}>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    placeholder="New category name"
                    autoFocus
                  />
                  <button onClick={() => handleRename(cat)} className={styles.saveRenameBtn}>SAVE</button>
                  <button onClick={() => setEditingCategory(null)} className={styles.cancelRenameBtn}>CANCEL</button>
                </div>
              ) : (
                <h3>{cat.toUpperCase()}</h3>
              )}
              <p>{products.filter(p => p.category === cat).length} Products in this archive</p>
            </div>
            <div className={styles.actions}>
              <button onClick={() => {setEditingCategory(cat); setNewName(cat);}} className={styles.editBtn}>RENAME</button>
              <button onClick={() => handleDelete(cat)} className={styles.deleteBtn}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InventoryView = ({ products, onAdd, onEdit, onDelete, onStockUpdate }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>INVENTORY</h1>
          <div className={styles.searchBox}>
            <input 
              placeholder="Search artifacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ExportControls data={filteredProducts} type="inventory" filename="Lemuria_Inventory_Log" />
          <button className={styles.stockUpdateBtn} onClick={onStockUpdate}>📦 Stock Update</button>
          <button className={styles.addBtn} onClick={onAdd}>+ Add Artifact</button>
        </div>
      </div>
      <div className={styles.productList}>
        {filteredProducts.map((p: Product) => (
          <div key={p.id} className={styles.productItem}>
            <div className={styles.productInfo}>
              <div className={styles.imageThumb}>
                <img src={p.image} alt={p.name} className={styles.productImage} />
              </div>
              <div className={styles.details}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p>{p.category} • {p.artifactType} • {p.variants.length} Variants</p>
                  {p.variants.some(v => v.stock <= (v.refillLevel || 0)) && (
                    <span className={styles.refillBadge}>⚠️ REFILL NEEDED</span>
                  )}
                </div>
                <div className={styles.priceOverview}>
                  ₹{p.variants[0]?.price.toLocaleString()}
                  {p.model3d && <span className={styles.modelBadge}>3D Model Attached</span>}
                  <span className={`${styles.statusBadge} ${p.stock === 'In Stock' ? styles.statusDelivered : styles.statusShipped}`} style={{ marginLeft: '10px' }}>
                    {p.stock === 'In Stock' ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                  <span 
                    className={styles.statusBadge} 
                    style={{ 
                      marginLeft: '10px', 
                      background: p.showInCollection ? 'rgba(191, 149, 63, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: p.showInCollection ? '#BF953F' : '#666',
                      border: p.showInCollection ? '1px solid #BF953F' : '1px solid #444'
                    }}
                  >
                    {p.showInCollection ? '🌟 IN COLLECTION' : '📁 HIDDEN'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.stockBtn} 
                style={p.showInCollection ? { borderColor: '#BF953F', color: '#BF953F' } : {}}
                onClick={async () => {
                  const updated = { ...p, showInCollection: !p.showInCollection };
                  await fetch('/api/products', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated)
                  });
                  onStockUpdate(); // Refresh parent
                }}
              >
                {p.showInCollection ? 'Unhide' : 'Show'}
              </button>
              <button className={styles.editBtn} onClick={() => onEdit(p)}>Edit</button>
              <button className={styles.deleteBtn} onClick={() => onDelete(p.id!)}>Delete</button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className={styles.noResults}>No artifacts found matching your search.</div>
        )}
      </div>
    </div>
  );
};

// ... OrdersView and UsersView remain similar or can be polished if needed ...
const OrdersView = ({ orders, onStatusUpdate, onDelete }: any) => (
  <div className={styles.view}>
    <div className={styles.header}>
      <h1 className={styles.title}>ORDER TRACKING</h1>
      <ExportControls data={orders} type="orders" filename="Lemuria_Order_Archive" />
    </div>
    <div className={styles.tableWrapper}>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Delivery Address</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: Order) => (
            <tr key={o.id} className={styles.orderRow}>
              <td className={styles.orderId}>{o.id}</td>
              <td className={styles.customer}>{o.customer}</td>
              <td className={styles.items}>
                {Array.isArray(o.items) 
                  ? o.items.map((i: any, idx: number) => (
                      <div key={idx}>
                        {typeof i === 'object' ? `${i.quantity} x ${i.name} (${i.variantSize})` : i}
                      </div>
                    ))
                  : o.items}
              </td>
              <td className={styles.total}>₹{o.total.toLocaleString()}</td>
              <td className={styles.deliveryInfo}>{o.delivery?.address || 'Address Not Found'}</td>
              <td className={styles.contactInfo}>{o.delivery?.contact || 'No Contact'}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select 
                    className={styles.statusSelect}
                    value={o.status}
                    onChange={(e) => onStatusUpdate(o.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  {o.status !== 'Delivered' && (
                    <button 
                      className={styles.markDeliveredBtn}
                      onClick={() => onStatusUpdate(o.id, 'Delivered')}
                      title="Quick Mark as Delivered"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </td>
              <td>{o.date}</td>
              <td>
                <button 
                  className={styles.deleteBtn} 
                  onClick={() => onDelete(o.id)}
                  title="Remove Order"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const UsersView = ({ users }: { users: User[] }) => (
  <div className={styles.view}>
    <div className={styles.header}>
      <h1 className={styles.title}>USER MANAGEMENT</h1>
      <ExportControls data={users} type="users" filename="Lemuria_Practitioner_Registry" />
    </div>
    <div className={styles.tableWrapper}>
      <table className={styles.orderTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: User) => (
            <tr key={u.id} className={styles.orderRow}>
              <td className={styles.orderId}>{u.id}</td>
              <td className={styles.customer}>{u.name}</td>
              <td className={styles.items}>{u.email}</td>
              <td className={styles.phone}>{u.phone || 'N/A'}</td>
              <td>
                <span className={`${styles.statusBadge} ${u.role === 'admin' ? styles.statusPending : styles.statusShipped}`}>
                  {u.role.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const LeadsView = ({ users }: { users: User[] }) => (
  <div className={styles.view}>
    <div className={styles.header}>
      <h1 className={styles.title}>PRACTITIONER LEADS</h1>
      <ExportControls data={users} type="users" filename="Lemuria_Lead_Archive" />
    </div>
    <div className={styles.productList}>
      {users.map((u: User) => (
        <div key={u.id} className={styles.productItem}>
          <div className={styles.productInfo}>
            <div className={styles.details} style={{ paddingLeft: 0 }}>
              <h3 style={{ fontSize: '1.1rem', color: '#BF953F' }}>{u.name.toUpperCase()}</h3>
              <p style={{ margin: '5px 0' }}>{u.email}</p>
              <div className={styles.priceOverview}>
                <span className={styles.modelBadge} style={{ background: 'rgba(191, 149, 63, 0.1)', color: '#BF953F' }}>
                  📞 {u.phone || 'NO CONTACT RECORDED'}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <a href={`mailto:${u.email}`} className={styles.editBtn} style={{ textDecoration: 'none' }}>Email</a>
            <a href={`tel:${u.phone}`} className={styles.stockBtn} style={{ textDecoration: 'none' }}>Call</a>
          </div>
        </div>
      ))}
      {users.length === 0 && (
        <div className={styles.noResults}>No practitioner leads found.</div>
      )}
    </div>
  </div>
);

const EnquiriesView = ({ enquiries, onStatusUpdate, onDelete }: { enquiries: Enquiry[], onStatusUpdate: (id: string, s: string) => void, onDelete: (id: string) => void }) => (
  <div className={styles.view}>
    <div className={styles.header}>
      <h1 className={styles.title}>INQUIRY LOG</h1>
      <p className={styles.count}>{enquiries.length} Artifact Inquiries</p>
    </div>
    <div className={styles.enquiryGrid}>
      {enquiries.map(enq => (
        <div key={enq.id} className={styles.enquiryCard}>
          <div className={styles.enquiryHeader}>
            <div className={styles.enquiryMeta}>
              <h3 className={styles.enquiryName}>{enq.name}</h3>
              <a href={`mailto:${enq.email}`} className={styles.enquiryEmail}>{enq.email}</a>
              <span className={styles.enquiryDate}>{new Date(enq.date).toLocaleString()}</span>
            </div>
            <span className={styles.enquirySubject}>{enq.subject}</span>
          </div>

          <p className={styles.enquiryMessage}>{enq.message}</p>

          {(enq.measurements || enq.materials) && (
            <div className={styles.enquiryDetails}>
              {enq.measurements && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Measurements:</span>
                  <span className={styles.detailValue}>{enq.measurements}</span>
                </div>
              )}
              {enq.materials && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Materials:</span>
                  <span className={styles.detailValue}>{enq.materials}</span>
                </div>
              )}
            </div>
          )}

          {enq.phone && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Contact:</span>
              <a href={`tel:${enq.phone}`} className={styles.detailValue} style={{ color: '#BF953F', textDecoration: 'none' }}>{enq.phone}</a>
            </div>
          )}

          <div className={styles.enquiryFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                className={styles.statusSelect}
                value={enq.status}
                onChange={(e) => onStatusUpdate(enq.id, e.target.value)}
                style={{ fontSize: '0.7rem', padding: '5px' }}
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Responded">Responded</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button 
              className={styles.deleteBtn}
              onClick={() => onDelete(enq.id)}
              style={{ padding: '8px' }}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
      {enquiries.length === 0 && (
        <div className={styles.noResults}>No active inquiries found in the archive.</div>
      )}
    </div>
  </div>
);

const DealOfDayView = ({ products, dealIds, setDealIds }: { products: Product[], dealIds: number[], setDealIds: (ids: number[]) => void }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleDeal = (id: number) => {
    if (dealIds.includes(id)) {
      setDealIds(dealIds.filter(d => d !== id));
    } else {
      if (dealIds.length >= 5) {
        alert('Maximum 5 "Deal of the Day" products allowed. Remove one before adding another.');
        return;
      }
      setDealIds([...dealIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: dealIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Save failed: ${data.error || 'Unknown error'}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      alert(`Save failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🔥 DEAL OF THE DAY</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '6px' }}>
            Select up to <strong style={{ color: '#BF953F' }}>5 products</strong> to feature in the homepage spotlight slider.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#BF953F', fontWeight: 800, fontSize: '0.85rem' }}>
            {dealIds.length} / 5 selected
          </span>
          <button
            className={styles.submitBtn}
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: '140px' }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Deals'}
          </button>
        </div>
      </div>

      <div className={styles.productList}>
        {products.map((p: Product) => {
          const isSelected = dealIds.includes(p.id!);
          return (
            <div
              key={p.id}
              className={styles.productItem}
              style={{
                border: isSelected ? '1px solid #BF953F' : '1px solid rgba(255,255,255,0.05)',
                background: isSelected ? 'rgba(191,149,63,0.06)' : undefined,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => toggleDeal(p.id!)}
            >
              <div className={styles.productInfo}>
                <div className={styles.imageThumb}>
                  <img src={p.image} alt={p.name} className={styles.productImage} />
                  {isSelected && (
                    <span className={styles.tagBadge} style={{ background: '#BF953F' }}>✓ DEAL</span>
                  )}
                </div>
                <div className={styles.details}>
                  <h3>{p.name}</h3>
                  <p>{p.category} • ₹{p.variants[0]?.price.toLocaleString()}</p>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={isSelected ? styles.deleteBtn : styles.stockBtn}
                  style={isSelected ? { background: 'rgba(191,149,63,0.15)', color: '#BF953F', border: '1px solid #BF953F' } : {}}
                  onClick={(e) => { e.stopPropagation(); toggleDeal(p.id!); }}
                >
                  {isSelected ? '✓ Remove' : '+ Add to Deals'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ShowcaseView = ({ products, showcaseIds, setShowcaseIds }: { products: Product[], showcaseIds: number[], setShowcaseIds: (ids: number[]) => void }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleShowcaseItem = (id: number) => {
    if (showcaseIds.includes(id)) {
      setShowcaseIds(showcaseIds.filter(d => d !== id));
    } else {
      setShowcaseIds([...showcaseIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/showcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: showcaseIds }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🎬 CINEMATIC SHOWCASE</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '6px' }}>
            Select artifacts to feature in the high-performance 3D "Auto-play" player.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#BF953F', fontWeight: 800, fontSize: '0.85rem' }}>
            {showcaseIds.length} Items Selected
          </span>
          <button
            className={styles.submitBtn}
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: '160px' }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Showcase'}
          </button>
        </div>
      </div>

      <div className={styles.productList}>
        {products.map((p: Product) => {
          const isSelected = showcaseIds.includes(p.id!);
          return (
            <div
              key={p.id}
              className={styles.productItem}
              style={{
                border: isSelected ? '1px solid #BF953F' : '1px solid rgba(255,255,255,0.05)',
                background: isSelected ? 'rgba(191,149,63,0.06)' : undefined,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => toggleShowcaseItem(p.id!)}
            >
              <div className={styles.productInfo}>
                <div className={styles.imageThumb}>
                  <img src={p.image} alt={p.name} className={styles.productImage} />
                  {isSelected && (
                    <span className={styles.tagBadge} style={{ background: '#BF953F' }}>✓ ON STAGE</span>
                  )}
                </div>
                <div className={styles.details}>
                  <h3>{p.name}</h3>
                  <p>{p.category} • {p.model3d ? '3D Model Available' : 'No 3D Model'}</p>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={isSelected ? styles.deleteBtn : styles.stockBtn}
                  onClick={(e) => { e.stopPropagation(); toggleShowcaseItem(p.id!); }}
                >
                  {isSelected ? 'Remove' : 'Add to Stage'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [activeView, setActiveView] = useState<'inventory' | 'orders' | 'users' | 'enquiries' | 'leads' | 'deals' | 'showcase' | 'categories' | 'maintenance'>('inventory');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [dealIds, setDealIds] = useState<number[]>([]);
  const [showcaseIds, setShowcaseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockFilterId, setStockFilterId] = useState<number | null>(null);
  const [preview3dOpen, setPreview3dOpen] = useState(false);
  const [isRotatorOpen, setIsRotatorOpen] = useState(false);

  const initialFormState: Product = {
    name: '', category: CATEGORIES[0], description: '', isWeapon: false, 
    variants: [{ size: 'Standard', price: 0, old_price: 0, stock: 10, refillLevel: 3 }], image: '', model3d: '', rotation: 0, modelRotation: 0, modelRotationX: 0, modelRotationZ: 0,
    artifactType: 'Standard',
    stock: 'In Stock',
    showInCollection: true
  };

  const [formData, setFormData] = useState<Product>(initialFormState);

  useEffect(() => {
    fetchData();
  }, [activeView]);

  // Always load products list (needed for Deals view)
  useEffect(() => {
    // Check auth first
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    fetch('/api/products').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProducts(data);
    });
    fetch('/api/deals').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setDealIds(data);
    });
    fetch('/api/showcase').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setShowcaseIds(data);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError(false);
    
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await resp.json();
      if (resp.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        setAuthError(false);
      } else {
        setAuthError(true);
        setTimeout(() => setAuthError(false), 3000);
      }
    } catch (err) {
      setAuthError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeView === 'inventory') {
        const resp = await fetch('/api/products');
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error || 'Failed to fetch products');
        setProducts(data);
      } else if (activeView === 'orders') {
        const resp = await fetch('/api/orders');
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error || 'Failed to fetch orders');
        setOrders(data);
      } else if (activeView === 'users' || activeView === 'leads') {
        const resp = await fetch('/api/users');
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error || 'Failed to fetch users');
        setUsers(data);
      } else if (activeView === 'enquiries') {
        const resp = await fetch('/api/admin/enquiries');
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error || 'Failed to fetch enquiries');
        setEnquiries(data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchData();
    } catch (e) { console.error('Update failed'); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Permanently remove this acquisition from the archive?')) return;
    try {
      await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchData();
    } catch (e) { console.error('Delete failed'); }
  };

  const counts = useMemo(() => {
    const lowStock = (Array.isArray(products) ? products : []).filter(p => p.variants?.some(v => v.stock <= (v.refillLevel || 0))).length;
    const pendingOrders = (Array.isArray(orders) ? orders : []).filter(o => o.status === 'Pending').length;
    const newEnquiries = (Array.isArray(enquiries) ? enquiries : []).filter(e => e.status === 'New').length;
    return { lowStock, pendingOrders, newEnquiries };
  }, [products, orders, enquiries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    await fetch('/api/products', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleCategoryRename = async () => {
    if (!renameValue || renameValue === formData.category) {
      setIsRenaming(false);
      return;
    }

    try {
      const resp = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName: formData.category, newName: renameValue })
      });

      if (resp.ok) {
        setFormData(prev => ({ ...prev, category: renameValue }));
        setIsRenaming(false);
        fetchData(); // Refresh list to show new names
      } else {
        alert('Failed to rename category. Please ensure you are not renaming to an empty value.');
      }
    } catch (err) {
      console.error('Rename failed:', err);
      alert('A technical error occurred during renaming.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Proceed with deletion?')) return;
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', price: 0, old_price: 0, stock: 10, refillLevel: 3 }]
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) return;
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'model3d') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    }
  };

  const handleSeed = async () => {
    if (!confirm('CRITICAL ACTION: This will overwrite ALL current product, deal, and review data with the master seed archive. Proceed?')) return;
    
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/seed', { method: 'POST' });
      if (resp.ok) {
        alert('Archive restored to master seed state.');
        window.location.reload();
      } else {
        throw new Error('Seed failed');
      }
    } catch (e) {
      alert('Failed to seed archive.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloudSync = async () => {
    if (!confirm('This will synchronize your local heritage records with the Turso Cloud Database. Proceed?')) return;
    
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/db-sync', { method: 'POST' });
      if (resp.ok) {
        alert('Heritage Records Synchronized with Turso Cloud.');
      } else {
        const data = await resp.json();
        throw new Error(data.error || 'Sync failed');
      }
    } catch (e: any) {
      alert('Sync Failure: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackfill = async () => {
    if (!confirm('This will associate orphaned historical orders to registered practitioner accounts where names match. Proceed?')) return;
    
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/backfill', { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        alert(`Archive Cleanse Complete: ${data.updated} records successfully associated.`);
        fetchData(); // Refresh UI data
      } else {
        throw new Error('Backfill process failed.');
      }
    } catch (e: any) {
      alert('Archive Maintenance Failure: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authLogo}>LEMURIA</div>
          <h2 className={styles.authTitle}>SECURITY GATEWAY</h2>
          <p className={styles.authSubtitle}>ENTER ARCHIVE ACCESS CODE</p>
          
          <form className={styles.authForm} onSubmit={handleLogin}>
            <input 
              type="email" 
              className={styles.authInput} 
              placeholder="CURATOR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input 
              type="password" 
              className={styles.authInput} 
              placeholder="ACCESS KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className={styles.authBtn} disabled={loginLoading}>
              {loginLoading ? 'VALIDATING...' : 'VERIFY IDENTITY'}
            </button>
            {authError && <div className={styles.authError}>IDENTIFICATION FAILURE</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} counts={counts} />
      
      <main className={styles.mainContent}>
        {(counts.lowStock > 0 || counts.pendingOrders > 0 || counts.newEnquiries > 0) && (
          <div className={styles.globalAlertBar}>
            <span className={styles.alertTitle}>REQUIRED ACTION:</span>
            {counts.lowStock > 0 && (
              <button 
                className={styles.alertLink} 
                onClick={() => { setActiveView('inventory'); setIsStockModalOpen(true); }}
              >
                ⚠️ {counts.lowStock} products are below refill level
              </button>
            )}
            {counts.pendingOrders > 0 && (
              <button 
                className={styles.alertLink}
                onClick={() => setActiveView('orders')}
              >
                📦 {counts.pendingOrders} pending orders require processing
              </button>
            )}
            {counts.newEnquiries > 0 && (
              <button 
                className={styles.alertLink}
                onClick={() => setActiveView('enquiries')}
              >
                📜 {counts.newEnquiries} new inquiries received
              </button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Accessing Lemuria Vault...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <h2>⚠️ ARCHIVE ACCESS ERROR</h2>
            <p>{error}</p>
            <button onClick={fetchData} className={styles.retryBtn}>Retry Connection</button>
          </div>
        ) : activeView === 'inventory' ? (
          <InventoryView 
            products={products} 
            onAdd={() => { 
              setEditingProduct(null); 
              setFormData(initialFormState); 
              setIsAddingNewCategory(false);
              setNewCategoryName('');
              setIsModalOpen(true); 
            }}
            onEdit={(p: Product) => { 
              setEditingProduct(p); 
              setFormData(p); 
              setIsAddingNewCategory(false);
              setNewCategoryName('');
              setIsModalOpen(true); 
            }}
            onDelete={handleDelete}
            onStockUpdate={(p?: Product) => {
              setStockFilterId(p?.id ?? null);
              setIsStockModalOpen(true);
            }}
          />
        ) : activeView === 'orders' ? (
          <OrdersView orders={orders} onStatusUpdate={handleStatusUpdate} onDelete={handleDeleteOrder} />
        ) : activeView === 'deals' ? (
          <DealOfDayView products={products} dealIds={dealIds} setDealIds={setDealIds} />
        ) : activeView === 'showcase' ? (
          <ShowcaseView products={products} showcaseIds={showcaseIds} setShowcaseIds={setShowcaseIds} />
        ) : activeView === 'categories' ? (
          <CategoryView products={products} onUpdate={fetchData} />
        ) : activeView === 'maintenance' ? (
          <div className={styles.view}>
            <div className={styles.header}>
              <h2 className={styles.title}>ARCHIVE MAINTENANCE</h2>
            </div>
            
            <div className={styles.maintenanceCard}>
              <div className={styles.maintenanceLabel}>SYSTEM INITIALIZATION</div>
              <h1 className={styles.maintenanceTitle}>Master Seed Restoration</h1>
              <p className={styles.maintenanceDesc}>
                This action will permanently overwrite the current product, deal, and review archives with the master curated seed data. 
                Use this to initialize a new archive or reset to "Obsidian Studio" default showcase states.
              </p>
              <button 
                className={styles.seedBtn} 
                onClick={handleSeed}
                disabled={loading}
              >
                {loading ? 'INITIALIZING ARCHIVE...' : 'EXECUTE SEED RESTORATION'}
              </button>
            </div>

            <div className={styles.maintenanceCard} style={{ marginTop: '20px', border: '1px solid rgba(191, 149, 63, 0.4)' }}>
              <div className={styles.maintenanceLabel}>DATA INTEGRITY MAINTENANCE</div>
              <h1 className={styles.maintenanceTitle}>Archive Synchronization</h1>
              <p className={styles.maintenanceDesc}>
                Automatically scan legacy acquisitions (orders without linked user accounts) and associate them with registered practitioners who share the same archival name. Let no heritage be lost.
              </p>
              <button 
                className={styles.seedBtn} 
                onClick={handleBackfill}
                disabled={loading}
                style={{ background: '#111', color: '#BF953F', border: '1px solid #BF953F' }}
              >
                {loading ? 'CLEANSING ARCHIVE...' : 'CLEANSE & BACKFILL ARCHIVE'}
              </button>
            </div>

            <div className={styles.maintenanceCard} style={{ marginTop: '20px', border: '1px solid rgba(191, 149, 63, 0.4)' }}>
              <div className={styles.maintenanceLabel}>CLOUD INFRASTRUCTURE</div>
              <h1 className={styles.maintenanceTitle}>Turso Cloud Synchronization</h1>
              <p className={styles.maintenanceDesc}>
                Synchronize your local museum records with the Turso Real-Time Cloud Database. 
                This will establish your cloud persistence and enable global accessibility for your collection.
              </p>
              <button 
                className={styles.seedBtn} 
                onClick={handleCloudSync}
                disabled={loading}
                style={{ background: '#BF953F', color: '#000' }}
              >
                {loading ? 'SYNCHRONIZING CLOUD...' : 'ESTABLISH CLOUD PERSISTENCE'}
              </button>
            </div>
            
            <style jsx>{`
              .${styles.maintenanceCard} {
                background: rgba(20, 20, 20, 0.4);
                border: 1px solid rgba(191, 149, 63, 0.2);
                padding: 60px;
                border-radius: 30px;
                max-width: 800px;
                margin-top: 40px;
                backdrop-filter: blur(10px);
              }
              .${styles.maintenanceLabel} {
                color: #BF953F;
                font-size: 0.8rem;
                font-weight: 800;
                letter-spacing: 0.2em;
                margin-bottom: 20px;
              }
              .${styles.maintenanceTitle} {
                font-size: 2.5rem;
                font-weight: 900;
                margin-bottom: 20px;
                color: #fff;
              }
              .${styles.maintenanceDesc} {
                color: #888;
                line-height: 1.8;
                margin-bottom: 40px;
                font-size: 1rem;
              }
              .${styles.seedBtn} {
                background: linear-gradient(135deg, #BF953F 0%, #AA771D 100%);
                color: white;
                border: none;
                padding: 20px 40px;
                border-radius: 12px;
                font-weight: 950;
                letter-spacing: 0.1em;
                cursor: pointer;
                transition: all 0.3s;
              }
              .${styles.seedBtn}:hover:not(:disabled) {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(191, 149, 63, 0.3);
              }
              .${styles.seedBtn}:disabled {
               opacity: 0.5;
               cursor: not-allowed;
              }
            `}</style>
          </div>
        ) : activeView === 'leads' ? (
          <LeadsView users={users} />
        ) : activeView === 'enquiries' ? (
          <EnquiriesView 
            enquiries={enquiries} 
            onStatusUpdate={async (id, status) => {
              await fetch('/api/admin/enquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
              });
              fetchData();
            }}
            onDelete={async (id) => {
              if (!confirm('Permanently remove this inquiry from the archive?')) return;
              await fetch('/api/admin/enquiries', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
              });
              fetchData();
            }}
          />
        ) : (
          <UsersView users={users} />
        )}
      </main>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingProduct ? 'EDIT ARTIFACT' : 'NEW ARTIFACT'}</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.adminForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <div className={styles.categoryControl}>
                    {isRenaming ? (
                      <div className={styles.renameActiveGroup}>
                        <input 
                          value={renameValue} 
                          onChange={e => setRenameValue(e.target.value)}
                          autoFocus
                        />
                        <button type="button" className={styles.saveRenameBtn} onClick={handleCategoryRename}>Save</button>
                        <button type="button" className={styles.cancelRenameBtn} onClick={() => setIsRenaming(false)}>✕</button>
                      </div>
                    ) : !isAddingNewCategory ? (
                      <div className={styles.categoryHeaderGroup}>
                        <select 
                          value={formData.category} 
                          onChange={e => {
                            if (e.target.value === 'NEW') {
                              setIsAddingNewCategory(true);
                            } else {
                              setFormData({...formData, category: e.target.value});
                            }
                          }}
                        >
                          {[...new Set([...CATEGORIES, ...products.map(p => p.category)])].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                          <option value="NEW">+ Create New Category...</option>
                        </select>
                        <button 
                          type="button" 
                          className={styles.editCategoryBtn}
                          title="Rename Category"
                          onClick={() => {
                            setRenameValue(formData.category);
                            setIsRenaming(true);
                          }}
                        >
                          ✎
                        </button>
                      </div>
                    ) : (
                      <div className={styles.newCategoryInput}>
                        <input 
                          placeholder="Category name..." 
                          value={newCategoryName} 
                          onChange={e => {
                            setNewCategoryName(e.target.value);
                            setFormData({...formData, category: e.target.value});
                          }}
                          autoFocus
                        />
                        <button type="button" onClick={() => setIsAddingNewCategory(false)}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Artifact Type (e.g. Saber, Vase)</label>
                  <input 
                    value={formData.artifactType} 
                    onChange={e => setFormData({...formData, artifactType: e.target.value})} 
                    placeholder="Specific type..."
                  />
                </div>
              </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Stock Status</label>
                    <select value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value as any})}>
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Collection Visibility</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.showInCollection !== false} 
                        onChange={e => setFormData({...formData, showInCollection: e.target.checked})}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: formData.showInCollection !== false ? '#BF953F' : '#888' }}>
                        {formData.showInCollection !== false ? 'Show in Homepage Dial' : 'Hidden from Homepage'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Artifact Imagery</label>
                <div className={styles.uploadRow}>
                  <input 
                    type="text" 
                    placeholder="Image URL..." 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                  />
                  <div className={styles.fileInputWrapper}>
                    <button type="button" className={styles.uploadBtn}>Upload Image</button>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
                  </div>
                </div>
                {formData.image && (
                  <div className={styles.imagePreview}>
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>3D Artifact Model (.glb)</label>
                <div className={styles.uploadRow}>
                  <input 
                    type="text" 
                    placeholder="3D Model URL..." 
                    value={formData.model3d || ''} 
                    onChange={e => setFormData({...formData, model3d: e.target.value})} 
                  />
                  <div className={styles.fileInputWrapper}>
                    <button type="button" className={styles.uploadBtn}>Upload 3D Model</button>
                    <input type="file" accept=".glb" onChange={e => handleFileUpload(e, 'model3d')} />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>2D Image Tilt ({formData.rotation || 0}°)</label>
                <div className={styles.rotationControl}>
                  <input 
                    type="range" 
                    min="-90" 
                    max="90" 
                    value={formData.rotation || 0} 
                    onChange={e => setFormData({...formData, rotation: parseFloat(e.target.value)})} 
                  />
                  <div className={styles.rotationMarkers}>
                    <span>-90°</span>
                    <span>0°</span>
                    <span>90°</span>
                  </div>
                </div>
              </div>

              {formData.model3d && (
                <>
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>3D Model Orientation</label>
                    <button 
                      type="button" 
                      className={styles.addBtn}
                      style={{ padding: '6px 14px', fontSize: '0.7rem', background: '#111' }}
                      onClick={() => setIsRotatorOpen(true)}
                    >
                      VISUAL ADJUST
                    </button>
                  </div>
                  <label>Y-Rotation ({formData.modelRotation || 0}°)</label>
                  <div className={styles.rotationControl}>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      value={formData.modelRotation || 0} 
                      onChange={e => setFormData({...formData, modelRotation: parseFloat(e.target.value)})} 
                    />
                    <div className={styles.rotationMarkers}>
                      <span>0°</span>
                      <span>180°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>3D Model Tilt / X-Rotation ({formData.modelRotationX || 0}°)</label>
                  <div className={styles.rotationControl}>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={formData.modelRotationX || 0} 
                      onChange={e => setFormData({...formData, modelRotationX: parseFloat(e.target.value)})} 
                    />
                    <div className={styles.rotationMarkers}>
                      <span>-180°</span>
                      <span>0°</span>
                      <span>180°</span>
                    </div>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>3D Model Z-Rotation ({formData.modelRotationZ || 0}°)</label>
                  <div className={styles.rotationControl}>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={formData.modelRotationZ || 0} 
                      onChange={e => setFormData({...formData, modelRotationZ: parseFloat(e.target.value)})} 
                    />
                    <div className={styles.rotationMarkers}>
                      <span>-180°</span>
                      <span>0°</span>
                      <span>180°</span>
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* Live Product Preview */}
              {(formData.image || formData.model3d) && (
                <div className={styles.previewSection}>
                  <div className={styles.previewHeader}>
                    <h4>LIVE PREVIEW</h4>
                    <span className={styles.previewBadge}>Real-time</span>
                  </div>
                  <div className={styles.previewGrid}>
                    {formData.image && (
                      <div className={styles.previewCard}>
                        <div className={styles.previewLabel}>2D Display</div>
                        <div className={styles.previewImageWrapper}>
                          <img 
                            src={formData.image} 
                            alt="Product Preview" 
                            className={styles.previewImage}
                            style={{ 
                              transform: formData.rotation ? `rotate(${formData.rotation}deg) scale(0.85)` : 'none',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        </div>
                        {formData.rotation !== 0 && (
                          <div className={styles.previewMeta}>Tilt: {formData.rotation}°</div>
                        )}
                      </div>
                    )}
                    {formData.model3d && (
                      <div className={styles.previewCard}>
                        <div className={styles.previewLabel}>3D Viewer</div>
                        <div 
                          className={styles.preview3dWrapper}
                          onClick={() => setPreview3dOpen(true)}
                        >
                          <div className={styles.preview3dPlaceholder}>
                            <span className={styles.preview3dIcon}>🔮</span>
                            <span className={styles.preview3dText}>CLICK TO INSPECT 3D MODEL</span>
                            <span className={styles.preview3dSub}>Y: {formData.modelRotation || 0}° · X: {formData.modelRotationX || 0}° · Z: {formData.modelRotationZ || 0}°</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview3dOpen && formData.model3d && (
                <CinematicViewer
                  src={formData.model3d}
                  name={formData.name || 'Preview'}
                  onClose={() => setPreview3dOpen(false)}
                  modelRotation={formData.modelRotation}
                  modelRotationX={formData.modelRotationX}
                  modelRotationZ={formData.modelRotationZ}
                />
              )}

              {isRotatorOpen && formData.model3d && (
                <VisualRotator 
                  src={formData.model3d}
                  initialRotation={{
                    x: formData.modelRotationX || 0,
                    y: formData.modelRotation || 0,
                    z: formData.modelRotationZ || 0
                  }}
                  onConfirm={(rot) => {
                    setFormData({
                      ...formData,
                      modelRotationX: rot.x,
                      modelRotation: rot.y,
                      modelRotationZ: rot.z
                    });
                    setIsRotatorOpen(false);
                  }}
                  onCancel={() => setIsRotatorOpen(false)}
                />
              )}

              <div className={styles.variantsSection}>
                <div className={styles.variantsHeader}>
                  <h4>VARIANTS / SIZES</h4>
                  <button type="button" className={styles.variantAddBtn} onClick={addVariant}>+ Add Variant</button>
                </div>
                <div className={styles.variantList}>
                  {formData.variants.map((v, i) => (
                    <div key={i} className={styles.variantRow}>
                      <input 
                        type="text" 
                        placeholder="Size" 
                        value={v.size} 
                        onChange={e => updateVariant(i, 'size', e.target.value)} 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Price" 
                        value={v.price} 
                        onChange={e => updateVariant(i, 'price', parseInt(e.target.value) || 0)} 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Old Price" 
                        value={v.old_price} 
                        onChange={e => updateVariant(i, 'old_price', parseInt(e.target.value) || 0)} 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Stock" 
                        title="Quantity in Stock"
                        value={v.stock} 
                        onChange={e => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Refill At" 
                        title="Alert when stock hits this level"
                        className={styles.refillInput}
                        value={v.refillLevel} 
                        onChange={e => updateVariant(i, 'refillLevel', parseInt(e.target.value) || 0)} 
                        required 
                      />
                      <button 
                        type="button" 
                        className={styles.removeVariantBtn}
                        onClick={() => removeVariant(i)}
                        disabled={formData.variants.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>{editingProduct ? 'Update Artifact' : 'Create Artifact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} ${styles.stockModal}`}>
            <div className={styles.modalHeader}>
              <h3>INVENTORY STOCK UPDATE</h3>
              <button className={styles.closeModalBtn} onClick={() => setIsStockModalOpen(false)}>✕</button>
            </div>
            <div className={styles.stockUpdateList}>
              {products
                .filter((p: Product) => stockFilterId === null || p.id === stockFilterId)
                .map((p: Product) => (
                <div key={p.id} className={styles.stockProductItem}>
                  <div className={styles.stockProductInfo}>
                    <img src={p.image} alt={p.name} className={styles.stockThumb} />
                    <div className={styles.stockDetails}>
                      <h4>{p.name}</h4>
                      <p>{p.category}</p>
                    </div>
                  </div>
                  <div className={styles.variantStockGrid}>
                    {p.variants.map((v: ProductVariant, idx: number) => (
                      <div key={idx} className={`${styles.variantStockItem} ${v.stock <= (v.refillLevel || 0) ? styles.lowStockRow : ''}`}>
                        <div className={styles.stockInputGroup}>
                          <span className={styles.variantSizeLabel}>{v.size}</span>
                          <div className={styles.stockFields}>
                            <div className={styles.stockField}>
                              <label>Stock</label>
                              <input 
                                type="number" 
                                value={v.stock} 
                                onChange={async (e) => {
                                  const newStock = parseInt(e.target.value) || 0;
                                  const newVariants = [...p.variants];
                                  newVariants[idx] = { ...v, stock: newStock };
                                  await fetch('/api/products', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...p, variants: newVariants })
                                  });
                                  fetchData();
                                }}
                                className={styles.stockInput}
                              />
                            </div>
                            <div className={styles.stockField}>
                              <label>Refill</label>
                              <input 
                                type="number" 
                                value={v.refillLevel} 
                                onChange={async (e) => {
                                  const newLevel = parseInt(e.target.value) || 0;
                                  const newVariants = [...p.variants];
                                  newVariants[idx] = { ...v, refillLevel: newLevel };
                                  await fetch('/api/products', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...p, variants: newVariants })
                                  });
                                  fetchData();
                                }}
                                className={styles.stockInput}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.formActions}>
              <button className={styles.submitBtn} onClick={() => setIsStockModalOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

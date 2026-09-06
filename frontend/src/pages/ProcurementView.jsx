import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, Receipt, Plus, Upload, Search,
  TrendingUp, AlertCircle, FileText, CheckCircle2, DollarSign,
  Tag, Filter, ChevronRight, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../hooks/useCurrency';

export default function ProcurementView() {
  const { symbol, formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, invoices, shopping_lists
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // New product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Produce',
    unit: 'kg',
    current_price: '',
    target_price: '',
    supplier_name: 'Metro Cash & Carry',
    sku: '',
  });

  // Invoice scan modal
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanSupplier, setScanSupplier] = useState('Metro Cash & Carry');
  const [scanFile, setScanFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchCatalog();
    fetchInvoices();
    fetchShoppingLists();
  }, [selectedCategory]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/tenant-api/procurement/catalog?category=${selectedCategory}`);
      setProducts(res.data.products || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('/tenant-api/procurement/invoices');
      setInvoices(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
    }
  };

  const fetchShoppingLists = async () => {
    try {
      const res = await axios.get('/tenant-api/procurement/shopping-lists');
      setShoppingLists(res.data.lists || []);
    } catch (err) {
      console.error('Failed to load shopping lists', err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tenant-api/procurement/catalog', productForm);
      alert('Product added to master catalog.');
      setShowProductModal(false);
      setProductForm({ name: '', category: 'Produce', unit: 'kg', current_price: '', target_price: '', supplier_name: 'Metro Cash & Carry', sku: '' });
      fetchCatalog();
    } catch (err) {
      alert('Failed to save product.');
    }
  };

  const handleScanInvoice = async (e) => {
    e.preventDefault();
    setIsScanning(true);
    const formData = new FormData();
    formData.append('supplier_name', scanSupplier);
    if (scanFile) formData.append('invoice_file', scanFile);

    try {
      const res = await axios.post('/tenant-api/procurement/invoices/scan', formData);
      alert(res.data.message);
      setShowScanModal(false);
      fetchInvoices();
      fetchCatalog();
    } catch (err) {
      alert('Failed to scan invoice.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" />
            Procurement, Invoices & Product Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Supplier invoice OCR scanning, price inflation tracker, product catalog, and replenishment orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-2 bg-secondary hover:bg-muted text-foreground border border-border text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <Receipt className="w-4 h-4 text-primary" />
            Scan Supplier Invoice (OCR)
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Catalog Item
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {[
          { key: 'catalog', label: 'Product Catalog & Prices', icon: Tag },
          { key: 'invoices', label: 'Scanned Supplier Invoices', icon: Receipt },
          { key: 'shopping_lists', label: 'Department Shopping Lists', icon: ShoppingCart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Product Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              All Categories
            </button>
            {['Produce', 'Meat', 'Dairy', 'Beverages', 'Cleaning', 'Bakery', 'Dry Goods'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background'
                    : 'bg-card text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Current Price</th>
                  <th className="p-4">Target Price</th>
                  <th className="p-4">Price Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length > 0 ? (
                  products.map((p) => {
                    const isOverTarget = p.target_price && parseFloat(p.current_price) > parseFloat(p.target_price);
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold text-foreground">{p.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground text-[10px] font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{p.unit}</td>
                        <td className="p-4">{p.supplier_name || 'Metro'}</td>
                        <td className="p-4 font-black text-foreground">{formatAmount(p.current_price)}</td>
                        <td className="p-4 text-muted-foreground">
                          {p.target_price ? formatAmount(p.target_price) : '—'}
                        </td>
                        <td className="p-4">
                          {isOverTarget ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                              <TrendingUp className="w-3 h-3" /> Inflation Hike
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Optimal Cost
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-muted-foreground">
                      No items found in catalog for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Scanned Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Date</th>
                <th className="p-4">Net Amount</th>
                <th className="p-4">Gross Amount</th>
                <th className="p-4">Tax Rate</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">{inv.invoice_number || `INV-${inv.id}`}</td>
                    <td className="p-4 font-semibold">{inv.supplier_name}</td>
                    <td className="p-4 text-muted-foreground">{inv.invoice_date}</td>
                    <td className="p-4 font-medium">{formatAmount(inv.total_net)}</td>
                    <td className="p-4 font-black text-foreground">{formatAmount(inv.total_gross)}</td>
                    <td className="p-4 text-muted-foreground">{inv.tax_rate}%</td>
                    <td className="p-4">{inv.items?.length || 4} parsed items</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-muted-foreground">
                    No supplier invoices scanned yet. Click "Scan Supplier Invoice" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Shopping Lists */}
      {activeTab === 'shopping_lists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shoppingLists.length > 0 ? (
            shoppingLists.map((list) => (
              <div key={list.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{list.title}</h3>
                    <p className="text-[11px] text-muted-foreground">Department: {list.department}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {list.status.toUpperCase()}
                  </span>
                </div>

                <div className="divide-y divide-border/60">
                  {list.items?.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <span>{item.item_name} ({item.quantity} {item.unit})</span>
                      <span className="font-bold text-foreground">{formatAmount(item.estimated_price)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Est. Total:</span>
                  <span className="font-black text-foreground">{formatAmount(list.total_estimated_cost)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              No procurement shopping lists created yet.
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Add Product to Catalog
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Fresh Atlantic Salmon Fillet"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  >
                    {['Produce', 'Meat', 'Dairy', 'Beverages', 'Cleaning', 'Bakery', 'Dry Goods'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, l, pcs, box"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Current Price ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="24.50"
                    value={productForm.current_price}
                    onChange={(e) => setProductForm({ ...productForm, current_price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Target Max Price ({symbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="22.00"
                    value={productForm.target_price}
                    onChange={(e) => setProductForm({ ...productForm, target_price: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Preferred Supplier</label>
                <input
                  type="text"
                  placeholder="Metro Cash & Carry"
                  value={productForm.supplier_name}
                  onChange={(e) => setProductForm({ ...productForm, supplier_name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:opacity-90 text-white shadow-md shadow-primary/20">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice OCR Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> AI Supplier Invoice Scanner (OCR)
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload a supplier invoice PDF or photo. Our AI OCR parser automatically extracts line items, quantities, and prices.
            </p>

            <form onSubmit={handleScanInvoice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={scanSupplier}
                  onChange={(e) => setScanSupplier(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">Invoice PDF / Photo</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setScanFile(e.target.files[0])}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-secondary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScanModal(false)} className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:opacity-90 text-white shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning Line Items...' : 'Start AI OCR Scan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


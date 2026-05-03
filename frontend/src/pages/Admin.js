import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { sampleProducts } from '../data/sampleProducts';
import Login from '../components/Login';
import './pages.css';

const DEFAULT_PRODUCT = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  size: '',
  rating: 0,
};

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(DEFAULT_PRODUCT);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordMessage, setChangePasswordMessage] = useState('');
  const [showDatabase, setShowDatabase] = useState(false);
  const [databaseUsers, setDatabaseUsers] = useState([]);
  const [databaseProducts, setDatabaseProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderActionMessage, setOrderActionMessage] = useState(null);
  const [databaseLoading, setDatabaseLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const verifiedUser = response.data.user;
      if (verifiedUser?.role !== 'admin') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      setUser(verifiedUser);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordMessage('');

    if (!changePasswordForm.oldPassword || !changePasswordForm.newPassword) {
      setChangePasswordError('All fields are required');
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError('New passwords do not match');
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      setChangePasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/api/auth/change-password', {
        oldPassword: changePasswordForm.oldPassword,
        newPassword: changePasswordForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChangePasswordMessage('Password changed successfully!');
      setChangePasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      setChangePasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const fetchDatabase = async () => {
    setDatabaseLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, productsRes] = await Promise.all([
        api.get('/api/admin/database/users', { headers }),
        api.get('/api/admin/database/products', { headers })
      ]);

      setDatabaseUsers(usersRes.data.data);
      setDatabaseProducts(productsRes.data.data);
    } catch (err) {
      alert('Failed to fetch database: ' + (err.response?.data?.message || err.message));
    } finally {
      setDatabaseLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.get('/api/admin/database/orders', { headers });
      setOrders(response.data.data);
      setSelectedOrder(null);
      setShowDatabase(false);
    } catch (err) {
      alert('Failed to fetch orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOrderActionMessage(null);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    if (!orderId) {
      alert('Unable to accept order: order ID is missing. Please reload orders.');
      return;
    }
    if (!window.confirm('Accept this order and mark it as ready for processing?')) return;

    try {
      setOrdersLoading(true);
      setOrderActionMessage(null);
      const headers = getAuthHeaders();
      const response = await api.put(
        `/api/admin/orders/${orderId}`,
        { status: 'Accepted' },
        { headers }
      );

      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders((prevOrders) => prevOrders.map((order) => {
        const currentId = order._id || order.id;
        return currentId === orderId ? updatedOrder : order;
      }));
      setOrderActionMessage('Order accepted successfully.');
    } catch (err) {
      alert('Failed to accept order: ' + (err.response?.data?.message || err.message));
    } finally {
      setOrdersLoading(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const { data } = await api.get('/api/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setProducts(data);
      setBackendConnected(true);
    } catch (err) {
      setProducts(sampleProducts);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setSelectedId(null);
    setForm(DEFAULT_PRODUCT);
    setImageFile(null);
    setMessage(null);
  };

  const handleSelect = (product) => {
    setSelectedId(product._id || product.id);
    setForm({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      description: product.description || '',
      image: product.image || '',
      size: product.size || '',
      rating: product.rating || 0,
    });
    setImageFile(null);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`, {
        headers: getAuthHeaders()
      });
      setMessage('Deleted successfully');
      fetchProducts();
      resetForm();
    } catch (err) {
      setMessage('Failed to delete.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      let imageUrl = form.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await api.post('/api/admin/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeaders()
          },
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = {
        name: form.name,
        price: Number(form.price) || form.price,
        category: form.category,
        description: form.description,
        image: imageUrl,
        size: form.size,
        rating: Number(form.rating) || 0,
      };

      if (selectedId) {
        await api.put(`/api/admin/products/${selectedId}`, payload, {
          headers: getAuthHeaders()
        });
        setMessage('Updated successfully');
      } else {
        await api.post('/api/admin/products', payload, {
          headers: getAuthHeaders()
        });
        setMessage('Created successfully');
      }

      fetchProducts();
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const isEditing = Boolean(selectedId);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [products]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f7f9fc',
      paddingTop: 0,
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '40px 20px',
      textAlign: 'center',
      marginBottom: 40,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    headerTitle: {
      margin: 0,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    headerSubtitle: {
      margin: 0,
      fontSize: 16,
      opacity: 0.9,
    },
    mainContent: {
      maxWidth: 1400,
      margin: '0 auto',
      padding: '0 20px 40px',
    },
    alertBanner: {
      backgroundColor: '#fff3cd',
      border: '2px solid #ffc107',
      color: '#856404',
      padding: '16px 20px',
      borderRadius: '8px',
      marginBottom: 30,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    formCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: 30,
      marginBottom: 40,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    formTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#2c3e50',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 20,
      marginBottom: 20,
    },
    formField: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: '#2c3e50',
    },
    input: {
      padding: '12px 14px',
      border: '2px solid #e0e6ed',
      borderRadius: '6px',
      fontSize: 14,
      fontFamily: 'inherit',
      transition: 'border-color 0.3s',
      outline: 'none',
      ':focus': {
        borderColor: '#ff6b35',
      },
    },
    textarea: {
      padding: '12px 14px',
      border: '2px solid #e0e6ed',
      borderRadius: '6px',
      fontSize: 14,
      fontFamily: 'inherit',
      minHeight: 100,
      resize: 'vertical',
      transition: 'border-color 0.3s',
      outline: 'none',
    },
    imagePreview: {
      marginTop: 12,
      maxWidth: 200,
      borderRadius: '8px',
      border: '2px solid #e0e6ed',
    },
    buttonGroup: {
      display: 'flex',
      gap: 12,
      marginTop: 20,
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      fontSize: 14,
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    primaryButton: {
      backgroundColor: '#ff6b35',
      color: 'white',
      boxShadow: '0 2px 4px rgba(255,107,53,0.3)',
    },
    primaryButtonHover: {
      backgroundColor: '#e55a24',
      boxShadow: '0 4px 8px rgba(255,107,53,0.4)',
    },
    secondaryButton: {
      backgroundColor: '#ecf0f1',
      color: '#2c3e50',
    },
    secondaryButtonHover: {
      backgroundColor: '#d5dbdb',
    },
    successMessage: {
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      padding: '12px 16px',
      borderRadius: '6px',
      marginTop: 12,
    },
    productsSection: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: 30,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 20,
      marginTop: 20,
    },
    productCard: {
      backgroundColor: '#f7f9fc',
      border: '2px solid #e0e6ed',
      borderRadius: '10px',
      padding: 16,
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    productCardHover: {
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      borderColor: '#ff6b35',
      transform: 'translateY(-4px)',
    },
    productName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: 8,
    },
    productMeta: {
      fontSize: 13,
      color: '#7f8c8d',
      marginBottom: 12,
    },
    productActions: {
      display: 'flex',
      gap: 8,
      marginTop: 12,
    },
    smallButton: {
      padding: '8px 12px',
      fontSize: 12,
      flex: 1,
    },
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.headerTitle}>📦 Admin Panel</h1>
            <p style={styles.headerSubtitle}>Manage your product catalog</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>Welcome, {user?.username}</span>
            <button
              onClick={() => setShowChangePassword(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Change Password
            </button>
            <button
              onClick={() => {
                setShowDatabase(true);
                fetchDatabase();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9b59b6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View Database
            </button>
            <button
              onClick={() => fetchOrders()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View Orders
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {!backendConnected && (
          <div style={styles.alertBanner}>
            <span>⚠️</span>
            <div>
              <strong>बैकएंड बंद है।</strong> बदलाव सहेजे नहीं जाएंगे।
              <br />
              कृपया बैकएंड सर्वर चलाएं:
              <code style={{ display: 'inline-block', marginTop: 6, padding: '4px 8px', background: '#f0f0f0', borderRadius: 4 }}>
                cd backend && npm start
              </code>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{isEditing ? '✏️ Edit Product' : '➕ Create New Product'}</h2>
          <form onSubmit={handleSave}>
            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Product Name *</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Category *</label>
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Bag">Bag</option>
                  <option value="card">Card</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Price (₹) *</label>
                <input
                  style={styles.input}
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
              />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Size / Notes</label>
                <input
                  style={styles.input}
                  value={form.size}
                  onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
                  placeholder='e.g. W 15" x H 17.5" (Optional)'
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.label}>Rating (0-5)</label>
                <input
                  style={styles.input}
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                />
              </div>
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Product Image</label>
              <input
                style={{ ...styles.input, cursor: 'pointer' }}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {form.image && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 13, color: '#7f8c8d', margin: '0 0 8px' }}>Current Image:</p>
                  <img src={form.image} alt="preview" style={styles.imagePreview} />
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={saving || !backendConnected}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: saving || !backendConnected ? 0.6 : 1,
                  cursor: saving || !backendConnected ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!saving && backendConnected) {
                    Object.assign(e.target.style, styles.primaryButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.target.style, styles.primaryButton);
                }}
              >
                {saving ? '⏳ Saving...' : isEditing ? '💾 Update Product' : '✏️ Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{ ...styles.button, ...styles.secondaryButton }}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.secondaryButtonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, styles.secondaryButton)}
              >
                🔄 Reset
              </button>
            </div>

            {message && <div style={styles.successMessage}>{message}</div>}
          </form>
        </div>

        {/* Products List Section */}
        <div style={styles.productsSection}>
          <h2 style={styles.formTitle}>📚 Product Catalog ({products.length})</h2>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }}>⏳ Loading products...</p>
          ) : sortedProducts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }}>No products yet. Create your first one above!</p>
          ) : (
            <div style={styles.productGrid}>
              {sortedProducts.map((p) => {
                const cardId = p._id || p.id;
                const isCardHovered = hoveredCardId === cardId;
                return (
                  <div
                    key={cardId}
                    style={{
                      ...styles.productCard,
                      ...(isCardHovered && styles.productCardHover),
                    }}
                    onMouseEnter={() => setHoveredCardId(cardId)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    <div style={styles.productName}>{p.name}</div>
                    <div style={styles.productMeta}>
                      <div>📁 {p.category}</div>
                      <div>💰 ₹{p.price}</div>
                    </div>
                    <div style={styles.productActions}>
                      <button
                        type="button"
                        onClick={() => handleSelect(p)}
                        style={{
                          ...styles.button,
                          ...styles.smallButton,
                          ...styles.primaryButton,
                        }}
                        onMouseEnter={(e) => Object.assign(e.target.style, styles.primaryButtonHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, styles.primaryButton)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cardId)}
                        disabled={!backendConnected}
                        style={{
                          ...styles.button,
                          ...styles.smallButton,
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          opacity: !backendConnected ? 0.6 : 1,
                          cursor: !backendConnected ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (backendConnected) e.target.style.backgroundColor = '#c0392b';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#e74c3c';
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div style={{ ...styles.productsSection, marginTop: 40 }}>
          <h2 style={styles.formTitle}>🧾 Latest Orders ({orders.length})</h2>
          {ordersLoading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }}>⏳ Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 40, fontSize: 16 }}>No orders yet. Place an order from the store to see it here.</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f4f6f8' }}>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Order ID</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Date</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Items</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Total</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Delivery</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Grand Total</th>
                      <th style={{ padding: '12px', border: '1px solid #e0e6ed' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr
                        key={order._id || order.id}
                        onClick={() => handleSelectOrder(order)}
                        style={{ cursor: 'pointer', backgroundColor: selectedOrder?._id === order._id ? '#f9f3e8' : 'transparent' }}
                      >
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>{order._id || order.id}</td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>{new Date(order.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed', fontSize: 13 }}>
                          {order.items?.map(item => `${item.name} x${item.qty}`).join(', ')}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>₹ {order.total.toFixed(2)}</td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>₹ {order.totalDelivery.toFixed(2)}</td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>₹ {order.grandTotal.toFixed(2)}</td>
                        <td style={{ padding: '12px', border: '1px solid #e0e6ed' }}>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrder && (
                <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: '1px solid #e0e0e0', backgroundColor: '#fffbea' }}>
                  <h3 style={{ marginTop: 0 }}>Order Details</h3>
                  <p><strong>Order ID:</strong> {selectedOrder._id || selectedOrder.id}</p>
                  <p><strong>Placed on:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Items:</strong></p>
                  <ul style={{ marginTop: 8, marginBottom: 12, paddingLeft: 18 }}>
                    {selectedOrder.items?.map((item, index) => (
                      <li key={`${item.name}-${index}`} style={{ marginBottom: 6 }}>
                        {item.name} x{item.qty} — ₹{(item.price || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Subtotal:</strong> ₹{selectedOrder.total.toFixed(2)}</p>
                  <p><strong>Delivery:</strong> ₹{selectedOrder.totalDelivery.toFixed(2)}</p>
                  <p><strong>Grand Total:</strong> ₹{selectedOrder.grandTotal.toFixed(2)}</p>
                  {selectedOrder.customer && (
                    <>
                      <p><strong>Customer:</strong> {selectedOrder.customer.name || selectedOrder.customer.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customer.phone || 'N/A'}</p>
                      <p><strong>Address:</strong> {selectedOrder.customer.address || 'N/A'}</p>
                    </>
                  )}
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {selectedOrder.status !== 'Accepted' ? (
                      <button
                        type="button"
                        onClick={handleAcceptOrder}
                        disabled={ordersLoading}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          opacity: ordersLoading ? 0.6 : 1,
                          cursor: ordersLoading ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!ordersLoading) Object.assign(e.target.style, styles.primaryButtonHover);
                        }}
                        onMouseLeave={(e) => Object.assign(e.target.style, styles.primaryButton)}
                      >
                        ✅ Accept Order
                      </button>
                    ) : (
                      <span style={{ color: '#2c3e50', fontWeight: 600 }}>Order already accepted</span>
                    )}
                    {orderActionMessage && <div style={styles.successMessage}>{orderActionMessage}</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Change Password</h2>

            <form onSubmit={handleChangePasswordSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Old Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.oldPassword}
                  onChange={(e) => setChangePasswordForm({
                    ...changePasswordForm,
                    oldPassword: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({
                    ...changePasswordForm,
                    newPassword: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({
                    ...changePasswordForm,
                    confirmPassword: e.target.value
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {changePasswordError && (
                <div style={{
                  color: '#e74c3c',
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#fadbd8',
                  borderRadius: '4px'
                }}>
                  {changePasswordError}
                </div>
              )}

              {changePasswordMessage && (
                <div style={{
                  color: '#27ae60',
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#d5f4e6',
                  borderRadius: '4px'
                }}>
                  {changePasswordMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setChangePasswordForm({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setChangePasswordError('');
                    setChangePasswordMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Viewer Modal */}
      {showDatabase && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '900px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Database Viewer</h2>
              <button
                onClick={() => setShowDatabase(false)}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

            {databaseLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : (
              <>
                {/* Users Table */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginTop: 0 }}>👥 Users ({databaseUsers.length})</h3>
                  {databaseUsers.length === 0 ? (
                    <p>No users found</p>
                  ) : (
                    <div style={{
                      overflowX: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {databaseUsers.map((user, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '10px' }}>{user.username}</td>
                              <td style={{ padding: '10px' }}>{user.role || 'user'}</td>
                              <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Products Table */}
                <div>
                  <h3 style={{ marginTop: 0 }}>📦 Products ({databaseProducts.length})</h3>
                  {databaseProducts.length === 0 ? (
                    <p>No products found</p>
                  ) : (
                    <div style={{
                      overflowX: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '13px'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Price</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Rating</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {databaseProducts.map((product, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '10px' }}>{product.name}</td>
                              <td style={{ padding: '10px' }}>{product.category}</td>
                              <td style={{ padding: '10px' }}>₹{product.price}</td>
                              <td style={{ padding: '10px' }}>{product.rating || 0} ⭐</td>
                              <td style={{ padding: '10px' }}>{new Date(product.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

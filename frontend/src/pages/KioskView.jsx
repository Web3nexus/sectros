import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import centralApi from '../services/centralApi'
import './KioskView.css'

const STEPS = { SPLASH: 'splash', DINING: 'dining', TABLE: 'table', MENU: 'menu', CHECKOUT: 'checkout', CONFIRMATION: 'confirmation' }
const SESSION_TIMEOUT_MS = 60000
const DINING_MODES = { TAKE_OUT: 'take_out', EAT_IN: 'eat_in' }

export default function KioskView() {
  const { tenantId } = useParams()

  const [step, setStep] = useState(STEPS.SPLASH)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableError, setTableError] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [business, setBusiness] = useState(null)
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [diningMode, setDiningMode] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [activeCategory, setActiveCategory] = useState(0)
  const [countdown, setCountdown] = useState(SESSION_TIMEOUT_MS / 1000)
  const [showCart, setShowCart] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [itemAddons, setItemAddons] = useState({})
  const [addonError, setAddonError] = useState(null)
  const [showTimeBar, setShowTimeBar] = useState(false)

  const timeoutRef = useRef(null)
  const countdownRef = useRef(null)
  const tickingRef = useRef(false)

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(SESSION_TIMEOUT_MS / 1000)
    tickingRef.current = false

    if (step !== STEPS.SPLASH && step !== STEPS.CONFIRMATION) {
      timeoutRef.current = setTimeout(() => handleTimeout(), SESSION_TIMEOUT_MS)
      // Always restart the countdown interval so the progress bar never freezes
      tickingRef.current = true
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
  }, [step])

  const handleTimeout = useCallback(() => {
    setCart([])
    setCustomerName('')
    setDiningMode(null)
    setSelectedTable(null)
    setActiveCategory(0)
    setShowCart(false)
    setError(null)
    setShowTimeBar(false)
    setStep(STEPS.SPLASH)
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    tickingRef.current = false
  }, [])

  useEffect(() => {
    if (step === STEPS.SPLASH || step === STEPS.CONFIRMATION) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      tickingRef.current = false
      setShowTimeBar(false)
      setCountdown(SESSION_TIMEOUT_MS / 1000)
    } else {
      setShowTimeBar(true)
      resetTimer()
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [step, resetTimer])

  useEffect(() => {
    // Activity resets the timer via the consolidated resetTimer which re-starts the interval
    const handler = () => {
      if (step !== STEPS.SPLASH && step !== STEPS.CONFIRMATION) {
        resetTimer()
      }
    }
    window.addEventListener('touchstart', handler, { passive: true })
    window.addEventListener('click', handler, { passive: true })
    window.addEventListener('keydown', handler, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('click', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [step, resetTimer])

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await centralApi.get(`kiosk/${tenantId}/menu`)
      setBusiness({ name: res.data.business_name, type: res.data.business_type })
      setCategories(res.data.categories || [])
    } catch (e) {
      if (e.response?.status === 403) {
        setBlocked(true)
        setBlockReason('Kiosk mode is not available on your current plan')
      } else {
        setError('Unable to load menu. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    try {
      setTableError(false)
      const res = await centralApi.get(`kiosk/${tenantId}/tables`)
      setTables(res.data.tables || [])
    } catch (e) {
      setTableError(true)
      setTables([])
    }
  }

  // Trap browser back button — push a dummy entry on mount so popstate fires reliably
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handler = () => {
      window.history.pushState(null, '', window.location.href)
      setStep(STEPS.SPLASH)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const addToCart = (item, selectedAddons = []) => {
    // Use parseFloat on each addon price to prevent string concatenation corrupting totals
    const addonPrice = selectedAddons.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0)
    const cartKey = `${item.id}-${selectedAddons.map(a => a.id).sort().join(',')}`
    setCart(prev => {
      const exists = prev.find(i => i.cartKey === cartKey)
      if (exists) return prev.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, {
        cartKey, id: item.id, name: item.name, price: parseFloat(item.price) + addonPrice,
        qty: 1, addons: selectedAddons.map(a => a.id)
      }]
    })
  }

  const updateQty = (cartKey, delta) => {
    setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
  }

  const goToMenuFromCheckout = () => {
    setError(null)
    setStep(STEPS.MENU)
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) return
    setSubmitting(true)
    try {
      const res = await centralApi.post(`kiosk/${tenantId}/order`, {
        customer_name: customerName.trim(),
        dining_mode: diningMode,
        restaurant_table_id: diningMode === DINING_MODES.EAT_IN ? selectedTable?.id : null,
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.qty, addons: i.addons })),
      })
      setOrderResult({ id: res.data.order_id, total: res.data.total_amount })
      setStep(STEPS.CONFIRMATION)
      setCart([])
      setCustomerName('')
      setShowCart(false)
    } catch (e) {
      setError(e.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmBackToSplash = () => {
    setError(null)
    setOrderResult(null)
    setStep(STEPS.SPLASH)
  }

  const toggleAddons = (itemId) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const toggleItemAddon = (itemId, addon) => {
    setItemAddons(prev => {
      const current = [...(prev[itemId] || [])]
      const idx = current.findIndex(a => a.id === addon.id)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(addon)
      return { ...prev, [itemId]: current }
    })
  }

  const handleAddToCart = (item) => {
    const selected = itemAddons[item.id] || []
    // Enforce required add-ons before allowing add to cart
    const missingRequired = (item.addons || []).filter(
      a => a.is_required && !selected.some(s => s.id === a.id)
    )
    if (missingRequired.length > 0) {
      setAddonError(`Please select required add-on${missingRequired.length > 1 ? 's' : ''}: ${missingRequired.map(a => a.name).join(', ')}`)
      // Expand the addon panel so the user can see what's required
      setExpandedItems(prev => { const n = new Set(prev); n.add(item.id); return n })
      return
    }
    setAddonError(null)
    addToCart(item, selected)
    setExpandedItems(prev => { const n = new Set(prev); n.delete(item.id); return n })
    setItemAddons(prev => ({ ...prev, [item.id]: [] }))
  }

  const handleBackFromDining = () => {
    setDiningMode(null)
    setStep(STEPS.SPLASH)
  }

  const handleDiningSelect = (mode) => {
    setDiningMode(mode)
    if (mode === DINING_MODES.EAT_IN) {
      fetchTables()
      setStep(STEPS.TABLE)
    } else {
      setStep(STEPS.MENU)
    }
  }

  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setStep(STEPS.MENU)
  }

  const handleStartOrder = () => setStep(STEPS.DINING)

  const currentItems = categories[activeCategory]?.items || []

  if (loading) {
    return (
      <div className="kiosk kiosk-loading">
        <div className="kiosk-loading-spinner" />
        <p>Loading menu...</p>
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="kiosk kiosk-loading">
        <div className="kiosk-error-card">
          <div className="kiosk-splash-icon" style={{ background: '#f59e0b' }}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ color: '#d97706' }}>Feature Not Available</h2>
          <p>{blockReason}</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Contact the business to enable Kiosk Mode on their plan.</p>
        </div>
      </div>
    )
  }

  if (error && step === STEPS.SPLASH) {
    return (
      <div className="kiosk kiosk-loading">
        <div className="kiosk-error-card">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="kiosk-btn kiosk-btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    )
  }

  const renderSplash = () => (
    <div className="kiosk-splash">
      <div className="kiosk-splash-brand">
        <div className="kiosk-splash-icon">
          <svg viewBox="0 0 64 64" fill="none" width="80" height="80">
            <rect x="8" y="20" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M24 12 L32 20 L40 12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="32" y1="20" x2="32" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="36" r="4" fill="currentColor" />
          </svg>
        </div>
        <h1 className="kiosk-splash-title">{business?.name || 'Welcome'}</h1>
        <p className="kiosk-splash-subtitle">Tap to start your order</p>
      </div>
      <button className="kiosk-btn kiosk-btn-primary kiosk-btn-xl" onClick={handleStartOrder}>
        Start Order
      </button>
    </div>
  )

  const renderDining = () => (
    <div className="kiosk-screen">
      <div className="kiosk-screen-header">
        <button className="kiosk-btn-icon" onClick={handleBackFromDining} aria-label="Back">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2>How would you like to order?</h2>
      </div>
      <div className="kiosk-dining-options">
        <button className="kiosk-dining-card" onClick={() => handleDiningSelect(DINING_MODES.TAKE_OUT)}>
          <svg viewBox="0 0 64 64" width="56" height="56">
            <rect x="12" y="18" width="16" height="32" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <rect x="36" y="14" width="16" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M28 50 L36 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 24 L28 24 M20 30 L28 30 M20 36 L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M44 20 L48 20 M44 26 L48 26 M44 32 L48 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </svg>
          <span className="kiosk-dining-label">Take Out</span>
          <span className="kiosk-dining-desc">Order to go</span>
        </button>
        <button className="kiosk-dining-card" onClick={() => handleDiningSelect(DINING_MODES.EAT_IN)}>
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="32" y1="10" x2="32" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="46" x2="32" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="32" x2="18" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="46" y1="32" x2="54" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="kiosk-dining-label">Eat In</span>
          <span className="kiosk-dining-desc">Dine at the restaurant</span>
        </button>
      </div>
    </div>
  )

  const renderTableSelect = () => (
    <div className="kiosk-screen">
      <div className="kiosk-screen-header">
        <button className="kiosk-btn-icon" onClick={() => setStep(STEPS.DINING)} aria-label="Back">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2>Select your table</h2>
      </div>
      <div className="kiosk-table-grid">
        {tableError ? (
          <div className="kiosk-error-card">
            <p>Could not load tables. Please check your connection.</p>
            <button className="kiosk-btn kiosk-btn-primary" onClick={fetchTables}>Retry</button>
          </div>
        ) : tables.length === 0 ? (
          <p className="kiosk-empty-msg">No tables available right now</p>
        ) : (
          tables.map(t => (
            <button key={t.id} className="kiosk-table-btn" onClick={() => handleTableSelect(t)}>
              <span className="kiosk-table-number">{t.table_number}</span>
              <span className="kiosk-table-cap">{t.capacity} seats</span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  const renderMenu = () => (
    <div className="kiosk-screen kiosk-menu-screen">
      <div className="kiosk-menu-top">
        <div className="kiosk-menu-header-row">
          <button className="kiosk-btn-icon" onClick={() => setStep(diningMode === DINING_MODES.EAT_IN ? STEPS.TABLE : STEPS.DINING)} aria-label="Back">
            <svg viewBox="0 0 24 24" width="28" height="28"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="kiosk-menu-mode-badge">
            {diningMode === DINING_MODES.EAT_IN ? `Table ${selectedTable?.table_number}` : 'Take Out'}
          </div>
          <button className="kiosk-cart-toggle" onClick={() => setShowCart(prev => !prev)} aria-label="Toggle cart">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <circle cx="9" cy="21" r="1.5" fill="currentColor" /><circle cx="17" cy="21" r="1.5" fill="currentColor" />
              <path d="M3 3h2l1 4h14l-2 9H7L5 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {cartCount > 0 && <span className="kiosk-cart-badge">{cartCount}</span>}
          </button>
        </div>
        {addonError && (
          <div className="kiosk-addon-error" role="alert">
            {addonError}
          </div>
        )}
        <div className="kiosk-category-strip">
          {categories.map((cat, idx) => (
            <button key={idx} className={`kiosk-category-chip ${idx === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(idx)}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="kiosk-menu-items">
        {currentItems.length === 0 ? (
          <p className="kiosk-empty-msg">No items in this category</p>
        ) : (
          currentItems.map(item => (
            <div key={item.id} className="kiosk-menu-item-wrap">
              <button className="kiosk-menu-item" onClick={() => handleAddToCart(item)}>
                <div className="kiosk-menu-item-info">
                  <span className="kiosk-item-name">{item.name}</span>
                  {item.description && <span className="kiosk-item-desc">{item.description}</span>}
                </div>
                <div className="kiosk-menu-item-right">
                  <span className="kiosk-item-price">${parseFloat(item.price).toFixed(2)}</span>
                  <div className="kiosk-item-add-btn">+</div>
                </div>
              </button>
              {item.addons && item.addons.length > 0 && (
                <div className="kiosk-addon-area">
                  <button className="kiosk-addon-toggle" onClick={(e) => { e.stopPropagation(); toggleAddons(item.id) }}>
                    <span>{item.addons.length} add-on{item.addons.length > 1 ? 's' : ''} available</span>
                    <span className={`kiosk-addon-arrow ${expandedItems.has(item.id) ? 'open' : ''}`}>▾</span>
                  </button>
                  {expandedItems.has(item.id) && (
                    <div className="kiosk-addon-options">
                      {item.addons.map(addon => (
                        <label key={addon.id} className="kiosk-addon-option">
                          <input type="checkbox"
                            checked={(itemAddons[item.id] || []).some(a => a.id === addon.id)}
                            onChange={() => toggleItemAddon(item.id, addon)} />
                          <span className="kiosk-addon-option-name">{addon.name}{addon.is_required ? ' *' : ''}</span>
                          {parseFloat(addon.price) > 0 && (
                            <span className="kiosk-addon-option-price">+${parseFloat(addon.price).toFixed(2)}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={`kiosk-cart-drawer ${showCart ? 'open' : ''}`}>
        <div className="kiosk-cart-drawer-header">
          <h3>Your Order</h3>
          <button className="kiosk-btn-icon" onClick={() => setShowCart(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="kiosk-cart-items">
          {cart.length === 0 ? (
            <p className="kiosk-empty-msg">Your cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.cartKey} className="kiosk-cart-item">
                <div className="kiosk-cart-item-info">
                  <span className="kiosk-cart-item-name">{item.name}</span>
                  <span className="kiosk-cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <div className="kiosk-qty-controls">
                  <button className="kiosk-qty-btn" onClick={() => updateQty(item.cartKey, -1)} aria-label="Decrease">-</button>
                  <span className="kiosk-qty-value">{item.qty}</span>
                  <button className="kiosk-qty-btn" onClick={() => updateQty(item.cartKey, 1)} aria-label="Increase">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="kiosk-cart-footer">
            <div className="kiosk-cart-total-row">
              <span>Total</span>
              <span className="kiosk-cart-total">${cartTotal.toFixed(2)}</span>
            </div>
            <button className="kiosk-btn kiosk-btn-primary" onClick={() => setStep(STEPS.CHECKOUT)}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderCheckout = () => (
    <div className="kiosk-screen">
      <div className="kiosk-screen-header">
        <button className="kiosk-btn-icon" onClick={goToMenuFromCheckout} aria-label="Back">
          <svg viewBox="0 0 24 24" width="28" height="28"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2>Confirm your order</h2>
      </div>

      <div className="kiosk-checkout-body">
        <div className="kiosk-checkout-summary">
          <h3>Order Summary</h3>
          {diningMode === DINING_MODES.EAT_IN && <p className="kiosk-checkout-detail">Table: {selectedTable?.table_number}</p>}
          <p className="kiosk-checkout-detail">{diningMode === DINING_MODES.EAT_IN ? 'Dine In' : 'Take Out'}</p>
          <div className="kiosk-checkout-items">
            {cart.map(item => (
              <div key={item.cartKey} className="kiosk-checkout-line">
                <span>{item.qty}x {item.name}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="kiosk-checkout-total">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="kiosk-name-input-group">
          <label htmlFor="customerName">Your Name</label>
          <input id="customerName" type="text" value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            className="kiosk-name-input"
            autoComplete="name"
            maxLength={100}
            autoFocus />
        </div>

        {error && <div className="kiosk-error-msg">{error}</div>}

        <button className="kiosk-btn kiosk-btn-primary kiosk-btn-xl"
          onClick={handlePlaceOrder}
          disabled={submitting || !customerName.trim() || cart.length === 0}>
          {submitting ? 'Placing Order...' : `Place Order — $${cartTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="kiosk-splash kiosk-confirmation">
      <div className="kiosk-splash-brand">
        <div className="kiosk-splash-icon kiosk-success-icon">
          <svg viewBox="0 0 64 64" width="72" height="72">
            <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M22 32l6 6 14-14" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="kiosk-splash-title">Order Placed!</h1>
        <p className="kiosk-confirmation-text">
          {diningMode === DINING_MODES.EAT_IN
            ? `Your order will be brought to table ${selectedTable?.table_number}`
            : 'Your order is being prepared'}
        </p>
        <p className="kiosk-confirmation-id">Order #{orderResult?.id}</p>
        <p className="kiosk-confirmation-total">Total: ${parseFloat(orderResult?.total || 0).toFixed(2)}</p>
      </div>
      <button className="kiosk-btn kiosk-btn-secondary kiosk-btn-xl" onClick={confirmBackToSplash}>
        Start New Order
      </button>
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case STEPS.SPLASH: return renderSplash()
      case STEPS.DINING: return renderDining()
      case STEPS.TABLE: return renderTableSelect()
      case STEPS.MENU: return renderMenu()
      case STEPS.CHECKOUT: return renderCheckout()
      case STEPS.CONFIRMATION: return renderConfirmation()
      default: return renderSplash()
    }
  }

  return (
    <div className="kiosk" onClick={resetTimer}>
      {showTimeBar && (
        <div className="kiosk-timeout-bar" style={{ width: `${(countdown / (SESSION_TIMEOUT_MS / 1000)) * 100}%` }} />
      )}
      {renderStep()}
    </div>
  )
}

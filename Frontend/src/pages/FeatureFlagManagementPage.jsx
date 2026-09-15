import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import '../styles/feature-flags.css';

const FF_API_BASE = import.meta.env.VITE_FEATURE_FLAG_SERVICE_URL || 'http://localhost:8081';
const CURRENT_CUSTOMER_CODE = import.meta.env.VITE_CUSTOMER_CODE || 'VTIT';
const DEFAULT_CUSTOMER_NAME = import.meta.env.VITE_CUSTOMER_NAME || 'Viettel Software';

// ===== MultiSelectParam Component =====
const MultiSelectParam = ({ strategyType, selectedValues, onChange, placeholder, options, loading }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = (options || []).filter(opt =>
    (opt.value && opt.value.toLowerCase().includes(search.toLowerCase())) ||
    (opt.label && opt.label.toLowerCase().includes(search.toLowerCase()))
  );

  const isSelected = (val) => selectedValues.includes(val);

  const toggleOption = (val) => {
    if (isSelected(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const trimmed = search.trim();
      if (!isSelected(trimmed)) {
        onChange([...selectedValues, trimmed]);
      }
      setSearch('');
    }
    if (e.key === 'Backspace' && !search && selectedValues.length > 0) {
      onChange(selectedValues.slice(0, -1));
    }
  };

  const handleAddCustomClick = () => {
    if (!search.trim()) return;
    const trimmed = search.trim();
    if (!isSelected(trimmed)) {
      onChange([...selectedValues, trimmed]);
    }
    setSearch('');
  };

  const showAddNew = search.trim() && !(options || []).some(o => o.value.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="multi-select-container" ref={containerRef}>
      <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="trigger-text">
          {selectedValues.length === 0 ? "Vui lòng chọn hoặc gõ..." : selectedValues.join(', ')}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--ff-text-muted)' }}></i>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          <div className="multi-select-search-container">
            <input
              className="multi-select-search"
              type="text"
              placeholder="Tìm kiếm hoặc thêm mới..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          {loading ? (
            <div className="multi-select-loading">
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách...
            </div>
          ) : (
            <>
              {filteredOptions.length === 0 && !showAddNew && (
                <div className="multi-select-empty">
                  {search ? 'Không tìm thấy kết quả' : 'Chưa có danh sách sẵn. Gõ và nhấn Enter để thêm.'}
                </div>
              )}
              {filteredOptions.length > 0 && (
                <div
                  className="multi-select-option"
                  onClick={() => {
                    const allSelected = filteredOptions.every(o => isSelected(o.value));
                    if (allSelected) {
                      const filteredVals = filteredOptions.map(o => o.value);
                      onChange(selectedValues.filter(v => !filteredVals.includes(v)));
                    } else {
                      const filteredVals = filteredOptions.map(o => o.value);
                      onChange([...new Set([...selectedValues, ...filteredVals])]);
                    }
                  }}
                  style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}
                >
                  <div className="option-check">
                    {filteredOptions.length > 0 && filteredOptions.every(o => isSelected(o.value)) && <i className="fa-solid fa-check"></i>}
                  </div>
                  <span className="option-label" style={{ fontWeight: 600 }}>Chọn tất cả</span>
                </div>
              )}
              {filteredOptions.map(opt => (
                <div
                  key={opt.id || opt.value}
                  className={`multi-select-option ${isSelected(opt.value) ? 'selected' : ''}`}
                  onClick={() => toggleOption(opt.value)}
                >
                  <div className="option-check">
                    {isSelected(opt.value) && <i className="fa-solid fa-check"></i>}
                  </div>
                  <span className="option-label">{opt.label || opt.value}</span>
                  {opt.extra && <span className="option-extra">{opt.extra}</span>}
                </div>
              ))}
              {showAddNew && (
                <div className="multi-select-add-new" onClick={handleAddCustomClick}>
                  <i className="fa-solid fa-plus"></i> Thêm mới: "<strong>{search.trim()}</strong>"
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedValues.length > 0 && (
        <div className="multi-select-tags">
          {selectedValues.map(val => (
            <span key={val} className="multi-select-tag">
              {val}
              <button
                type="button"
                className="tag-remove"
                onClick={() => onChange(selectedValues.filter(v => v !== val))}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== DatePickerParam Component =====
const DatePickerParam = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) setViewDate(parsed);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectDate = (d) => {
    onChange(formatISO(d));
    setIsOpen(false);
  };

  const applyPreset = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onChange(formatISO(d));
    setViewDate(d);
    setIsOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  const todayStr = formatISO(new Date());
  const selectedStr = value ? value.trim() : '';
  const isFuture = selectedStr && selectedStr > todayStr;

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="datepicker-container" ref={containerRef}>
      <div className="datepicker-trigger" onClick={() => setIsOpen(!isOpen)}>
        <i className="fa-regular fa-calendar" style={{ color: 'var(--ff-text-muted)' }}></i>
        <span className="datepicker-trigger-text">
          {value || 'Chọn ngày phát hành (YYYY-MM-DD)...'}
        </span>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: 'var(--ff-text-muted)' }}></i>
      </div>

      {isOpen && (
        <div className="datepicker-dropdown">
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
              }}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="datepicker-title">{monthNames[month]} năm {year}</span>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
              }}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="datepicker-grid-header">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
              <div key={d} className="datepicker-day-name">{d}</div>
            ))}
          </div>

          <div className="datepicker-grid-dates">
            {calendarDays.map((item, idx) => {
              const dStr = formatISO(item.date);
              const isSelected = selectedStr === dStr;
              const isToday = todayStr === dStr;
              return (
                <div
                  key={idx}
                  className={`datepicker-date-cell ${
                    !item.isCurrentMonth ? 'outside-month' : ''
                  } ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectDate(item.date)}
                >
                  {item.date.getDate()}
                </div>
              );
            })}
          </div>

          <div className="datepicker-presets">
            <button type="button" className="datepicker-preset-chip" onClick={() => applyPreset(0)}>Hôm nay</button>
            <button type="button" className="datepicker-preset-chip" onClick={() => applyPreset(1)}>Ngày mai</button>
            <button type="button" className="datepicker-preset-chip" onClick={() => applyPreset(7)}>+7 Ngày</button>
            <button type="button" className="datepicker-preset-chip" onClick={() => applyPreset(30)}>+30 Ngày</button>
          </div>
        </div>
      )}

      {selectedStr && (
        <div className={`datepicker-status-badge ${isFuture ? 'future' : 'past'}`}>
          <i className={`fa-solid ${isFuture ? 'fa-lock' : 'fa-circle-check'}`}></i>
          <span>
            {isFuture
              ? `🔒 Ngày tương lai (${selectedStr}): Chưa đến hạn, chiến lược trả về FALSE (Bị chặn).`
              : `✅ Ngày hiện tại/quá khứ (${selectedStr}): Đã qua hạn, chiến lược trả về TRUE.`}
          </span>
        </div>
      )}
    </div>
  );
};

export function FeatureFlagManagementPage() {
  // Current Customer State for this Dedicated Instance
  const [customer, setCustomer] = useState({
    customerCode: CURRENT_CUSTOMER_CODE,
    name: DEFAULT_CUSTOMER_NAME,
    ipAddress: '127.0.0.1',
    serviceUrl: ''
  });

  const [flags, setFlags] = useState([]);
  const [customerFlags, setCustomerFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Drawer / Multi-Strategy Editor State
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStrategies, setEditingStrategies] = useState([]);
  const [editingStrategyLogic, setEditingStrategyLogic] = useState('OR');

  // Strategy Options Cache
  const [strategyOptionsCache, setStrategyOptionsCache] = useState({});
  const [loadingOptions, setLoadingOptions] = useState({});

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Helper Labels
  const getStrategyLabel = (id) => {
    switch (id) {
      case 'release_date': return 'Release Date';
      case 'users_by_name':
      case 'username': return 'Users by name';
      case 'user_role':
      case 'role': return 'User Role';
      case 'gradual_rollout_user_id':
      case 'rollout': return 'Gradual Rollout';
      case 'ip_whitelist':
      case 'ip': return 'IP Whitelist';
      default: return id;
    }
  };

  const getStrategiesParamsSummary = (strategies) => {
    if (!strategies || strategies.length === 0) return '';
    const parts = [];
    strategies.forEach(s => {
      const p = s.params || {};
      if (s.strategyId === 'release_date') {
        const val = p.date || p.releaseDate || p.value;
        if (val) parts.push(val);
      } else if (s.strategyId === 'users_by_name' || s.strategyId === 'username') {
        const val = p.users || p.value;
        if (val) parts.push(val);
      } else if (s.strategyId === 'user_role' || s.strategyId === 'role') {
        const val = p.roles || p.role || p.value;
        if (val) parts.push(val);
      } else if (s.strategyId === 'gradual_rollout_user_id' || s.strategyId === 'rollout') {
        const val = p.percentage !== undefined ? `${p.percentage}%` : p.value;
        if (val) parts.push(val);
      } else if (s.strategyId === 'ip_whitelist' || s.strategyId === 'ip') {
        const val = p.ips || p.value;
        if (val) parts.push(val);
      } else {
        const firstVal = Object.values(p)[0];
        if (firstVal) parts.push(String(firstVal));
      }
    });
    return parts.join(' | ');
  };

  // Fetch Strategy Options
  const fetchStrategyOptions = (strategyType) => {
    const normalizedType = (strategyType === 'username' || strategyType === 'users_by_name') ? 'users_by_name' : strategyType;
    const cacheKey = `${normalizedType}__${CURRENT_CUSTOMER_CODE}`;
    if (strategyOptionsCache[cacheKey] && strategyOptionsCache[cacheKey].length > 0) return;

    setLoadingOptions(prev => ({ ...prev, [strategyType]: true, [normalizedType]: true }));
    const url = `${FF_API_BASE}/api/v1/flags/strategy-options/${normalizedType}?customerCode=${encodeURIComponent(CURRENT_CUSTOMER_CODE)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        let opts = [];
        if (Array.isArray(data)) {
          opts = data.map(item => {
            if (typeof item === 'string') return { value: item, label: item };
            return {
              value: item.value || item.username || item.name,
              label: item.label || item.fullName || item.username || item.name,
              extra: item.extra || (item.role ? `[${item.role}]` : '')
            };
          });
        }
        setStrategyOptionsCache(prev => ({
          ...prev,
          [cacheKey]: opts,
          [`${strategyType}__${CURRENT_CUSTOMER_CODE}`]: opts,
          [`users_by_name__${CURRENT_CUSTOMER_CODE}`]: opts,
          [`username__${CURRENT_CUSTOMER_CODE}`]: opts
        }));
      })
      .catch(err => {
        console.error("Failed to load options for", strategyType, err);
      })
      .finally(() => {
        setLoadingOptions(prev => ({ ...prev, [strategyType]: false, [normalizedType]: false }));
      });
  };

  // Load Data on Mount & Auto-refresh when tab gains focus
  useEffect(() => {
    loadCustomerData();
    const handleFocus = () => loadCustomerData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadCustomerData = () => {
    setLoading(true);

    fetch(`${FF_API_BASE}/api/v1/flags`)
      .then(r => r.json())
      .then(masterFlags => {
        setFlags(Array.isArray(masterFlags) ? masterFlags : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading flags data:", err);
        setLoading(false);
        showToast('Lỗi', 'Không thể tải dữ liệu cờ: ' + err.message, 'error');
      });
  };

  // Toggle Flag Status directly on dedicated instance
  const toggleFlagStatus = (flagName, currentStatus) => {
    const newStatus = !currentStatus;

    fetch(`${FF_API_BASE}/api/v1/flags/${flagName}/status?enabled=${newStatus}`, {
      method: 'PUT'
    })
    .then(res => res.json())
    .then(updated => {
      setFlags(prev => prev.map(f => f.name === flagName ? { ...f, enabled: updated.enabled } : f));
      showToast('Thành công', `Đã chuyển trạng thái cờ ${flagName} sang ${newStatus ? 'BẬT' : 'TẮT'}`, 'success');
    })
    .catch(err => {
      console.error(err);
      showToast('Lỗi', 'Không thể chuyển trạng thái: ' + err.message, 'error');
    });
  };

  // Apply Changes to this Instance
  const handleApply = () => {
    setApplying(true);
    fetch(`${FF_API_BASE}/api/v1/flags/apply`, {
      method: 'POST'
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi apply');
      return data;
    })
    .then(data => {
      const verText = data.version ? `v${data.version.substring(0, 19)}` : '';
      showToast('⚡ Apply Thành Công!', `Đã áp dụng snapshot ${verText} xuống instance ${customer.name}!`, 'success');
    })
    .catch(err => {
      console.error(err);
      showToast('Lỗi Apply', err.message, 'error');
    })
    .finally(() => setApplying(false));
  };

  // Drawer / Multi-Strategy Handlers
  const openDrawer = (flag) => {
    const effectiveStrategies = flag?.strategies || [];
    const effectiveLogic = flag?.strategyLogic || 'OR';

    setSelectedFlag({
      ...flag,
      enabled: Boolean(flag.enabled)
    });
    setEditingStrategies(JSON.parse(JSON.stringify(effectiveStrategies)));
    setEditingStrategyLogic(effectiveLogic);
    setDrawerOpen(true);

    // Preload options
    effectiveStrategies.forEach(s => fetchStrategyOptions(s.strategyId));
    fetchStrategyOptions('users_by_name');
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedFlag(null);
  };

  const addStrategy = () => {
    const defaultStrategy = { strategyId: 'users_by_name', params: { users: '' } };
    setEditingStrategies(prev => [...prev, defaultStrategy]);
    fetchStrategyOptions('users_by_name');
  };

  const removeStrategy = (index) => {
    setEditingStrategies(prev => prev.filter((_, i) => i !== index));
  };

  const updateStrategyType = (index, newType) => {
    const defaultParams = {};
    if (newType === 'users_by_name') defaultParams.users = '';
    else if (newType === 'user_role') defaultParams.roles = '';
    else if (newType === 'release_date') {
      const today = new Date();
      defaultParams.date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    } else if (newType === 'gradual_rollout_user_id') defaultParams.percentage = '50';
    else if (newType === 'ip_whitelist') defaultParams.ips = '127.0.0.1';

    setEditingStrategies(prev => prev.map((s, i) => i === index ? { strategyId: newType, params: defaultParams } : s));
    fetchStrategyOptions(newType);
  };

  const updateStrategyParam = (index, paramKey, paramVal) => {
    setEditingStrategies(prev => prev.map((s, i) => {
      if (i !== index) return s;
      return {
        ...s,
        params: { ...s.params, [paramKey]: paramVal }
      };
    }));
  };

  const saveStrategies = () => {
    if (!selectedFlag) return;

    fetch(`${FF_API_BASE}/api/v1/flags/${selectedFlag.name}/strategy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategies: editingStrategies,
        strategyLogic: editingStrategyLogic
      })
    })
    .then(res => res.json())
    .then(updated => {
      setFlags(prev => prev.map(f => f.name === selectedFlag.name ? { ...f, strategies: updated.strategies, strategyLogic: updated.strategyLogic } : f));
      closeDrawer();
      showToast('Đã lưu', `Đã cập nhật chiến lược cờ cho ${customer.name}`, 'success');
    })
    .catch(err => {
      console.error(err);
      showToast('Lỗi', 'Không thể lưu chiến lược: ' + err.message, 'error');
    });
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        
        {/* Customer Header Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl mb-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {customer.name}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3">
              <span className="flag-key font-bold text-slate-700">{customer.customerCode}</span>
              <span className="font-mono text-slate-600">{customer.ipAddress || '127.0.0.1'}</span>
              {customer.serviceUrl && (
                <span className="font-mono text-blue-600 text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {customer.serviceUrl}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Instance: {customer.name}
          </div>
        </div>

        {/* Section Title & Push Action */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">
            Feature Flag Overrides for this Customer
          </h2>
          <button
            className="btn btn-primary"
            onClick={handleApply}
            disabled={applying}
            style={{
              background: '#e11d48',
              borderColor: '#e11d48',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
              fontSize: '13px',
              padding: '6px 18px'
            }}
          >
            <i className={`fa-solid ${applying ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
            {applying ? 'Applying...' : `Apply to ${customer.name}`}
          </button>
        </div>

        {/* Flags Table */}
        <div className="table-container">
          <table className="flags-table">
            <thead>
              <tr>
                <th>FLAG NAME</th>
                <th>KEY</th>
                <th>STRATEGIES</th>
                <th>PARAMETERS</th>
                <th>STATUS</th>
                <th>RULES</th>
                <th>UPDATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--ff-text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải cấu hình cờ...
                  </td>
                </tr>
              )}
              {!loading && flags.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ff-text-muted)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#94a3b8' }}>
                      <i className="fa-solid fa-shield-halved" style={{ fontSize: '20px' }}></i>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>
                      Chưa có cờ tính năng nào được cấp phép
                    </div>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>
                      Tenant này hiện chưa được cấp phép tính năng nào. Vui lòng bật cấp phép trong Super Admin Portal.
                    </p>
                  </td>
                </tr>
              )}
              {!loading && flags.map(flag => {
                const isEnabled = Boolean(flag.enabled);
                const strategies = flag.strategies || [];

                return (
                  <tr key={flag.name} onClick={() => openDrawer(flag)}>
                    <td>
                      <span className="flag-name">
                        {flag.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{flag.name}</span>
                    </td>
                    <td>
                      <span className="flag-key">{flag.name.toLowerCase()}</span>
                    </td>
                    <td>
                      {strategies && strategies.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {strategies.map((s, i) => (
                            <span
                              key={i}
                              className="badge badge-release"
                              style={{ textTransform: 'none', fontSize: '11px', background: '#ffe4e6', color: '#e11d48' }}
                            >
                              {getStrategyLabel(s.strategyId)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280', textTransform: 'none', fontSize: '11px' }}>
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getStrategiesParamsSummary(strategies) ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4b5563' }} title={getStrategiesParamsSummary(strategies)}>
                          {getStrategiesParamsSummary(strategies)}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '12px' }}>No params</span>
                      )}
                    </td>
                    <td onClick={(e) => { e.stopPropagation(); toggleFlagStatus(flag.name, isEnabled); }}>
                      <div className="flex items-center gap-2">
                        <label className="switch small" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => toggleFlagStatus(flag.name, isEnabled)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: isEnabled ? 'var(--ff-success)' : 'var(--ff-text-muted)',
                            minWidth: '24px'
                          }}
                        >
                          {isEnabled ? 'On' : 'Off'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: strategies.length > 0 ? '#e11d48' : '#6b7280',
                          background: strategies.length > 0 ? '#fff1f2' : '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        {strategies.length} rule{strategies.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--ff-text-muted)', fontSize: '12px' }}>
                        {flag.updatedAt ? new Date(flag.updatedAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '3px 10px' }}
                        onClick={(e) => { e.stopPropagation(); openDrawer(flag); }}
                      >
                        <i className="fa-solid fa-pen mr-1"></i> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Information Notice */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3.5 rounded-xl flex items-center gap-2 mt-5">
          <i className="fa-solid fa-circle-info text-blue-600 text-sm"></i>
          <span>
            Configure flags and strategies, then click <strong>Apply to {customer.name}</strong> to push the snapshot to that company's tracking-order instance.
          </span>
        </div>
      </div>

      {/* STRATEGY DRAWER (SLIDE-OUT FROM RIGHT) */}
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        {selectedFlag && (
          <>
            <div className="drawer-header">
              <div className="drawer-title">
                {editingStrategies.length > 0 ? (
                  <span className="badge badge-release" style={{ textTransform: 'none', background: '#ffe4e6', color: '#e11d48' }}>
                    {editingStrategies.length} strateg{editingStrategies.length > 1 ? 'ies' : 'y'}
                  </span>
                ) : (
                  <span className="badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Chưa có Strategy</span>
                )}
                {selectedFlag.enabled ? (
                  <span className="status-badge status-enabled"><i className="fa-solid fa-circle"></i> Đang BẬT</span>
                ) : (
                  <span className="status-badge" style={{ background: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}>
                    <i className="fa-solid fa-circle"></i> Đang TẮT
                  </span>
                )}
              </div>
              <button className="btn-close" onClick={closeDrawer}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="drawer-content">
              <h2>{selectedFlag.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</h2>
              <p className="drawer-flag-key">{selectedFlag.name.toLowerCase()}</p>

              <div className="section-title">
                <h4>CHIẾN LƯỢC KÍCH HOẠT (ACTIVATION STRATEGIES)</h4>
                <button className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={addStrategy}>
                  <i className="fa-solid fa-plus mr-1"></i> Thêm Strategy
                </button>
              </div>

              {/* Strategy Logic Selection (AND / OR) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ff-border-color)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ff-text-muted)' }}>Logic:</span>
                <button
                  type="button"
                  onClick={() => setEditingStrategyLogic('OR')}
                  style={{
                    padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    border: editingStrategyLogic === 'OR' ? '2px solid #16a34a' : '1px solid var(--ff-border-color)',
                    background: editingStrategyLogic === 'OR' ? '#dcfce7' : '#fff',
                    color: editingStrategyLogic === 'OR' ? '#16a34a' : 'var(--ff-text-muted)',
                  }}
                >OR</button>
                <button
                  type="button"
                  onClick={() => setEditingStrategyLogic('AND')}
                  style={{
                    padding: '3px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                    border: editingStrategyLogic === 'AND' ? '2px solid #d97706' : '1px solid var(--ff-border-color)',
                    background: editingStrategyLogic === 'AND' ? '#fef3c7' : '#fff',
                    color: editingStrategyLogic === 'AND' ? '#d97706' : 'var(--ff-text-muted)',
                  }}
                >AND</button>
                <span style={{ fontSize: '11px', color: 'var(--ff-text-muted)', marginLeft: '4px' }}>
                  {editingStrategyLogic === 'OR' ? '(Thỏa mãn ÍT NHẤT 1 chiến lược)' : '(Phải thỏa mãn TẤT CẢ các chiến lược)'}
                </span>
              </div>

              {/* Strategy List */}
              {editingStrategies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ff-text-muted)', background: '#f9fafb', borderRadius: '8px', border: '1px dashed var(--ff-border-color)' }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: '28px', marginBottom: '8px', color: '#d1d5db', display: 'block' }}></i>
                  Chưa có chiến lược nào. Tính năng sẽ phụ thuộc hoàn toàn vào trạng thái Bật/Tắt chung.
                </div>
              ) : (
                editingStrategies.map((strategy, index) => {
                  const optCacheKey = `${strategy.strategyId}__${CURRENT_CUSTOMER_CODE}`;
                  const currentOptions = strategyOptionsCache[optCacheKey] ||
                    strategyOptionsCache[`users_by_name__${CURRENT_CUSTOMER_CODE}`] ||
                    strategyOptionsCache[`username__${CURRENT_CUSTOMER_CODE}`] || [];
                  const isOptLoading = loadingOptions[strategy.strategyId] || loadingOptions['users_by_name'] || false;

                  return (
                    <div key={index} className="strategy-block" style={{ marginBottom: '16px', padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid var(--ff-border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ff-text-main)' }}>
                          Chiến lược #{index + 1}
                        </span>
                        <button
                          type="button"
                          className="btn-danger-icon"
                          onClick={() => removeStrategy(index)}
                          title="Xóa chiến lược này"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">Loại Chiến Lược</label>
                        <select
                          className="form-input text-xs"
                          value={strategy.strategyId}
                          onChange={(e) => updateStrategyType(index, e.target.value)}
                        >
                          <option value="users_by_name">Users by name (Danh sách người dùng)</option>
                          <option value="user_role">User Role (Vai trò: SELLER, BUYER, SHIPPER)</option>
                          <option value="release_date">Release Date (Ngày phát hành kích hoạt)</option>
                          <option value="gradual_rollout_user_id">Gradual Rollout (Phần trăm người dùng)</option>
                          <option value="ip_whitelist">IP / Hostname Whitelist</option>
                        </select>
                      </div>

                      {/* Dynamic Parameters */}
                      {strategy.strategyId === 'users_by_name' && (
                        <div className="form-group">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Tên Người Dùng ({customer.name})</label>
                          <MultiSelectParam
                            strategyType="users_by_name"
                            selectedValues={(strategy.params?.users || '').split(',').map(s => s.trim()).filter(Boolean)}
                            onChange={(newVals) => updateStrategyParam(index, 'users', newVals.join(','))}
                            options={currentOptions}
                            loading={isOptLoading}
                          />
                        </div>
                      )}

                      {strategy.strategyId === 'user_role' && (
                        <div className="form-group">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Vai Trò Người Dùng</label>
                          <MultiSelectParam
                            strategyType="user_role"
                            selectedValues={(strategy.params?.roles || '').split(',').map(s => s.trim()).filter(Boolean)}
                            onChange={(newVals) => updateStrategyParam(index, 'roles', newVals.join(','))}
                            options={[
                              { value: 'SELLER', label: 'SELLER (Người bán / Quản trị)' },
                              { value: 'BUYER', label: 'BUYER (Khách mua hàng)' },
                              { value: 'SHIPPER', label: 'SHIPPER (Nhân viên giao hàng)' }
                            ]}
                            loading={false}
                          />
                        </div>
                      )}

                      {strategy.strategyId === 'release_date' && (
                        <div className="form-group">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Ngày Bắt Đầu Có Hiệu Lực</label>
                          <DatePickerParam
                            value={strategy.params?.date || ''}
                            onChange={(newDate) => updateStrategyParam(index, 'date', newDate)}
                          />
                        </div>
                      )}

                      {strategy.strategyId === 'gradual_rollout_user_id' && (
                        <div className="form-group">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">
                            Phần Trăm Kích Hoạt ({strategy.params?.percentage || 50}%)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            className="w-full cursor-pointer"
                            value={strategy.params?.percentage || 50}
                            onChange={(e) => updateStrategyParam(index, 'percentage', e.target.value)}
                          />
                        </div>
                      )}

                      {strategy.strategyId === 'ip_whitelist' && (
                        <div className="form-group">
                          <label className="text-xs font-semibold text-slate-500 block mb-1">Danh Sách IP Whitelist (ngăn cách bởi dấu phẩy)</label>
                          <input
                            className="form-input text-xs"
                            placeholder="e.g. 127.0.0.1, 192.168.1.1"
                            value={strategy.params?.ips || ''}
                            onChange={(e) => updateStrategyParam(index, 'ips', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="drawer-footer">
              <button className="btn btn-outline" onClick={closeDrawer}>Hủy</button>
              <button className="btn btn-primary" onClick={saveStrategies} style={{ background: '#e11d48', borderColor: '#e11d48' }}>
                Lưu Chiến Lược
              </button>
            </div>
          </>
        )}
      </aside>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`ff-toast ${toast.type}`}>
          <div className="ff-toast-icon">
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-check' : toast.type === 'info' ? 'fa-info' : 'fa-triangle-exclamation'}`}></i>
          </div>
          <div className="ff-toast-content">
            <div className="ff-toast-title">{toast.title}</div>
            <div className="ff-toast-message">{toast.message}</div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

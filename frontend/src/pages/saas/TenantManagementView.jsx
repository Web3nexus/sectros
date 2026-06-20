import React, { useState, useEffect } from 'react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import {Building2, Search, Plus, MoreVertical, Shield, ShieldAlert, ShieldCheck, CheckCircle, Globe, Activity, Play, Pause, Edit, Trash2, X, ExternalLink, Palette, Key, RefreshCw, Download, CheckSquare, Square, Loader2, Settings} from 'lucide-react';

export default function TenantManagementView() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    id: '',
    business_name: '',
    plan: 'free',
    owner_email: '',
    owner_name: '',
    owner_password: '',
    business_type: 'restaurant'
  });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isUpdatingFeatures, setIsUpdatingFeatures] = useState(false);
  const [tenantStaff, setTenantStaff] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [staffToReset, setStaffToReset] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBusinessType, setFilterBusinessType] = useState('all');

  const [tenantDomains, setTenantDomains] = useState([]);
  const [isDomainsLoading, setIsDomainsLoading] = useState(false);
  const [domainRegisterInput, setDomainRegisterInput] = useState('');
  const [domainAvailability, setDomainAvailability] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isPurchasingDomain, setIsPurchasingDomain] = useState(false);
  const [domainPurchaseResult, setDomainPurchaseResult] = useState(null);

  const businessTypes = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bar', label: 'Bar' },
    { value: 'salon', label: 'Salon' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'other', label: 'Other' }
  ];

  const [availableThemes, setAvailableThemes] = useState([]);
  const [unlockedThemes, setUnlockedThemes] = useState([]);
  const [isThemesLoading, setIsThemesLoading] = useState(false);
  const [selectedThemeToUnlock, setSelectedThemeToUnlock] = useState('');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkExporting, setIsBulkExporting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('saas/tenants');
      setTenants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tenants", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('saas/plans');
      const fetchedPlans = Array.isArray(response.data) ? response.data : [];
      if (fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
      } else {
        // Fallback to standard tiers if database is empty
        setPlans([
          { id: 'f1', name: 'Free Tier', slug: 'free' },
          { id: 'p1', name: 'Pro Tier', slug: 'pro' },
          { id: 'e1', name: 'Enterprise Tier', slug: 'enterprise' }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
      // Ensure the dropdown is populated even on API failure
      setPlans([
        { id: 'f1', name: 'Free Tier', slug: 'free' },
        { id: 'p1', name: 'Pro Tier', slug: 'pro' },
        { id: 'e1', name: 'Enterprise Tier', slug: 'enterprise' }
      ]);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await api.get('saas/cms/themes');
      setAvailableThemes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch themes", error);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchPlans();
    fetchThemes();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchTenantStaff(selectedTenant.id);
      fetchUnlockedThemes(selectedTenant.id);
      fetchTenantDomains(selectedTenant.id);
    }
  }, [selectedTenant]);

  const fetchUnlockedThemes = async (id) => {
    setIsThemesLoading(true);
    try {
      const response = await api.get(`/saas/tenants/${id}/themes`);
      setUnlockedThemes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch unlocked themes", error);
    } finally {
      setIsThemesLoading(false);
    }
  };

  const handleUnlockTheme = async () => {
    if (!selectedThemeToUnlock) return;
    try {
      await api.post(`/saas/tenants/${selectedTenant.id}/themes/unlock`, { theme_id: selectedThemeToUnlock });
      setSelectedThemeToUnlock('');
      fetchUnlockedThemes(selectedTenant.id);
    } catch (error) {
      showToast("Failed to unlock theme", "error");
    }
  };

  const handleRevokeTheme = async (themeId) => {
    try {
      await api.delete(`/saas/tenants/${selectedTenant.id}/themes/${themeId}`);
      fetchUnlockedThemes(selectedTenant.id);
    } catch (error) {
      showToast("Failed to revoke theme", "error");
    }
  };

  const fetchTenantStaff = async (id) => {
    setIsStaffLoading(true);
    try {
      const response = await api.get(`/saas/tenants/${id}/staff`);
      setTenantStaff(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch tenant staff", error);
    } finally {
      setIsStaffLoading(false);
    }
  };

  const fetchTenantDomains = async (id) => {
    setIsDomainsLoading(true);
    try {
      const response = await api.get(`/saas/tenants/${id}/domain-status`);
      setTenantDomains(Array.isArray(response.data.domains) ? response.data.domains : []);
    } catch (error) {
      console.error("Failed to fetch tenant domains", error);
      setTenantDomains([]);
    } finally {
      setIsDomainsLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!domainRegisterInput.trim()) return;
    setIsCheckingAvailability(true);
    setDomainAvailability(null);
    try {
      const response = await api.post(`/saas/tenants/${selectedTenant.id}/domain/check-availability`, {
        domain: domainRegisterInput.trim(),
      });
      setDomainAvailability(response.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to check availability', 'error');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handlePurchaseDomain = async () => {
    if (!domainAvailability?.available) return;
    setIsPurchasingDomain(true);
    try {
      const response = await api.post(`/saas/tenants/${selectedTenant.id}/domain/purchase`, {
        domain: domainAvailability.domain,
      });
      setDomainPurchaseResult(response.data);
      showToast(`Domain ${response.data.domain} registered successfully!`, 'success');
      setDomainRegisterInput('');
      setDomainAvailability(null);
      fetchTenantDomains(selectedTenant.id);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to register domain', 'error');
    } finally {
      setIsPurchasingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId) => {
    try {
      const response = await api.post(`/saas/tenants/${selectedTenant.id}/domain/${domainId}/verify`);
      showToast(response.data.connected ? 'Domain verified!' : 'DNS not pointing correctly yet.', 'success');
      fetchTenantDomains(selectedTenant.id);
    } catch (error) {
      showToast('Verification failed.', 'error');
    }
  };

  const handleConfigureDns = async (domainId) => {
    try {
      await api.post(`/saas/tenants/${selectedTenant.id}/domain/${domainId}/configure-dns`);
      showToast('DNS records re-configured.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'DNS configuration failed.', 'error');
    }
  };

  const toggleStaff2FA = async (tenantId, userId, currentStatus) => {
    try {
      await api.patch(`/saas/tenants/${tenantId}/staff/${userId}/2fa`, { enabled: !currentStatus });
      fetchTenantStaff(tenantId);
      fetchTenants(); // Refresh main list to sync status in table
    } catch (error) {
      console.error("Failed to toggle staff 2FA", error);
      showToast("Failed to update 2FA status.", "error");
    }
  };

  const handleSyncOwner = async (id) => {
    showToast("Syncing owner account...", "loading");
    try {
      await api.post(`/saas/tenants/${id}/sync-owner`);
      showToast("Owner account synced successfully!", "success");
      fetchTenants();
    } catch (error) {
      showToast("Failed to sync owner account.", "error");
    }
  };

  const handleUpdateFeatures = async (features) => {
    setIsUpdatingFeatures(true);
    try {
      await api.patch(`/saas/tenants/${selectedTenant.id}/features`, { features });
      
      // Update local state
      const updatedTenants = (Array.isArray(tenants) ? tenants : []).map(t => 
        t.id === selectedTenant.id ? { ...t, features } : t
      );
      setTenants(updatedTenants);
      setSelectedTenant({ ...selectedTenant, features });
    } catch (error) {
      alert("Failed to update features");
    } finally {
      setIsUpdatingFeatures(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreationError(null);

    try {
      await api.post('saas/tenants', newTenant).then((res) => {
          if (res.data.plain_password) {
              setCreatedCredentials({
                  tenantId: newTenant.id,
                  email: newTenant.owner_email,
                  password: res.data.plain_password,
                  domain: res.data.tenant.domains?.[0]?.domain || `${newTenant.id}.[platform_domain]`
              });
          }
      });
      setIsModalOpen(false);
      const defaultPlan = plans[0]?.slug || 'free';
      setNewTenant({ id: '', business_name: '', plan: defaultPlan, owner_email: '', owner_name: '', owner_password: '', business_type: 'restaurant' });
      showToast("Tenant deployed successfully!", "success");
      fetchTenants();
    } catch (error) {
      console.error("Failed to create tenant", error);
      const errorMsg = error.response?.data?.message || "Failed to create tenant. Please try again.";
      
      // If there are detailed validation errors, pick the first one
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        setCreationError(firstError);
      } else {
        setCreationError(errorMsg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!createdCredentials) return;
    setIsSendingEmail(true);
    try {
      await api.post(`/saas/tenants/${createdCredentials.tenantId}/send-welcome`, {
        email: createdCredentials.email,
        password: createdCredentials.password,
        domain: createdCredentials.domain
      });
      showToast("Welcome email dispatched successfully!", "success");
    } catch (error) {
      showToast("Failed to send welcome email.", "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResetCredentials = async (e) => {
    e.preventDefault();
    if (!staffToReset || !selectedTenant) return;
    setIsResetting(true);
    try {
      await api.post(`/saas/tenants/${selectedTenant.id}/staff/${staffToReset.id}/reset-credentials`, {
        new_email: newEmail,
        new_password: newPassword,
        send_email: sendEmailCheckbox
      });
      showToast("Credentials updated successfully!", "success");
      setResetModalOpen(false);
      fetchTenantStaff(selectedTenant.id); 
    } catch (error) {
      showToast("Failed to update credentials", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/saas/tenants/${id}/status`, { status: newStatus });
      fetchTenants();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteTenant = async (id) => {
    try {
      await api.delete(`/saas/tenants/${id}`);
      fetchTenants();
      if (selectedTenant?.id === id) setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to delete tenant", error);
    }
  };

  const confirmDelete = (id) => {
    setTenantToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleImpersonate = async (tenant) => {
    try {
      const response = await api.get(`/saas/tenants/${tenant.id}/impersonate`);
      const { token, domain, redirect_url } = response.data;
      
      if (redirect_url) {
        window.open(redirect_url, '_blank');
      } else if (token && domain) {
        const protocol = window.location.protocol;
        window.open(`${protocol}//${domain}/login?token=${token}&domain=${domain}&impersonate=1`, '_blank');
      }
    } catch (error) {
      console.error("Impersonation failed", error);
      const errorMsg = error.response?.data?.message || "Impersonation failed. The tenant database might not be initialized.";
      showToast(errorMsg, "error");
    }
  };

  const handleEditTenant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        business_name: editingTenant.business_name,
        business_type: editingTenant.business_type,
        plan: editingTenant.plan,
        status: editingTenant.status,
        is_testing: editingTenant.is_testing,
      };
      if (editingTenant.is_testing && editingTenant.testing_days) {
        payload.testing_days = editingTenant.testing_days;
      }
      await api.patch(`/saas/tenants/${editingTenant.id}`, payload);
      setEditingTenant(null);
      fetchTenants();
    } catch (error) {
      console.error("Failed to update tenant", error);
      showToast("Failed to update tenant.", "error");
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await api.post('/saas/tenants/bulk-delete', { ids: selectedIds });
      showToast(`Successfully deleted ${selectedIds.length} tenants`, "success");
      setSelectedIds([]);
      fetchTenants();
    } catch (error) {
      showToast("Failed to delete tenants", "error");
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const handleBulkExport = async () => {
    setIsBulkExporting(true);
    try {
      const response = await api.post('/saas/tenants/bulk-export', { ids: selectedIds }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tenants_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Export completed successfully", "success");
    } catch (error) {
      showToast("Failed to export data", "error");
    } finally {
      setIsBulkExporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTenants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTenants.map(t => t.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredTenants = (Array.isArray(tenants) ? tenants : []).filter(tenant => {
    const matchesSearch = 
      tenant.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = filterPlan === 'all' || tenant.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesType = filterBusinessType === 'all' || tenant.business_type === filterBusinessType;

    return matchesSearch && matchesPlan && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage restaurant instances, billing, and status.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tenant
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by business name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border text-foreground rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <select 
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-background border border-border text-muted-foreground text-sm rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary transition-all"
            >
                <option value="all">All Plans</option>
                {(Array.isArray(plans) ? plans : []).map(p => (
                  <option key={p.id} value={p.slug}>{p.name}</option>
                ))}
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-background border border-border text-muted-foreground text-sm rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary transition-all"
            >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
            </select>
            <select 
              value={filterBusinessType}
              onChange={(e) => setFilterBusinessType(e.target.value)}
              className="bg-background border border-border text-muted-foreground text-sm rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-primary transition-all"
            >
                <option value="all">All Types</option>
                {businessTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm w-full scrollbar-thin scrollbar-thumb-primary/20">
        <table className="w-full text-left border-collapse min-w-[1400px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
              <th className="p-4 w-10">
                 <button 
                  onClick={toggleSelectAll}
                  className="w-5 h-5 rounded border border-border flex items-center justify-center hover:border-primary transition-colors bg-background"
                 >
                   {selectedIds.length === filteredTenants.length && filteredTenants.length > 0 ? (
                     <CheckSquare className="w-4 h-4 text-primary" />
                   ) : selectedIds.length > 0 ? (
                     <div className="w-2 h-0.5 bg-primary rounded-full" />
                   ) : (
                     <Square className="w-4 h-4" />
                   )}
                 </button>
              </th>
              <th className="p-4">Business / Domain</th>
              <th className="p-4">Type</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Plan</th>
              <th className="p-4 text-center">Staff</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">2FA</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-muted-foreground">
                  <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  Loading tenants...
                </td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-muted-foreground italic">
                  No tenants found.
                </td>
              </tr>
             ) : (
              filteredTenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  onClick={() => toggleSelectOne(tenant.id)}
                  className={`hover:bg-primary/5 transition-colors group cursor-pointer ${selectedIds.includes(tenant.id) ? 'bg-primary/5' : ''}`}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleSelectOne(tenant.id)}
                      className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${
                        selectedIds.includes(tenant.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      {selectedIds.includes(tenant.id) && <CheckSquare className="w-4 h-4 text-primary" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant); }}>
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant); }}>
                        <p className="text-foreground font-semibold hover:text-primary transition-colors">{tenant.business_name}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mt-0.5">
                            <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border font-bold uppercase">{tenant.id}</span>
                            <span>•</span>
                            <span className="hover:text-primary transition-colors font-medium flex items-center gap-1">
                                {tenant.domain}
                                {tenant.domain_count > 0 && (
                                    tenant.domain_verified
                                        ? <CheckCircle size={10} className="text-emerald-500" />
                                        : <Globe size={10} className="text-amber-500" />
                                )}
                            </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md bg-muted border border-border text-[10px] font-bold uppercase text-muted-foreground">
                        {tenant.business_type || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground font-semibold">{tenant.owner_name}</p>
                    <p className="text-muted-foreground text-xs">{tenant.owner_email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold capitalize border tracking-wider ${
                        tenant.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-500/20' :
                        tenant.plan === 'pro' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-muted text-muted-foreground border-border'
                    }`}>
                        {tenant.plan}
                    </span>
                    {tenant.is_testing && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/20 ml-1">
                        Testing
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedTenant(tenant); }}
                        className="font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg border border-primary/20 transition-all cursor-pointer text-xs"
                    >
                        {tenant.staff_count || 0}
                    </button>
                  </td>
                  <td className="p-4">
                    {tenant.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">Active</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20">Suspended</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tenant.owner_user_id) {
                          toggleStaff2FA(tenant.id, tenant.owner_user_id, tenant.two_factor_enabled);
                        } else {
                          showToast("Initializing owner account...", "loading");
                          handleSyncOwner(tenant.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        tenant.two_factor_enabled 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'bg-muted border-border text-muted-foreground/40 hover:text-muted-foreground'
                      }`}
                      title={tenant.two_factor_enabled ? "2FA Enabled - Click to Disable" : "2FA Disabled - Click to Enable"}
                    >
                      <Shield size={16} fill={tenant.two_factor_enabled ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs font-medium">
                    {tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingTenant({...tenant}); }}
                          className="p-2 hover:bg-muted text-foreground/60 hover:text-primary rounded-lg transition-colors" title="Edit Tenant"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        {tenant.id !== 'landlord' && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleImpersonate(tenant); }}
                               className="p-2 hover:bg-muted text-foreground/60 hover:text-primary rounded-lg transition-colors" title="Login as Business"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        )}
                        {tenant.status === 'active' ? (
                            <button 
                              onClick={() => toggleStatus(tenant.id, 'active')}
                              className="p-2 hover:bg-muted text-muted-foreground hover:text-amber-500 rounded-lg transition-colors" title="Suspend Tenant"
                            >
                                <Pause className="w-4 h-4" />
                            </button>
                        ) : (
                            <button 
                              onClick={() => toggleStatus(tenant.id, 'suspended')}
                              className="p-2 hover:bg-muted text-muted-foreground hover:text-emerald-500 rounded-lg transition-colors" title="Reactivate Tenant"
                            >
                                <Play className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                          onClick={() => confirmDelete(tenant.id)}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-red-500 rounded-lg transition-colors" title="Delete Tenant Data"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground">Create New Restaurant</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {creationError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{creationError}</p>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Internal ID (slug)</label>
                    <input 
                      required
                      placeholder="e.g. mcdonalds-dt"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={newTenant.id}
                      onChange={e => setNewTenant({...newTenant, id: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Business Name</label>
                    <input 
                      required
                      placeholder="McDonald's Downtown"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={newTenant.business_name}
                      onChange={e => setNewTenant({...newTenant, business_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Business Type</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none capitalize transition-all"
                      value={newTenant.business_type}
                      onChange={e => setNewTenant({...newTenant, business_type: e.target.value})}
                    >
                      {businessTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Plan</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none capitalize transition-all"
                      value={newTenant.plan}
                      onChange={e => setNewTenant({...newTenant, plan: e.target.value})}
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">System Domains</label>
                    <div className="w-full bg-primary/5 border border-primary/20 rounded-xl py-3 px-4 flex items-center justify-between">
                       <p className="text-xs text-primary font-mono font-bold">
                           {newTenant.id ? `${newTenant.id}.[platform_domain]` : 'Pending ID...'}
                       </p>
                       <Shield className="w-4 h-4 text-primary/50" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Dashboard and Public domains are automatically generated based on SaaS Platform Settings.</p>
                  </div>
                   <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Owner Full Name</label>
                    <input 
                      required
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={newTenant.owner_name}
                      onChange={e => setNewTenant({...newTenant, owner_name: e.target.value})}
                    />
                  </div>
                   <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Owner Email Address</label>
                    <input 
                      required
                      type="email"
                      placeholder="manager@mcdonalds.com"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={newTenant.owner_email}
                      onChange={e => setNewTenant({...newTenant, owner_email: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Temporary Password <span className="text-[10px] text-muted-foreground">(Optional - Auto-generated if empty)</span></label>
                    <input 
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/50 transition-all"
                      value={newTenant.owner_password}
                      onChange={e => setNewTenant({...newTenant, owner_password: e.target.value})}
                    />
                  </div>
               </div>
               <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isCreating 
                        ? 'bg-muted text-muted-foreground/50 cursor-not-allowed' 
                        : 'bg-primary hover:brightness-110 text-primary-foreground shadow-primary/20 hover:scale-[1.02]'
                    }`}
                  >
                    {isCreating ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Deploy Restaurant'
                    )}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingTenant(null)} />
          <div className="relative bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Edit Tenant</h3>
              <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleEditTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Business Name</label>
                <input
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={editingTenant.business_name}
                  onChange={e => setEditingTenant({...editingTenant, business_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Business Type</label>
                <select
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none capitalize transition-all"
                  value={editingTenant.business_type}
                  onChange={e => setEditingTenant({...editingTenant, business_type: e.target.value})}
                >
                  {businessTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Plan</label>
                <select
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={editingTenant.plan}
                  onChange={e => setEditingTenant({...editingTenant, plan: e.target.value})}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                <select
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={editingTenant.status}
                  onChange={e => setEditingTenant({...editingTenant, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Subscription Mode</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingTenant({...editingTenant, is_testing: false, testing_days: ''})}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      !editingTenant.is_testing
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTenant({...editingTenant, is_testing: true})}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      editingTenant.is_testing
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    Testing
                  </button>
                </div>
              </div>
              {editingTenant.is_testing && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Testing Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    value={editingTenant.testing_days || ''}
                    onChange={e => setEditingTenant({...editingTenant, testing_days: e.target.value})}
                    placeholder="e.g. 30"
                  />
                  {editingTenant.testing_ends_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently testing until {new Date(editingTenant.testing_ends_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:brightness-110 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deep View Slide-over */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-background/60 backdrop-blur-xs" onClick={() => setSelectedTenant(null)} />
           <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-blue-600/20 flex items-center justify-center">
                       <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">{selectedTenant.business_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-blue-400 text-xs font-bold uppercase">{selectedTenant.owner_name}</p>
                            <span className="text-slate-600 text-xs">•</span>
                            <p className="text-muted-foreground text-xs">{selectedTenant.owner_email}</p>
                        </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                    <X className="w-5 h-5 text-muted-foreground" />
                 </button>
              </div>

              {/* Feature Toggles */}
              <div className="mb-10">
                 <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Module Access Control</h4>
                 <div className="grid grid-cols-1 gap-3">
                    {['AI Command Center', 'Online Ordering', 'Financial Reports', 'Staff Management'].map(feature => {
                        const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
                        const isEnabled = selectedTenant?.features?.[featureKey] !== false;
                        return (
                           <div key={feature} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex align-center justify-between group">
                              <div>
                                 <p className="text-sm font-bold text-foreground mb-0.5">{feature}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium">Allow {selectedTenant.business_name} access to this module.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer scale-90">
                                 <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isEnabled}
                                    disabled={isUpdatingFeatures}
                                    onChange={(e) => {
                                        const newFeatures = { ...selectedTenant.features, [featureKey]: e.target.checked };
                                        handleUpdateFeatures(newFeatures);
                                    }}
                                 />
                                 <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                           </div>
                        );
                    })}
                 </div>
              </div>

              {/* Staff Audit */}
              <div className="flex-1">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Personnel ({tenantStaff.length})</h4>
                    <Activity className={`w-4 h-4 text-emerald-500 ${isStaffLoading ? 'animate-pulse' : ''}`} />
                 </div>
                 
                 <div className="space-y-3">
                    {isStaffLoading ? (
                        [1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 rounded-2xl animate-pulse border border-border" />)
                    ) : (tenantStaff || []).length === 0 ? (
                        <p className="p-8 text-center text-slate-600 text-sm border-2 border-dashed border-border rounded-3xl">No staff records found in tenant database.</p>
                    ) : (
                        (Array.isArray(tenantStaff) ? tenantStaff : []).map(staff => (
                           <div key={staff.id} className="p-4 rounded-2xl bg-muted/10 border border-border flex items-center gap-4 group hover:bg-muted/30 transition-colors">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-blue-400 uppercase font-black text-xs border border-blue-600/20">
                                 {staff?.name?.substring(0,2) || '??'}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-300">{staff?.name || 'Unknown'}</p>
                                    {staff?.is_owner ? ( <span className="text-[9px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded shadow-sm shadow-primary/30 uppercase tracking-widest flex items-center"> Owner </span> ) : ( <span className="text-[8px] font-black bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase border border-border tracking-wider"> {staff?.role || 'staff'} </span> )}
                                 </div>
                                 <p className="text-[10px] text-muted-foreground font-medium">{staff?.email || 'N/A'}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${staff?.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                              <button 
                                onClick={() => {
                                  setStaffToReset(staff);
                                  setNewEmail(staff.email);
                                  setNewPassword('');
                                  setSendEmailCheckbox(true);
                                  setResetModalOpen(true);
                                }}
                                className="ml-2 p-1.5 rounded-lg border bg-muted border-border text-muted-foreground hover:text-foreground transition-all"
                                title="Reset Password / Edit Email"
                              >
                                <Key size={14} />
                              </button>
                              <button 
                                onClick={() => toggleStaff2FA(selectedTenant.id, staff.id, staff.two_factor_enabled)}
                                className={`ml-2 p-1.5 rounded-lg border transition-all ${
                                  staff.two_factor_enabled 
                                  ? 'bg-primary/10 border-blue-600/20 text-blue-400' 
                                  : 'bg-muted border-border text-muted-foreground'
                                }`}
                                title={staff.two_factor_enabled ? "2FA Active - Click to Disable" : "2FA Disabled - Click to Enable"}
                              >
                                <Shield size={14} fill={staff.two_factor_enabled ? "currentColor" : "none"} />
                              </button>
                            </div>
                        ))
                    )}
                 </div>
              </div>

              {/* Premium Themes Access */}
              <div className="mt-8">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Premium Themes Access</h4>
                    <Palette className={`w-4 h-4 text-blue-500 ${isThemesLoading ? 'animate-pulse' : ''}`} />
                 </div>
                 
                 <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <select 
                            className="flex-1 bg-card border border-border text-slate-300 text-sm rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary"
                            value={selectedThemeToUnlock}
                            onChange={(e) => setSelectedThemeToUnlock(e.target.value)}
                        >
                            <option value="">Select a Premium Theme...</option>
                            {availableThemes
                                .filter(theme => !unlockedThemes.some(ut => ut.id === theme.id))
                                .map(theme => (
                                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                                ))
                            }
                        </select>
                        <button 
                            onClick={handleUnlockTheme}
                            disabled={!selectedThemeToUnlock || isThemesLoading}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Key className="w-4 h-4" />
                            Unlock
                        </button>
                    </div>

                    <div className="space-y-2">
                        {isThemesLoading ? (
                            <div className="h-10 bg-muted/20 rounded-xl animate-pulse border border-border" />
                        ) : unlockedThemes.length === 0 ? (
                            <p className="text-center text-muted-foreground text-xs py-2">No premium themes unlocked manually.</p>
                        ) : (
                            unlockedThemes.map(theme => (
                                <div key={theme.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-foreground">{theme.name}</span>
                                        <span className="text-[10px] text-muted-foreground">Unlocked on {new Date(theme.purchased_at).toLocaleDateString()}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRevokeTheme(theme.id)}
                                        className="text-red-400 hover:text-red-300 hover:underline text-xs font-semibold"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                  </div>
               </div>

               {/* Domain Management */}
               <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Connected Domains</h4>
                     <Globe className="w-4 h-4 text-amber-500" />
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-4">
                     {isDomainsLoading ? (
                        <div className="h-12 bg-muted/20 rounded-xl animate-pulse border border-border" />
                     ) : tenantDomains.length === 0 ? (
                        <p className="text-center text-muted-foreground text-xs py-3">No domains connected yet.</p>
                     ) : (
                        <div className="space-y-2">
                           {tenantDomains.map(d => (
                              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                                 <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                       <span className="text-sm font-bold text-foreground truncate">{d.domain}</span>
                                       <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                          d.is_verified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                       }`}>
                                          {d.is_verified ? <CheckCircle size={10} /> : <Globe size={10} />}
                                          {d.is_verified ? 'Verified' : d.type === 'registered' ? 'Configured' : 'Pending'}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                       <span className="capitalize">{d.type}</span>
                                       {d.registrar && <span>• {d.registrar}</span>}
                                       {d.expires_at && <span>• Expires {new Date(d.expires_at).toLocaleDateString()}</span>}
                                       <span>• SSL: {d.ssl_status}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-1 shrink-0 ml-3">
                                    <button onClick={() => handleVerifyDomain(d.id)} className="p-1.5 rounded-lg border bg-muted border-border text-muted-foreground hover:text-foreground transition-all" title="Verify DNS">
                                       <RefreshCw size={12} />
                                    </button>
                                    {d.registrar === 'namesilo' && (
                                       <button onClick={() => handleConfigureDns(d.id)} className="p-1.5 rounded-lg border bg-muted border-border text-muted-foreground hover:text-foreground transition-all" title="Re-configure DNS">
                                          <Settings size={12} />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="border-t border-border pt-4">
                        <p className="text-[10px] font-bold text-muted-foreground mb-2">Register via NameSilo</p>
                        <div className="flex gap-2">
                           <input
                              type="text"
                              placeholder="e.g., myrestaurant.com"
                              value={domainRegisterInput}
                              onChange={(e) => { setDomainRegisterInput(e.target.value); setDomainAvailability(null); }}
                              className="flex-1 bg-card border border-border text-foreground text-sm rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary"
                           />
                           <button
                              onClick={handleCheckAvailability}
                              disabled={!domainRegisterInput.trim() || isCheckingAvailability}
                              className="bg-primary text-primary-foreground px-3 py-2 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                           >
                              {isCheckingAvailability ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
                           </button>
                        </div>

                        {domainAvailability && (
                           <div className={`mt-3 p-3 rounded-xl border ${domainAvailability.available ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                              {domainAvailability.available ? (
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <p className="text-sm font-bold text-emerald-500">{domainAvailability.domain} is available!</p>
                                       <p className="text-[10px] text-muted-foreground mt-0.5">Registration fee will be charged to account balance.</p>
                                    </div>
                                    <button
                                       onClick={handlePurchaseDomain}
                                       disabled={isPurchasingDomain}
                                       className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                                    >
                                       {isPurchasingDomain ? <Loader2 size={14} className="animate-spin" /> : null}
                                       Register ${15}/yr
                                    </button>
                                 </div>
                              ) : (
                                 <p className="text-sm text-red-500">{domainAvailability.domain} is not available.</p>
                              )}
                           </div>
                        )}

                        {domainPurchaseResult && (
                           <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                 <CheckCircle size={14} /> {domainPurchaseResult.domain} registered & configured!
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">DNS records (A, CNAME, TXT) have been configured automatically.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-border">
                  <button onClick={() => confirmDelete(selectedTenant.id)} className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                    Purge Instance Data
                  </button>
              </div>
           </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTenant(tenantToDelete)}
        title="Purge Restaurant Data?"
        message="This will permanently delete the entire restaurant database, including all orders, staff and customers. This action is irreversible."
        confirmText="Purge Database"
        type="danger"
      />

      <ConfirmationModal 
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Tenants"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} tenants? This action cannot be undone and will purge all associated databases.`}
        confirmText={isBulkDeleting ? "Deleting..." : "Permanently Delete"}
        type="danger"
      />

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-blue-500/30 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="flex flex-col">
             <span className="text-foreground font-bold text-sm">{selectedIds.length} Restaurants Selected</span>
             <button onClick={() => setSelectedIds([])} className="text-blue-400 text-xs text-left hover:underline">Deselect all</button>
           </div>
           
           <div className="h-8 w-px bg-border/50" />
           
           <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkExport}
                disabled={isBulkExporting}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all border border-border/50"
              >
                {isBulkExporting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export CSV
              </button>
              
              <button 
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-medium transition-all border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
           </div>
           
           <button 
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground ml-2"
           >
             <X className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Reset Credentials Modal */}
      {resetModalOpen && staffToReset && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setResetModalOpen(false)} />
          <div className="relative bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground">Reset Credentials</h3>
              <button onClick={() => setResetModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleResetCredentials} className="space-y-6">
               <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">User Email Address</label>
                  <input 
                    type="email"
                    required
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">New Password (Optional)</label>
                  <input 
                    type="text"
                    placeholder="Leave blank to auto-generate"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground/50"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                   <input 
                     type="checkbox" 
                     className="w-5 h-5 bg-background border border-border rounded text-primary focus:ring-offset-0 focus:ring-0 cursor-pointer"
                     checked={sendEmailCheckbox}
                     onChange={e => setSendEmailCheckbox(e.target.checked)}
                   />
                   <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                     Send new credentials via email
                   </span>
                </label>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setResetModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isResetting}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                  >
                    {isResetting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Update & Send'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Summary Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
          <div className="relative bg-card border border-emerald-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            
            <h3 className="text-2xl font-black text-foreground text-center mb-2">Tenant Deployed</h3>
            <p className="text-sm text-center text-muted-foreground mb-8">
              Please securely share these credentials with the restaurant owner. They will not be shown again.
            </p>

            <div className="space-y-4 mb-8">
               <div className="bg-background rounded-xl p-4 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Dashboard URL</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-blue-400 select-all">{createdCredentials.domain}</span>
                    <a href={`http://${createdCredentials.domain}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors ml-auto">
                       <ExternalLink size={14} />
                    </a>
                  </div>
               </div>
               
               <div className="bg-background rounded-xl p-4 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Owner Email</span>
                  <div className="font-mono text-sm text-foreground select-all">{createdCredentials.email}</div>
               </div>

               <div className="bg-background rounded-xl p-4 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-1">Temporary Password</span>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm text-emerald-400 select-all font-bold">{createdCredentials.password}</div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleSendWelcomeEmail}
                disabled={isSendingEmail}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isSendingEmail ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send via Email'}
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Dashboard: http://${createdCredentials.domain}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                  setCreatedCredentials(null);
                  showToast("Credentials copied to clipboard!", "success");
                }}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                Copy & Close
              </button>
              <button
                 onClick={() => setCreatedCredentials(null)}
                 className="w-full py-3 bg-transparent text-muted-foreground hover:text-foreground rounded-xl font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

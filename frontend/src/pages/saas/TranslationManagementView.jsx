import React, { useState, useEffect } from 'react';
import {Search, Plus, Edit, Trash2, X, Globe, Save, Loader2, AlertCircle} from 'lucide-react';
import api from '../../services/centralApi';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export default function TranslationManagementView() {
  const [translations, setTranslations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [newTranslation, setNewTranslation] = useState({
    locale: 'en',
    group: '',
    key: '',
    value: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState(null);

  const locales = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];

  const fetchTranslations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('saas/translations', {
        params: { locale: selectedLocale }
      });
      setTranslations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch translations", error);
      setError("Failed to load translations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, [selectedLocale]);

  const handleCreateTranslation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await api.post('saas/translations', newTranslation);
      setIsModalOpen(false);
      setNewTranslation({ locale: selectedLocale, group: '', key: '', value: '' });
      fetchTranslations();
    } catch (error) {
      setError("Failed to create translation. Ensure the key doesn't already exist in this group/locale.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTranslation = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await api.put(`/saas/translations/${editingTranslation.id}`, {
        value: editingTranslation.value
      });
      setEditingTranslation(null);
      fetchTranslations();
    } catch (error) {
      setError("Failed to update translation.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTranslation = async (id) => {
    try {
      await api.delete(`/saas/translations/${id}`);
      fetchTranslations();
    } catch (error) {
      console.error("Failed to delete translation", error);
      alert("Failed to delete translation.");
    }
  };

  const confirmDelete = (id) => {
    setTranslationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const filteredTranslations = translations.filter(t => 
    t.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Translations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage dynamic content and localization keys.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Translation
        </button>
      </div>

      <div className="bg-card border border-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by key, value, or group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border text-foreground rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground text-sm shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mr-2">Locale:</span>
            <div className="flex bg-muted border border-border rounded-xl p-1">
              {locales.map(l => (
                <button
                  key={l.code}
                  onClick={() => setSelectedLocale(l.code)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedLocale === l.code 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-max min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
              <th className="p-4 font-bold w-1/4">Group / Key</th>
              <th className="p-4 font-bold">Value ({selectedLocale.toUpperCase()})</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                  <p className="font-medium uppercase tracking-widest text-[10px]">Loading translations...</p>
                </td>
              </tr>
            ) : filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-12 text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-10" />
                  <p className="font-medium">No translations found for this search or locale.</p>
                </td>
              </tr>
             ) : (
              filteredTranslations.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="p-4 align-top">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t.group}</span>
                      <span className="text-foreground font-mono text-xs font-bold">{t.key}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{t.value}</p>
                  </td>
                  <td className="p-4 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingTranslation({...t})}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(t.id)}
                          className="p-2 hover:bg-muted text-muted-foreground hover:text-destructive rounded-lg transition-colors" title="Delete"
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground">Add New Translation Key</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateTranslation} className="space-y-6">
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Locale</label>
                      <select 
                        required
                        className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
                        value={newTranslation.locale}
                        onChange={e => setNewTranslation({...newTranslation, locale: e.target.value})}
                      >
                        {locales.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Group (Category)</label>
                      <input 
                        required
                        placeholder="e.g. auth, common"
                        className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
                        value={newTranslation.group}
                        onChange={e => setNewTranslation({...newTranslation, group: e.target.value.toLowerCase()})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Key Name</label>
                    <input 
                      required
                      placeholder="e.g. login_title, welcome_message"
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground font-mono text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                      value={newTranslation.key}
                      onChange={e => setNewTranslation({...newTranslation, key: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Content (Value)</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter the translated content..."
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                      value={newTranslation.value}
                      onChange={e => setNewTranslation({...newTranslation, value: e.target.value})}
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
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Translation
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTranslation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditingTranslation(null)} />
          <div className="relative bg-card border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">Edit Translation</h3>
                <p className="text-xs text-muted-foreground mt-1 uppercase font-black tracking-widest">{editingTranslation.group} / {editingTranslation.key}</p>
              </div>
              <button onClick={() => setEditingTranslation(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateTranslation} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Content ({editingTranslation.locale.toUpperCase()})</label>
                <textarea 
                  required
                  autoFocus
                  rows={6}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none transition-all shadow-sm"
                  value={editingTranslation.value}
                  onChange={e => setEditingTranslation({...editingTranslation, value: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTranslation(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTranslation(translationToDelete)}
        title="Delete Translation Key?"
        message="This will permanently delete this translation key for the selected locale. If this key is used in the frontend, it will show the raw key name instead of the translated value."
        confirmText="Delete Key"
        type="danger"
      />
    </div>
  );
}

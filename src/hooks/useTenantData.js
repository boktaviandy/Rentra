import { useState, useCallback } from 'react';
import initialTenantData from '../data/tenant.json';

const STORAGE_KEY = 'rentra_tenants_v1';

function loadTenants() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load tenants', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTenantData));
  return initialTenantData;
}

function saveTenants(tenants) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
  } catch (e) {
    console.error('Failed to save tenants', e);
  }
}

export function useTenantData() {
  const [tenants, setTenants] = useState(() => loadTenants());

  const addTenant = useCallback((tenantData) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + (tenantData.durasiHari || 14)); // default trial 14 hari

    const newTenant = {
      id: `TNT-${String(Date.now()).slice(-6)}`,   // unique ID berbasis timestamp
      namaRental: tenantData.namaRental,
      namaOwner: tenantData.namaOwner,
      email: tenantData.email || `${tenantData.namaRental.toLowerCase().replace(/[^a-z0-9]/g, '')}@rental.com`,
      noHp: tenantData.noHp || tenantData.wa || '081234567890',
      kota: tenantData.kota || 'Jakarta',
      paket: tenantData.paket || 'Trial',
      status: tenantData.status || 'Trial',
      tglBergabung: todayStr,
      tglExpired: expDate.toISOString().slice(0, 10),
      // ⬇ spread sisanya: passwordSementara, leadId, dll.
      ...tenantData,
    };


    setTenants((prev) => {
      const updated = [newTenant, ...prev];
      saveTenants(updated);
      return updated;
    });

    return newTenant;
  }, [tenants.length]);

  const updateStatus = useCallback((id, newStatus) => {
    setTenants((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
      saveTenants(updated);
      return updated;
    });
  }, []);

  const extendSubscription = useCallback((id, days = 365) => {
    setTenants((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const currentExp = new Date(t.tglExpired > new Date().toISOString().slice(0, 10) ? t.tglExpired : new Date());
          currentExp.setDate(currentExp.getDate() + days);
          return {
            ...t,
            status: 'Aktif',
            tglExpired: currentExp.toISOString().slice(0, 10),
          };
        }
        return t;
      });
      saveTenants(updated);
      return updated;
    });
  }, []);

  const deleteTenant = useCallback((id) => {
    setTenants((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTenants(updated);
      return updated;
    });
  }, []);

  const updatePaket = useCallback((id, newPaket) => {
    setTenants((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, paket: newPaket } : t));
      saveTenants(updated);
      return updated;
    });
  }, []);

  const updateTenant = useCallback((id, fields) => {
    setTenants((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...fields } : t));
      saveTenants(updated);
      return updated;
    });
  }, []);

  return {
    tenants,
    addTenant,
    updateStatus,
    updatePaket,
    updateTenant,
    extendSubscription,
    deleteTenant,
  };
}

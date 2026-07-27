import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

// Mock initial data files for Demo tenant TNT-001
import initialMobilData from '../data/mobil.json';
import initialBookingData from '../data/booking.json';
import initialCustomerData from '../data/customer.json';
import initialDriverData from '../data/driver.json';
import initialPemasukanData from '../data/pemasukan.json';
import initialPengeluaranData from '../data/pengeluaran.json';
import initialAuditLogData from '../data/auditLog.json';

const SEED_MAP = {
  mobil: initialMobilData,
  booking: initialBookingData,
  customer: initialCustomerData,
  driver: initialDriverData,
  pemasukan: initialPemasukanData,
  pengeluaran: initialPengeluaranData,
  auditlog: initialAuditLogData,
};

function getTenantStorageKey(tenantId, entityKey) {
  return `rentra_data_${tenantId || 'TNT-001'}_${entityKey}`;
}

function loadTenantData(tenantId, entityKey) {
  const storageKey = getTenantStorageKey(tenantId, entityKey);
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to load ${entityKey} for tenant ${tenantId}`, e);
  }

  // Demo tenant (TNT-001) gets dummy seed data
  if (tenantId === 'TNT-001' || !tenantId) {
    const seed = SEED_MAP[entityKey] || [];
    localStorage.setItem(storageKey, JSON.stringify(seed));
    return seed;
  }

  // New Tenants get clean EMPTY data []
  localStorage.setItem(storageKey, JSON.stringify([]));
  return [];
}

export function useTenantStore(entityKey) {
  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id || 'TNT-001';

  const [data, setData] = useState(() => loadTenantData(tenantId, entityKey));

  // Reload data when active tenant changes
  useEffect(() => {
    setData(loadTenantData(tenantId, entityKey));
  }, [tenantId, entityKey]);

  const saveData = useCallback(
    (newData) => {
      const storageKey = getTenantStorageKey(tenantId, entityKey);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newData));
      } catch (e) {
        console.error(`Failed to save ${entityKey}`, e);
      }
      setData(newData);
    },
    [tenantId, entityKey]
  );

  const addItem = useCallback(
    (item) => {
      saveData([item, ...data]);
    },
    [data, saveData]
  );

  const updateItem = useCallback(
    (id, updatedFields) => {
      const updated = data.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
      saveData(updated);
    },
    [data, saveData]
  );

  const deleteItem = useCallback(
    (id) => {
      const updated = data.filter((d) => d.id !== id);
      saveData(updated);
    },
    [data, saveData]
  );

  return {
    data,
    setData: saveData,
    addItem,
    updateItem,
    deleteItem,
  };
}

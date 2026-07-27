import { useState, useEffect, useCallback } from 'react';

const TENANT_STORAGE_KEY = 'rentra_tenants_v1';
const CURRENT_TENANT_KEY = 'rentra_current_tenant';

const DEFAULT_TENANT = {
  id: 'TNT-001',
  namaRental: 'Garuda Rent Car',
  namaOwner: 'Budi Pratama',
  email: 'owner@garudarent.com',
  noHp: '081299001122',
  kota: 'Jakarta',
  paket: 'Pro',
  status: 'Aktif',
  tglBergabung: '2025-11-10',
  tglExpired: '2026-11-10',
};

function getStoredCurrentTenant() {
  try {
    const saved = localStorage.getItem(CURRENT_TENANT_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse current tenant', e);
  }
  return DEFAULT_TENANT;
}

export function useAuth() {
  const [currentTenant, setCurrentTenant] = useState(() => getStoredCurrentTenant());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentTenant(getStoredCurrentTenant());
    };

    window.addEventListener('rentra_auth_change', handleAuthChange);
    return () => window.removeEventListener('rentra_auth_change', handleAuthChange);
  }, []);

  const loginTenant = useCallback((tenantOrEmail) => {
    let targetTenant = null;

    if (typeof tenantOrEmail === 'object' && tenantOrEmail !== null) {
      targetTenant = tenantOrEmail;
    } else {
      // Find in localStorage tenants
      try {
        const rawTenants = localStorage.getItem(TENANT_STORAGE_KEY);
        const tenants = rawTenants ? JSON.parse(rawTenants) : [];
        targetTenant = tenants.find(
          (t) => t.email?.toLowerCase() === String(tenantOrEmail).toLowerCase()
        );
      } catch (e) {
        console.error('Failed finding tenant', e);
      }
    }

    if (!targetTenant) {
      targetTenant = DEFAULT_TENANT;
    }

    localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(targetTenant));
    setCurrentTenant(targetTenant);
    window.dispatchEvent(new Event('rentra_auth_change'));
    return targetTenant;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_TENANT_KEY);
    setCurrentTenant(DEFAULT_TENANT);
    window.dispatchEvent(new Event('rentra_auth_change'));
  }, []);

  return {
    currentTenant,
    loginTenant,
    logout,
  };
}

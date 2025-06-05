"use client";
import { useState, useEffect } from 'react';
import { getUserAccounts } from '@/actions/dashboard';

export function useAccounts() {
  const [accounts, setAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const data = await getUserAccounts();
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError(err.message || "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return { accounts, loading, error };
}
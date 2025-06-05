"use client";
import { useState, useEffect } from 'react';
import { getDashBoardData } from '@/actions/dashboard';

export function useTransactions() {
  const [transactions, setTransactions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getDashBoardData();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return { transactions, loading, error };
}
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateProposal, listProposals, getProposalByCode } from '@/api/proposalApi';
import useAppStore from '@/store/appStore';

export function useProposalGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const setLastProposal       = useAppStore((s) => s.setLastProposal);

  const generate = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateProposal(payload);
      setResult(res.data);
      setLastProposal(res.data);
      toast.success(`Proposal ${res.data.proposalCode} generated!`);
      return res.data;
    } catch (err) {
      const msg = err.message || 'Failed to generate proposal';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [setLastProposal]);

  return { generate, loading, result, error, setResult };
}

export function useProposalList() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await listProposals(p);
      setData(res.data);
      setPage(p);
    } catch {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, page, fetch };
}

export function useProposalDetail(proposalCode) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetch = useCallback(async () => {
    if (!proposalCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getProposalByCode(proposalCode);
      setProposal(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [proposalCode]);

  return { proposal, loading, error, fetch };
}

import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Last generated results (for quick access without re-fetching)
  lastCategoryResult: null,
  lastProposal: null,

  // Simple stats shown on Dashboard (fetched once)
  dashStats: null,

  setLastCategoryResult: (result) => set({ lastCategoryResult: result }),
  setLastProposal: (proposal) => set({ lastProposal: proposal }),
  setDashStats: (stats) => set({ dashStats: stats }),
}));

export default useAppStore;

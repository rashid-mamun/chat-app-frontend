import { create } from 'zustand';

let toastId = 0;

const useUiStore = create((set, get) => ({
  // ── Theme ──────────────────────────────────────────────
  theme: localStorage.getItem('theme') || 'dark',

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    set({ theme: next });
  },

  // ── Sidebar & Panels ───────────────────────────────────
  isSidebarOpen: true,
  isInfoPanelOpen: false,

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openSidebar:   () => set({ isSidebarOpen: true }),
  closeSidebar:  () => set({ isSidebarOpen: false }),

  toggleInfoPanel:  () => set((s) => ({ isInfoPanelOpen: !s.isInfoPanelOpen })),
  openInfoPanel:    () => set({ isInfoPanelOpen: true }),
  closeInfoPanel:   () => set({ isInfoPanelOpen: false }),

  // ── Modals ─────────────────────────────────────────────
  activeModal: null,   // 'createGroup' | 'addMember' | 'profile' | 'search' | null
  modalData: null,     // extra data passed to the modal

  openModal:  (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // ── Toasts ─────────────────────────────────────────────
  toasts: [],

  /**
   * Add a toast notification.
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} message
   * @param {number} duration  ms before auto-dismiss (default 4000)
   */
  addToast: (type, message, duration = 4000) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));

export default useUiStore;

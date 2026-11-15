import { create } from 'zustand'
import { DEFAULT_TYPE_ID } from '@/lib/chestTypes'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface UiState {
  selectedTypeId: string
  setSelectedTypeId: (typeId: string) => void
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void
  toast: Toast | null
  showToast: (kind: ToastKind, message: string) => void
  clearToast: () => void
}

let toastCounter = 0

export const useUiStore = create<UiState>()((set) => ({
  selectedTypeId: DEFAULT_TYPE_ID,
  setSelectedTypeId: (typeId) => {
    set({ selectedTypeId: typeId })
  },
  saveStatus: 'idle',
  setSaveStatus: (status) => {
    set({ saveStatus: status })
  },
  toast: null,
  showToast: (kind, message) => {
    toastCounter += 1
    set({ toast: { id: toastCounter, kind, message } })
  },
  clearToast: () => {
    set({ toast: null })
  },
}))

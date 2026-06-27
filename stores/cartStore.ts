import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  id: string
  projectId: string
  title: string
  amount: number
  frequency: 'once' | 'monthly'
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateAmount: (id: string, amount: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = `${item.projectId}-${Date.now()}`
        set((state) => ({ items: [...state.items, { ...item, id }] }))
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateAmount: (id, amount) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, amount } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.length,
      getTotalAmount: () => get().items.reduce((sum, i) => sum + i.amount, 0),
    }),
    { name: 'donation-cart' }
  )
)

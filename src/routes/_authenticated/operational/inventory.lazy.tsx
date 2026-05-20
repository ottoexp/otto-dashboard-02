import { createLazyFileRoute } from '@tanstack/react-router'
import { InventoryTypePage } from '@/features/inventory/inventory-type-page'

export const Route = createLazyFileRoute('/_authenticated/operational/inventory')({
  component: () => <InventoryTypePage type='' title='Inventory' />,
})

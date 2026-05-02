import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inventory/admin/')({
  component: InventoryAdmin,
})

function InventoryAdmin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p className="text-muted-foreground mb-6">Inventory Admin page content</p>
      <Button variant="outline" asChild>
        <Link to="/inventory/rept">← Back: Report</Link>
      </Button>
    </div>
  )
}

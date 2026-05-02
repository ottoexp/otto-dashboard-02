import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inventory/rept/')({
  component: InventoryReport,
})

function InventoryReport() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report</h1>
      <p className="text-muted-foreground mb-6">Inventory Report page content</p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/inventory/prog">← Back: Progress</Link>
        </Button>
        <Button asChild>
          <Link to="/inventory/admin">Next: Admin →</Link>
        </Button>
      </div>
    </div>
  )
}

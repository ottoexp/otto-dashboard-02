import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inventory/prog/')({
  component: InventoryProgress,
})

function InventoryProgress() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Progress</h1>
      <p className="text-muted-foreground mb-6">Inventory Progress page content</p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/inventory/appr">← Back: Approval</Link>
        </Button>
        <Button asChild>
          <Link to="/inventory/rept">Next: Report →</Link>
        </Button>
      </div>
    </div>
  )
}

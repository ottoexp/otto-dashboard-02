import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inventory/appr/')({
  component: InventoryApproval,
})

function InventoryApproval() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Approval</h1>
      <p className="text-muted-foreground mb-6">Inventory Approval page content</p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/inventory/req">← Back: Request</Link>
        </Button>
        <Button asChild>
          <Link to="/inventory/prog">Next: Progress →</Link>
        </Button>
      </div>
    </div>
  )
}

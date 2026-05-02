import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/inventory/req/')({
  component: InventoryRequest,
})

function InventoryRequest() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Request</h1>
      <p className="text-muted-foreground mb-6">Inventory Request page content</p>
      <Button asChild>
        <Link to="/inventory/appr">Next: Approval →</Link>
      </Button>
    </div>
  )
}

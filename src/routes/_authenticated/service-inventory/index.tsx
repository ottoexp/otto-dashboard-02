import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, AlertTriangle, DollarSign } from 'lucide-react'
import { getServicesWithInventory, getStockAlerts } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/service-inventory/')({
  component: ServiceInventoryPage,
})

function ServiceInventoryPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services-with-inventory'],
    queryFn: getServicesWithInventory
  })

  const { data: alerts } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: getStockAlerts,
    refetchInterval: 60000
  })

  const totalInventoryCost = services?.reduce((sum, service) => sum + (service.totalInventoryCost || 0), 0) || 0

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Service Inventory Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Total Cost: Rp {totalInventoryCost.toLocaleString()}</span>
          </div>
          {alerts && alerts.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {alerts.length} Stock Alerts
            </Badge>
          )}
        </div>
      </div>

      {alerts && alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-2">
                <span>{alert.inventoryName} ({alert.inventoryCode})</span>
                <span className="font-semibold">{alert.currentStock} units</span>
                <span>- Below threshold of {alert.minStock}</span>
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Inventory Items</TableHead>
            <TableHead>Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services?.map((service) => (
            <TableRow key={service.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">{service.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {service.inventoryItems?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span>{item.inventoryName}</span>
                      <Badge variant="outline">{item.quantity}x</Badge>
                      <span className="text-gray-500">(@ Rp {item.cost.toLocaleString()})</span>
                    </div>
                  ))}
                  {(!service.inventoryItems || service.inventoryItems.length === 0) && (
                    <span className="text-sm text-gray-500">No inventory items</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Rp {(service.totalInventoryCost || 0).toLocaleString()}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
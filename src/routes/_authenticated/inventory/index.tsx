import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getInventory, createInventory, updateInventory, deleteInventory, type Inventory, type CreateInventoryPayload, type UpdateInventoryPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'
import { useLocation } from '@tanstack/react-router'


export const Route = createFileRoute('/_authenticated/inventory/')({
  component: InventoryPage,
})

function InventoryPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Inventory | null>(null)
  const [formData, setFormData] = useState<CreateInventoryPayload>({
    code: '',
    name: '',
    category: '',
    stock: 0,
    buyPrice: 0,
    sellPrice: 0,
    status: 'active'
  })

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: getInventory
  })

  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/inventory',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInventoryPayload }) =>
      updateInventory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setOpenModal(false)
      resetForm()
      setEditingItem(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/inventory',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/inventory',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({ code: '', name: '', category: '', stock: 0, buyPrice: 0, sellPrice: 0, status: 'active' })
  }

  const handleEdit = (item: Inventory) => {
    setEditingItem(item)
    setFormData({
      code: item.code || '',
      name: item.name || '',
      category: item.category || '',
      stock: item.stock || 0,
      buyPrice: item.buyPrice || 0,
      sellPrice: item.sellPrice || 0,
      status: item.status || 'active'
    })
    setOpenModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const subPages = [
    { name: 'Request', path: '/inventory/req' },
    { name: 'Approval', path: '/inventory/appr' },
    { name: 'Progress', path: '/inventory/prog' },
    { name: 'Report', path: '/inventory/rept' },
    { name: 'Admin', path: '/inventory/admin' },
  ]

  const isSubPage = subPages.some(page => location.pathname === page.path)

  if (isSubPage) {
    return null
  }

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2 mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Daftar Barang Inventory</h2>
          <p className='text-muted-foreground'>
            Kelola data barang dan stok bengkel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={openModal} onOpenChange={(open) => {
            setOpenModal(open)
            if (!open) {
              resetForm()
              setEditingItem(null)
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Barang
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Barang</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Barang</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyPrice">Harga Beli</Label>
                    <Input
                      id="buyPrice"
                      type="number"
                      value={formData.buyPrice}
                      onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellPrice">Harga Jual</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => {
                    setOpenModal(false)
                    resetForm()
                    setEditingItem(null)
                  }}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Barang</TableHead>
            <TableHead>Nama Barang</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Harga Beli</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
         <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : !inventory || inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada data barang
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item: Inventory) => (
                <TableRow key={item.id}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>Rp {item.buyPrice?.toLocaleString() || 0}</TableCell>
                  <TableCell>Rp {item.sellPrice?.toLocaleString() || 0}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
      </Table>
  </>
  )
}
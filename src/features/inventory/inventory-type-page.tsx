import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getInventory, createInventory, updateInventory, deleteInventory, type Inventory, type CreateInventoryPayload } from '@/lib/api'

interface Props {
  type: 'material' | 'tools'
  title: string
}

export function InventoryTypePage({ type, title }: Props) {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Inventory | null>(null)
  const [formData, setFormData] = useState<CreateInventoryPayload>({
    code: '',
    name: '',
    category: type,
    stock: 0,
    buyPrice: 0,
    sellPrice: 0,
    status: 'active',
  })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory', type],
    queryFn: () => getInventory(type),
  })

  const createMutation = useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', type] })
      setOpenModal(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateInventory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', type] })
      setOpenModal(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory', type] }),
  })

  const resetForm = () => {
    setFormData({ code: '', name: '', category: type, stock: 0, buyPrice: 0, sellPrice: 0, status: 'active' })
    setEditingItem(null)
  }

  const handleEdit = (item: Inventory) => {
    setEditingItem(item)
    setFormData({
      code: item.code || '',
      name: item.name || '',
      category: type,
      stock: item.stock || 0,
      buyPrice: item.buyPrice || 0,
      sellPrice: item.sellPrice || 0,
      status: item.status || 'active',
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

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div className='flex items-end justify-between gap-2 mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
          <p className='text-muted-foreground'>Kelola data {title.toLowerCase()} bengkel.</p>
        </div>
        <Dialog open={openModal} onOpenChange={(open) => { setOpenModal(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className='mr-2 h-4 w-4' />
              Tambah {title}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? `Edit ${title}` : `Tambah ${title} Baru`}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
              <div className='space-y-2'>
                <Label>Kode</Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className='space-y-2'>
                <Label>Nama</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Stok</Label>
                  <Input type='number' value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required />
                </div>
                <div className='space-y-2'>
                  <Label>Harga Beli</Label>
                  <Input type='number' value={formData.buyPrice} onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Harga Jual</Label>
                <Input type='number' value={formData.sellPrice} onChange={(e) => setFormData({ ...formData, sellPrice: parseInt(e.target.value) || 0 })} />
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <Button type='button' variant='secondary' onClick={() => { setOpenModal(false); resetForm() }}>Batal</Button>
                <Button type='submit' disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Harga Beli</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-20'>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>Memuat data...</TableCell></TableRow>
          ) : items.length === 0 ? (
            <TableRow><TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>Belum ada data {title.toLowerCase()}</TableCell></TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className='font-mono text-sm'>{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>Rp {item.buyPrice?.toLocaleString() || 0}</TableCell>
                <TableCell>Rp {item.sellPrice?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    <Button size='icon' variant='ghost' className='h-8 w-8' onClick={() => handleEdit(item)}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button size='icon' variant='ghost' className='h-8 w-8 text-red-500' onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending}>
                      <Trash2 className='h-4 w-4' />
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

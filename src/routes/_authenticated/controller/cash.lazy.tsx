import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getCash, createCash, updateCash, deleteCash, type Cash, type CreateCashPayload, type UpdateCashPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'

export const Route = createLazyFileRoute('/_authenticated/controller/cash')({
  component: CashPage,
})

function CashPage() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Cash | null>(null)
  const [formData, setFormData] = useState<CreateCashPayload>({
    transactionType: 'in',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    status: 'active'
  })

  const { data: cash, isLoading } = useQuery({
    queryKey: ['cash'],
    queryFn: getCash
  })

  const createMutation = useMutation({
    mutationFn: createCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/cash',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCashPayload }) =>
      updateCash(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
      setOpenModal(false)
      resetForm()
      setEditingItem(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/cash',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/cash',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({
      transactionType: 'in',
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      status: 'active'
    })
  }

  const handleEdit = (item: Cash) => {
    setEditingItem(item)
    setFormData({
      transactionType: item.transactionType || 'in',
      category: item.category || '',
      amount: item.amount || 0,
      description: item.description || '',
      date: item.date || new Date().toISOString().split('T')[0],
      reference: item.reference || '',
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

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2 mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Daftar Kas</h2>
          <p className='text-muted-foreground'>
            Kelola transaksi kas masuk dan keluar.
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
                Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Tipe Transaksi</Label>
                  <Select value={formData.transactionType} onValueChange={(value: any) => setFormData({ ...formData, transactionType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Masuk</SelectItem>
                      <SelectItem value="out">Keluar</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="space-y-2">
                  <Label htmlFor="amount">Jumlah</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referensi</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
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
            <TableHead>Tipe</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Referensi</TableHead>
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
          ) : !cash || cash.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Belum ada data kas
              </TableCell>
            </TableRow>
          ) : (
            cash.map((item: Cash) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.transactionType === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.transactionType === 'in' ? 'Masuk' : 'Keluar'}
                  </span>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>Rp {item.amount?.toLocaleString() || 0}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.reference}</TableCell>
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
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getLedger, createLedger, updateLedger, deleteLedger, type Ledger, type CreateLedgerPayload, type UpdateLedgerPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'

export const Route = createLazyFileRoute('/_authenticated/controller/ledger')({
  component: LedgerPage,
})

function LedgerPage() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Ledger | null>(null)
  const [formData, setFormData] = useState<CreateLedgerPayload>({
    accountCode: '',
    accountName: '',
    debit: 0,
    credit: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    status: 'active'
  })

  const { data: ledger, isLoading } = useQuery({
    queryKey: ['ledger'],
    queryFn: getLedger
  })

  const createMutation = useMutation({
    mutationFn: createLedger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/ledger',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLedgerPayload }) =>
      updateLedger(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
      setOpenModal(false)
      resetForm()
      setEditingItem(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/ledger',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLedger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/ledger',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({
      accountCode: '',
      accountName: '',
      debit: 0,
      credit: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      status: 'active'
    })
  }

  const handleEdit = (item: Ledger) => {
    setEditingItem(item)
    setFormData({
      accountCode: item.accountCode || '',
      accountName: item.accountName || '',
      debit: item.debit || 0,
      credit: item.credit || 0,
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
          <h2 className='text-2xl font-bold tracking-tight'>Buku Besar</h2>
          <p className='text-muted-foreground'>
            Kelola transaksi buku besar.
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountCode">Kode Akun</Label>
                    <Input
                      id="accountCode"
                      value={formData.accountCode}
                      onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nama Akun</Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debit">Debit</Label>
                    <Input
                      id="debit"
                      type="number"
                      value={formData.debit}
                      onChange={(e) => setFormData({ ...formData, debit: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit">Kredit</Label>
                    <Input
                      id="credit"
                      type="number"
                      value={formData.credit}
                      onChange={(e) => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
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
            <TableHead>Kode Akun</TableHead>
            <TableHead>Nama Akun</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Kredit</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : !ledger || ledger.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Belum ada data buku besar
              </TableCell>
            </TableRow>
          ) : (
            ledger.map((item: Ledger) => (
              <TableRow key={item.id}>
                <TableCell>{item.accountCode}</TableCell>
                <TableCell>{item.accountName}</TableCell>
                <TableCell className="text-green-600">Rp {item.debit?.toLocaleString() || 0}</TableCell>
                <TableCell className="text-red-600">Rp {item.credit?.toLocaleString() || 0}</TableCell>
                <TableCell className="font-semibold">Rp {item.balance?.toLocaleString() || 0}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.date}</TableCell>
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
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getServices, createService, deleteService, type Service, type CreateServicePayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'

export const Route = createLazyFileRoute('/_authenticated/operational/service')({
  component: ServicePage,
})

function ServicePage() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Service | null>(null)
  const [formData, setFormData] = useState<CreateServicePayload>({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    status: 'active'
  })

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: getServices
  })

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/services',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/services',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      status: 'active'
    })
  }

  const handleEdit = (item: Service) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || 0,
      duration: item.duration || 60,
      status: item.status || 'active'
    })
    setOpenModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      // Note: UpdateService not available in api.ts, only create/delete
      deleteMutation.mutate(editingItem.id)
      createMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2 mb-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Daftar Layanan</h2>
          <p className='text-muted-foreground'>
            Kelola layanan jasa bengkel.
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
                Tambah Layanan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Layanan</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durasi (menit)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => {
                    setOpenModal(false)
                    resetForm()
                    setEditingItem(null)
                  }}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
            <TableHead>Nama Layanan</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Durasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : !services || services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Belum ada data layanan
              </TableCell>
            </TableRow>
          ) : (
            services.map((item: Service) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>Rp {item.price?.toLocaleString() || 0}</TableCell>
                <TableCell>{item.duration} menit</TableCell>
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
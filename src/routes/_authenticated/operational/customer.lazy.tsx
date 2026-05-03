import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, type Customer, type CreateCustomerPayload, type UpdateCustomerPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'

export const Route = createLazyFileRoute('/_authenticated/operational/customer')({
  component: CustomersPage,
})

function CustomersPage() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateCustomerPayload>({
    name: '',
    phone: '',
    vehicle: '',
    plateNumber: '',
    status: 'active'
  })

  useEffect(() => {
    if (!auth.accessToken) {
      navigate({ to: '/sign-in', search: { redirect: '/operational/customer' } })
      return
    }

    api.get<{ resource: string; action: string }[]>('/me/permissions')
      .then(response => {
        const permissions = response.data
        const hasPermission = permissions?.some(
          (p) => p.resource === 'customers' && p.action === 'read'
        )
        if (!hasPermission) {
          navigate({ to: '/403' })
        }
      })
      .catch(() => {
        navigate({ to: '/403' })
      })
  }, [auth.accessToken, navigate])

  const { data: response, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  })
  
  const customers = response?.data || []

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setOpenModal(false)
      setFormData({ name: '', phone: '', vehicle: '', plateNumber: '', status: 'active' })
      setEditingId(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/customers',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: UpdateCustomerPayload }) => 
      updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setOpenModal(false)
      setFormData({ name: '', phone: '', vehicle: '', plateNumber: '', status: 'active' })
      setEditingId(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/customers',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/customers',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      vehicle: customer.vehicle,
      plateNumber: customer.plateNumber,
      status: customer.status
    })
    setOpenModal(true)
  }

  const handleAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      phone: '',
      vehicle: '',
      plateNumber: '',
      status: 'active'
    })
    setOpenModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Daftar Pelanggan</h2>
            <p className='text-muted-foreground'>
              Kelola data pelanggan bengkel.
            </p>
          </div>
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button onClick={() => handleAdd()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Pelanggan</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor HP</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Kendaraan</Label>
                  <Input
                    id="vehicle"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">Plat Nomor</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setOpenModal(false)}>
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>No HP</TableHead>
              <TableHead>Kendaraan</TableHead>
              <TableHead>Plat Nomor</TableHead>
              <TableHead>Total Order</TableHead>
              <TableHead>Terakhir Datang</TableHead>
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
               ) : !customers || customers.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                     Belum ada data pelanggan
                   </TableCell>
                 </TableRow>
               ) : (
                 customers.map((customer: Customer) => (
                   <TableRow key={customer.id}>
                     <TableCell>{customer.name}</TableCell>
                     <TableCell>{customer.phone}</TableCell>
                     <TableCell>{customer.vehicle}</TableCell>
                     <TableCell>{customer.plateNumber}</TableCell>
                     <TableCell>{customer.totalOrders}</TableCell>
                     <TableCell>{customer.lastVisit || '-'}</TableCell>
                     <TableCell>{customer.status}</TableCell>
                     <TableCell>
                       <div className="flex gap-1">
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8"
                           onClick={() => handleEdit(customer)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           size="icon"
                           variant="ghost"
                           className="h-8 w-8 text-red-500"
                           onClick={() => deleteMutation.mutate(customer.id)}
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

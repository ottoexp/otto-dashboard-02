import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getPeople, createPeople, updatePeople, deletePeople, type People, type CreatePeoplePayload, type UpdatePeoplePayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'

export const Route = createLazyFileRoute('/_authenticated/operational/people')({
  component: PeoplePage,
})

function PeoplePage() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<People | null>(null)
  const [formData, setFormData] = useState<CreatePeoplePayload>({
    fullName: '',
    phone: '',
    email: '',
    role: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active'
  })

  useEffect(() => {
    if (!auth.accessToken) {
      navigate({ to: '/sign-in', search: { redirect: '/operational/people' } })
      return
    }

    api.get<{ resource: string; action: string }[]>('/me/permissions')
      .then(response => {
        console.log('Permissions response:', response.data)
        const permissions = response.data
        const hasPermission = permissions?.some(
          (p) => p.resource === 'team' && p.action === 'read'
        )
        console.log('Has team:read permission:', hasPermission)
        if (!hasPermission) {
          navigate({ to: '/403' })
        }
      })
      .catch((error) => {
        console.error('Permissions error:', error)
        navigate({ to: '/403' })
      })
  }, [auth.accessToken, navigate])

  const { data: people, isLoading } = useQuery({
    queryKey: ['people'],
    queryFn: getPeople
  })

  const createMutation = useMutation({
    mutationFn: createPeople,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/people',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePeoplePayload }) =>
      updatePeople(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      setOpenModal(false)
      resetForm()
      setEditingItem(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/people',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePeople,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/people',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      role: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    })
  }

  const handleEdit = (item: People) => {
    setEditingItem(item)
    setFormData({
      fullName: item.fullName || '',
      phone: item.phone || '',
      email: item.email || '',
      role: item.role || '',
      department: item.department || '',
      joinDate: item.joinDate || new Date().toISOString().split('T')[0],
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
          <h2 className='text-2xl font-bold tracking-tight'>Daftar Personnel</h2>
          <p className='text-muted-foreground'>
            Kelola data karyawan dan personnel.
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
                Tambah Personnel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Personnel' : 'Tambah Personnel Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departemen</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">Tanggal Bergabung</Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      required
                    />
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
                        <SelectItem value="resigned">Resigned</SelectItem>
                      </SelectContent>
                    </Select>
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
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Departemen</TableHead>
            <TableHead>Tanggal Bergabung</TableHead>
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
          ) : !people || people.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Belum ada data personnel
              </TableCell>
            </TableRow>
          ) : (
            people.map((item: People) => (
              <TableRow key={item.id}>
                <TableCell>{item.fullName}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.joinDate}</TableCell>
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
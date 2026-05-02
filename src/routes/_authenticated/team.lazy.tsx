import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { getTeam, createTeam, deleteTeam, updateTeam, type Team, type CreateTeamPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'


export const Route = createLazyFileRoute('/_authenticated/team')({
  component: TeamPage,
})

function TeamPage() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Team | null>(null)
  const [formData, setFormData] = useState<CreateTeamPayload>({
    full_name: '',
    phone: '',
    position: '',
    base_salary: 0,
    status: 'active'
  })

  const { data: teamData, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: getTeam
  })

  const team = teamData?.data || []

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
      setOpenModal(false)
      setFormData({ full_name: '', phone: '', position: '', base_salary: 0, status: 'active' })
    },
    onError: (error: any) => {
      logError({
        endpoint: '/team',
        error: error.message || 'Failed to create team member',
        stack: error.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateTeamPayload }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
      setEditModal(false)
      setSelectedMember(null)
      setFormData({ full_name: '', phone: '', position: '', base_salary: 0, status: 'active' })
    },
    onError: (error: any) => {
      logError({
        endpoint: `/team/${selectedMember?.id}`,
        error: error.message || 'Failed to update team member',
        stack: error.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
    onError: (error: any) => {
      logError({
        endpoint: '/team',
        error: error.message || 'Failed to delete team member',
        stack: error.stack
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleEdit = (member: Team) => {
    setSelectedMember(member)
    setFormData({
      full_name: member.full_name,
      phone: member.phone,
      position: member.position,
      base_salary: member.base_salary,
      status: member.status
    })
    setEditModal(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMember) {
      updateMutation.mutate({ id: selectedMember.id, data: formData })
    }
  }

  return (
    <>
      <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Daftar Karyawan</h2>
            <p className='text-muted-foreground'>
              Kelola data tim dan karyawan bengkel.
            </p>
          </div>
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Tambah Karyawan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Karyawan Baru</DialogTitle>
              </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                 <div className="space-y-2">
                   <Label htmlFor="full_name">Nama Lengkap</Label>
                   <Input
                     id="full_name"
                     value={formData.full_name}
                     onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                   <Label htmlFor="position">Jabatan</Label>
                   <Input
                     id="position"
                     value={formData.position}
                     onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="base_salary">Gaji</Label>
                   <Input
                     id="base_salary"
                     type="number"
                     value={formData.base_salary}
                     onChange={(e) => setFormData({ ...formData, base_salary: parseInt(e.target.value) || 0 })}
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

          <Dialog open={editModal} onOpenChange={setEditModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Karyawan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_full_name">Nama Lengkap</Label>
                  <Input
                    id="edit_full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Nomor HP</Label>
                  <Input
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_position">Jabatan</Label>
                  <Input
                    id="edit_position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_base_salary">Gaji</Label>
                  <Input
                    id="edit_base_salary"
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setEditModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
               <TableHead>Jabatan</TableHead>
               <TableHead>Gaji</TableHead>
               <TableHead>Tanggal Masuk</TableHead>
               <TableHead>Status</TableHead>
               <TableHead className="w-24">Aksi</TableHead>
             </TableRow>
           </TableHeader>
            <TableBody>
               {isLoading ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                     Memuat data...
                   </TableCell>
                 </TableRow>
               ) : !team || team.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                     Belum ada data karyawan
                   </TableCell>
                 </TableRow>
               ) : (
                 team.map((member: Team) => (
                   <TableRow key={member.id}>
                     <TableCell>{member.full_name}</TableCell>
                     <TableCell>{member.phone}</TableCell>
                     <TableCell>{member.position}</TableCell>
                     <TableCell>Rp {member.base_salary?.toLocaleString() || 0}</TableCell>
                     <TableCell>{member.join_date || '-'}</TableCell>
                     <TableCell>{member.status}</TableCell>
                     <TableCell>
                       <div className="flex gap-1">
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-8 w-8"
                           onClick={() => handleEdit(member)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           size="icon"
                           variant="ghost"
                           className="h-8 w-8 text-red-500"
                           onClick={() => deleteMutation.mutate(member.id)}
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

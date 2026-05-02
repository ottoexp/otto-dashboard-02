import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { getScheduling, createScheduling, updateScheduling, deleteScheduling, type Scheduling, type CreateSchedulingPayload, type UpdateSchedulingPayload } from '@/lib/api'
import { logError } from '@/lib/error-tracking'

export const Route = createLazyFileRoute('/_authenticated/operational/scheduling')({
  component: SchedulingPage,
})

function SchedulingPage() {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Scheduling | null>(null)
  const [formData, setFormData] = useState<CreateSchedulingPayload>({
    employeeId: '',
    employeeName: '',
    shiftType: 'morning',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
    notes: ''
  })

  const { data: scheduling, isLoading } = useQuery({
    queryKey: ['scheduling'],
    queryFn: getScheduling
  })

  const createMutation = useMutation({
    mutationFn: createScheduling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] })
      setOpenModal(false)
      resetForm()
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/scheduling',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSchedulingPayload }) =>
      updateScheduling(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] })
      setOpenModal(false)
      resetForm()
      setEditingItem(null)
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/scheduling',
        error: err.message,
        stack: err.stack,
        body: formData
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteScheduling,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling'] })
    },
    onError: (err: Error) => {
      logError({
        endpoint: '/scheduling',
        error: err.message,
        stack: err.stack
      })
    }
  })

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      shiftType: 'morning',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '17:00',
      status: 'scheduled',
      notes: ''
    })
  }

  const handleEdit = (item: Scheduling) => {
    setEditingItem(item)
    setFormData({
      employeeId: item.employeeId || '',
      employeeName: item.employeeName || '',
      shiftType: item.shiftType || 'morning',
      date: item.date || new Date().toISOString().split('T')[0],
      startTime: item.startTime || '08:00',
      endTime: item.endTime || '17:00',
      status: item.status || 'scheduled',
      notes: item.notes || ''
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
          <h2 className='text-2xl font-bold tracking-tight'>Jadwal Kerja</h2>
          <p className='text-muted-foreground'>
            Kelola jadwal shift karyawan.
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
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">ID Karyawan</Label>
                    <Input
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Nama Karyawan</Label>
                    <Input
                      id="employeeName"
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shiftType">Tipe Shift</Label>
                    <Select value={formData.shiftType} onValueChange={(value: any) => setFormData({ ...formData, shiftType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Pagi</SelectItem>
                        <SelectItem value="afternoon">Siang</SelectItem>
                        <SelectItem value="night">Malam</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Waktu Mulai</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Waktu Selesai</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
</Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
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
            <TableHead>ID Karyawan</TableHead>
            <TableHead>Nama Karyawan</TableHead>
            <TableHead>Tipe Shift</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Waktu Mulai</TableHead>
            <TableHead>Waktu Selesai</TableHead>
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
          ) : !scheduling || scheduling.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Belum ada data jadwal
              </TableCell>
            </TableRow>
          ) : (
            scheduling.map((item: Scheduling) => (
              <TableRow key={item.id}>
                <TableCell>{item.employeeId}</TableCell>
                <TableCell>{item.employeeName}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.shiftType === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                    item.shiftType === 'afternoon' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {item.shiftType}
                  </span>
                </TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.startTime}</TableCell>
                <TableCell>{item.endTime}</TableCell>
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
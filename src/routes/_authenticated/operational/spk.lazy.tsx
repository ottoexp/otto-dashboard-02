import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getSPK, getSPKDetail, createSPK, updateSPKStatus, addSPKTask, startSPKTask, finishSPKTask, type SPK, type SPKTask } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Clock, ChevronRight, Plus, Play, CheckCircle2, Loader2, User, Phone, Car } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createLazyFileRoute('/_authenticated/operational/spk')({
  component: OrderPage,
})

const COLUMNS: { key: SPK['status']; label: string; color: string; bg: string }[] = [
  { key: 'pending',        label: 'Pending',     color: 'text-gray-600',   bg: 'bg-gray-100' },
  { key: 'in_progress',   label: 'In Progress', color: 'text-blue-600',   bg: 'bg-blue-50' },
  { key: 'waiting_tool',  label: 'Wait Tool',   color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'waiting_part',  label: 'Wait Part',   color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'waiting_survey',label: 'Wait Survey', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'completed',     label: 'Completed',   color: 'text-green-600',  bg: 'bg-green-50' },
]

const DIVISIONS = ['bongkar','dempul','epoxy','cat','poles','pasang'] as const

const TASK_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

// --- Task row component ---
function TaskRow({ task, spkId }: { task: SPKTask; spkId: string }) {
  const queryClient = useQueryClient()
  const startMut = useMutation({
    mutationFn: () => startSPKTask(task.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spk-detail', spkId] }),
  })
  const finishMut = useMutation({
    mutationFn: () => finishSPKTask(task.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spk-detail', spkId] }),
  })

  return (
    <div className='flex items-center gap-3 py-2 border-b last:border-0'>
      <Badge className={cn('capitalize text-xs w-20 justify-center shrink-0', TASK_COLOR[task.status])}>
        {task.divisi}
      </Badge>
      <div className='flex-1 text-xs text-muted-foreground'>
        {task.status === 'pending' && '—'}
        {task.status === 'in_progress' && `Mulai: ${task.started_at ? new Date(task.started_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '—'}`}
        {task.status === 'completed' && `Selesai: ${task.finished_at ? new Date(task.finished_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '—'}`}
        {task.worker_name && ` · ${task.worker_name}`}
      </div>
      {task.status === 'pending' && (
        <Button size='sm' variant='outline' className='h-7 text-xs' onClick={() => startMut.mutate()} disabled={startMut.isPending}>
          <Play size={12} className='mr-1' /> Start
        </Button>
      )}
      {task.status === 'in_progress' && (
        <Button size='sm' className='h-7 text-xs bg-green-500 hover:bg-green-600' onClick={() => finishMut.mutate()} disabled={finishMut.isPending}>
          <CheckCircle2 size={12} className='mr-1' /> Finish
        </Button>
      )}
      {task.status === 'completed' && <CheckCircle2 size={16} className='text-green-500' />}
    </div>
  )
}

// --- Detail sheet ---
function OrderDetail({ spkId }: { spkId: string }) {
  const queryClient = useQueryClient()
  const { data: spk, isLoading } = useQuery({
    queryKey: ['spk-detail', spkId],
    queryFn: () => getSPKDetail(spkId),
  })

  const addTaskMut = useMutation({
    mutationFn: (divisi: string) => addSPKTask(spkId, divisi),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spk-detail', spkId] }),
  })

  const moveMut = useMutation({
    mutationFn: (status: SPK['status']) => updateSPKStatus(spkId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spk'] })
      queryClient.invalidateQueries({ queryKey: ['spk-detail', spkId] })
    },
  })

  if (isLoading) return <div className='p-8 text-center'><Loader2 className='animate-spin mx-auto' /></div>
  if (!spk) return null

  const existingDivisions = (spk.tasks || []).map((t: SPKTask) => t.divisi)
  const availableDivisions = DIVISIONS.filter(d => !existingDivisions.includes(d))
  const currentIdx = COLUMNS.findIndex(c => c.key === spk.status)
  const nextStatus = COLUMNS[currentIdx + 1]

  return (
    <div className='space-y-4 p-1'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-xs text-muted-foreground'>Work Order</p>
          <p className='text-xl font-bold'>{spk.workorder_number}</p>
          <p className='text-sm text-muted-foreground'>{spk.tanggal}</p>
        </div>
        <Badge className={cn('text-xs capitalize', spk.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
          {COLUMNS.find(c => c.key === spk.status)?.label}
        </Badge>
      </div>

      {/* Customer & Unit */}
      <Card>
        <CardContent className='p-3 space-y-1.5'>
          <div className='flex items-center gap-2 text-sm'>
            <User size={14} className='text-muted-foreground' />
            <span className='font-medium'>{spk.customer_name || spk.unit}</span>
          </div>
          {spk.customer_phone && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Phone size={14} />
              <span>{spk.customer_phone}</span>
            </div>
          )}
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Car size={14} />
            <span>{spk.unit}{spk.merek_type ? ` — ${spk.merek_type}` : ''}{spk.unit_plate ? ` · ${spk.unit_plate}` : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tasks / Progress */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-sm font-semibold'>Progress Pekerjaan</p>
          <p className='text-xs text-muted-foreground'>
            {(spk.tasks || []).filter((t: SPKTask) => t.status === 'completed').length}/{(spk.tasks || []).length} selesai
          </p>
        </div>

        {(spk.tasks || []).length === 0 ? (
          <p className='text-xs text-muted-foreground py-2'>Belum ada divisi. Tambahkan di bawah.</p>
        ) : (
          <div>
            {(spk.tasks || []).map((task: SPKTask) => (
              <TaskRow key={task.id} task={task} spkId={spkId} />
            ))}
          </div>
        )}

        {availableDivisions.length > 0 && spk.status !== 'completed' && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {availableDivisions.map(div => (
              <Button
                key={div}
                size='sm' variant='outline' className='h-6 text-xs capitalize'
                onClick={() => addTaskMut.mutate(div)}
                disabled={addTaskMut.isPending}
              >
                <Plus size={10} className='mr-1' />{div}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Move order status */}
      {nextStatus && (
        <Button className='w-full' onClick={() => moveMut.mutate(nextStatus.key)} disabled={moveMut.isPending}>
          <ChevronRight size={14} className='mr-1' /> Pindah ke {nextStatus.label}
        </Button>
      )}
    </div>
  )
}

// --- Create Order Form ---
function CreateOrderDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    workorder_number: `WO-${Date.now()}`,
    tanggal: new Date().toISOString().slice(0, 10),
    customer_name: '',
    customer_phone: '',
    unit: '',
    merek_type: '',
    unit_plate: '',
    divisi: 'bongkar' as const,
    notes: '',
  })

  const createMut = useMutation({
    mutationFn: () => createSPK({
      workorder_number: form.workorder_number,
      tanggal: form.tanggal,
      unit: form.unit || form.customer_name,
      merek_type: form.merek_type || undefined,
      nama: 'c863230c-062f-414a-930d-cd8df73322a2', // admin default
      divisi: form.divisi,
      notes: form.notes || undefined,
    } as any),
    onSuccess: async (spk) => {
      // update customer info via separate patch if needed
      if (form.customer_name) {
        await fetch(`/api/service/spk/${spk.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_name: form.customer_name, customer_phone: form.customer_phone, unit_plate: form.unit_plate }),
        }).catch(() => {})
      }
      queryClient.invalidateQueries({ queryKey: ['spk'] })
      toast.success('Order dibuat')
      onClose()
    },
    onError: () => toast.error('Gagal buat order'),
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Order Baru</DialogTitle>
        </DialogHeader>
        <div className='space-y-3 mt-2'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-xs'>No. Work Order</Label>
              <Input value={form.workorder_number} onChange={e => setForm({...form, workorder_number: e.target.value})} className='h-8' />
            </div>
            <div>
              <Label className='text-xs'>Tanggal</Label>
              <Input type='date' value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className='h-8' />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-xs'>Nama Customer</Label>
              <Input placeholder='John Doe' value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className='h-8' />
            </div>
            <div>
              <Label className='text-xs'>No. HP Customer</Label>
              <Input placeholder='081234...' value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} className='h-8' />
            </div>
          </div>
          <div className='grid grid-cols-3 gap-3'>
            <div>
              <Label className='text-xs'>Unit / Merk</Label>
              <Input placeholder='Toyota' value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className='h-8' />
            </div>
            <div>
              <Label className='text-xs'>Tipe</Label>
              <Input placeholder='Avanza' value={form.merek_type} onChange={e => setForm({...form, merek_type: e.target.value})} className='h-8' />
            </div>
            <div>
              <Label className='text-xs'>Plat</Label>
              <Input placeholder='B 1234 AB' value={form.unit_plate} onChange={e => setForm({...form, unit_plate: e.target.value})} className='h-8' />
            </div>
          </div>
          <div>
            <Label className='text-xs'>Divisi Utama</Label>
            <Select value={form.divisi} onValueChange={(v: any) => setForm({...form, divisi: v})}>
              <SelectTrigger className='h-8'><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIVISIONS.map(d => <SelectItem key={d} value={d} className='capitalize'>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs'>Catatan</Label>
            <Input placeholder='Catatan tambahan...' value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className='h-8' />
          </div>
          <div className='flex justify-end gap-2 pt-1'>
            <Button variant='outline' onClick={onClose}>Batal</Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.unit && !form.customer_name}>
              {createMut.isPending ? <Loader2 className='animate-spin' /> : 'Buat Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- Main Page ---
function OrderPage() {
  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: spkList = [], isLoading } = useQuery({
    queryKey: ['spk'],
    queryFn: () => getSPK(),
  })

  const filtered = filter ? spkList.filter(s => s.divisi === filter) : spkList

  const byStatus = COLUMNS.reduce<Record<string, SPK[]>>((acc, col) => {
    acc[col.key] = filtered.filter(s => s.status === col.key)
    return acc
  }, {})

  return (
    <div className='flex flex-col h-full gap-4'>
      <div className='flex items-center justify-between shrink-0'>
        <div>
          <h2 className='text-2xl font-bold'>Order</h2>
          <p className='text-sm text-muted-foreground'>{spkList.length} order aktif</p>
        </div>
        <div className='flex gap-2 items-center flex-wrap'>
          <Button size='sm' onClick={() => setShowCreate(true)}>
            <Plus size={14} className='mr-1' /> Order Baru
          </Button>
          {['', ...DIVISIONS].map(d => (
            <Button key={d} size='sm' variant={filter === d ? 'default' : 'outline'}
              className='capitalize text-xs h-7' onClick={() => setFilter(d)}>
              {d || 'Semua'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center flex-1 text-muted-foreground text-sm'>
          Memuat data...
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
          {COLUMNS.map(col => (
            <div key={col.key} className={cn('rounded-lg p-2 min-h-32', col.bg)}>
              <div className='flex items-center justify-between mb-2'>
                <span className={cn('text-xs font-semibold', col.color)}>{col.label}</span>
                <Badge variant='secondary' className='text-xs px-1.5 h-4'>{byStatus[col.key]?.length || 0}</Badge>
              </div>
              <div className='max-h-[60vh] overflow-y-auto space-y-2'>
                {byStatus[col.key]?.length === 0 ? (
                  <p className='text-center py-4 text-xs text-muted-foreground'>—</p>
                ) : (
                  byStatus[col.key].map(spk => (
                    <Card key={spk.id} className='mb-1 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      onClick={() => setSelectedId(spk.id)}>
                      <CardHeader className='p-2 pb-1'>
                        <p className='font-semibold text-xs leading-tight'>{spk.workorder_number}</p>
                        <p className='text-xs text-muted-foreground'>{spk.customer_name || spk.unit}</p>
                      </CardHeader>
                      <CardContent className='p-2 pt-0'>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground mb-1'>
                          <Clock size={10} />
                          <span>{spk.tanggal}</span>
                        </div>
                        {(spk as any).task_count > 0 && (
                          <div className='text-xs text-muted-foreground'>
                            {(spk as any).task_done}/{(spk as any).task_count} task
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side='right' className='w-full sm:max-w-md overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>Detail Order</SheetTitle>
          </SheetHeader>
          {selectedId && <OrderDetail spkId={selectedId} />}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <CreateOrderDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

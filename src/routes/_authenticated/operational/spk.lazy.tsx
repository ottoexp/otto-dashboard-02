import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getSPK, updateSPKStatus, type SPK } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Clock, ChevronRight } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/operational/spk')({
  component: OrderPage,
})

const COLUMNS: { key: SPK['status']; label: string; color: string; bg: string }[] = [
  { key: 'pending',        label: 'Pending',      color: 'text-gray-600',   bg: 'bg-gray-100' },
  { key: 'in_progress',    label: 'In Progress',  color: 'text-blue-600',   bg: 'bg-blue-50' },
  { key: 'waiting_tool',   label: 'Wait Tool',    color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'waiting_part',   label: 'Wait Part',    color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'waiting_survey', label: 'Wait Survey',  color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'completed',      label: 'Completed',    color: 'text-green-600',  bg: 'bg-green-50' },
]

const DIVISI_COLORS: Record<string, string> = {
  bongkar: 'bg-red-100 text-red-700',
  dempul:  'bg-yellow-100 text-yellow-700',
  epoxy:   'bg-orange-100 text-orange-700',
  cat:     'bg-blue-100 text-blue-700',
  poles:   'bg-purple-100 text-purple-700',
  pasang:  'bg-green-100 text-green-700',
}

function SPKCard({ spk, onMove }: { spk: SPK; onMove: (id: string, status: SPK['status']) => void }) {
  const currentIdx = COLUMNS.findIndex(c => c.key === spk.status)
  const next = COLUMNS[currentIdx + 1]

  return (
    <Card className='mb-2 shadow-sm hover:shadow-md transition-shadow'>
      <CardHeader className='p-3 pb-1'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <p className='font-semibold text-sm leading-tight'>{spk.workorder_number}</p>
            <p className='text-xs text-muted-foreground mt-0.5'>{spk.unit}{spk.merek_type ? ` — ${spk.merek_type}` : ''}</p>
          </div>
          <Badge className={cn('text-xs shrink-0 capitalize', DIVISI_COLORS[spk.divisi] || '')}>
            {spk.divisi}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-3 pt-1'>
        <div className='flex items-center gap-1 text-xs text-muted-foreground mb-2'>
          <Clock size={11} />
          <span>{spk.tanggal}</span>
        </div>
        {next && (
          <Button
            size='sm'
            variant='outline'
            className='w-full h-7 text-xs'
            onClick={() => onMove(spk.id, next.key)}
          >
            → {next.label}
            <ChevronRight size={12} className='ml-auto' />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function OrderPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('')

  const { data: spkList = [], isLoading } = useQuery({
    queryKey: ['spk'],
    queryFn: () => getSPK(),
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SPK['status'] }) =>
      updateSPKStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spk'] }),
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
          <p className='text-sm text-muted-foreground'>{spkList.length} work order aktif</p>
        </div>
        <div className='flex gap-1 flex-wrap justify-end'>
          {['', ...Object.keys(DIVISI_COLORS)].map(d => (
            <Button
              key={d}
              size='sm'
              variant={filter === d ? 'default' : 'outline'}
              className='capitalize text-xs h-7'
              onClick={() => setFilter(d)}
            >
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
                <Badge variant='secondary' className='text-xs px-1.5 h-4'>
                  {byStatus[col.key]?.length || 0}
                </Badge>
              </div>
              <div className='max-h-[60vh] overflow-y-auto'>
                {byStatus[col.key]?.length === 0 ? (
                  <p className='text-center py-4 text-xs text-muted-foreground'>—</p>
                ) : (
                  byStatus[col.key].map(spk => (
                    <SPKCard
                      key={spk.id}
                      spk={spk}
                      onMove={(id, status) => moveMutation.mutate({ id, status })}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

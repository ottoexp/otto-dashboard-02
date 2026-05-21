import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getSPK, type SPK } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle2 } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/operational/scheduling')({
  component: FlowPage,
})

const DIVISI = ['bongkar','dempul','epoxy','cat','poles','pasang'] as const

const DIVISI_COLOR: Record<string, { bg: string; badge: string; dot: string }> = {
  bongkar: { bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-400' },
  dempul:  { bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  epoxy:   { bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  cat:     { bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  poles:   { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  pasang:  { bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
}

function FlowPage() {
  const { data: spkList = [], isLoading } = useQuery({
    queryKey: ['spk'],
    queryFn: () => getSPK(),
  })

  // Only show active orders (not completed)
  const active = spkList.filter(s => s.status !== 'completed')

  // Group by divisi (primary divisi field)
  const byDivisi = DIVISI.reduce<Record<string, SPK[]>>((acc, div) => {
    acc[div] = active.filter(s => s.divisi === div)
    return acc
  }, {})

  const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    in_progress: 'Dikerjakan',
    waiting_tool: 'Tunggu Alat',
    waiting_part: 'Tunggu Part',
    waiting_survey: 'Tunggu Survey',
  }

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-bold'>Flow</h2>
        <p className='text-sm text-muted-foreground'>{active.length} order aktif — progress per divisi</p>
      </div>

      {isLoading ? (
        <div className='text-center py-12 text-muted-foreground text-sm'>Memuat...</div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {DIVISI.map(div => {
            const cfg = DIVISI_COLOR[div]
            const orders = byDivisi[div]
            return (
              <div key={div} className={cn('rounded-xl p-3', cfg.bg)}>
                {/* Header */}
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <div className={cn('h-3 w-3 rounded-full', cfg.dot)} />
                    <span className='font-semibold capitalize text-sm'>{div}</span>
                  </div>
                  <Badge variant='secondary' className='text-xs'>{orders.length}</Badge>
                </div>

                {/* Orders */}
                <div className='space-y-2 max-h-72 overflow-y-auto'>
                  {orders.length === 0 ? (
                    <p className='text-xs text-center text-muted-foreground py-3'>Kosong</p>
                  ) : (
                    orders.map(spk => (
                      <Card key={spk.id} className='bg-white/80 shadow-none'>
                        <CardContent className='p-2'>
                          <div className='flex items-start justify-between gap-1'>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs font-semibold truncate'>{spk.workorder_number}</p>
                              <p className='text-xs text-muted-foreground truncate'>
                                {spk.customer_name || spk.unit}
                                {spk.merek_type ? ` · ${spk.merek_type}` : ''}
                              </p>
                            </div>
                            <Badge className={cn('text-xs shrink-0 ml-1', cfg.badge)}>
                              {statusLabel[spk.status] || spk.status}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-1 mt-1 text-xs text-muted-foreground'>
                            <Clock size={10} />
                            <span>{spk.tanggal}</span>
                            {(spk as any).task_done !== undefined && (
                              <span className='ml-auto flex items-center gap-0.5'>
                                <CheckCircle2 size={10} className='text-green-500' />
                                {(spk as any).task_done}/{(spk as any).task_count}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

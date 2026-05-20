import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getScheduling, type Scheduling } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Sun, Sunset, Moon } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/operational/scheduling')({
  component: FlowPage,
})

const SHIFT_CONFIG = {
  morning:   { label: 'Pagi',   icon: Sun,     color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  afternoon: { label: 'Siang',  icon: Sunset,  color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  night:     { label: 'Malam',  icon: Moon,    color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function FlowPage() {
  const [anchor, setAnchor] = useState(new Date())
  const week = getWeekDates(anchor)
  const today = fmt(new Date())

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['scheduling'],
    queryFn: getScheduling,
  })

  const byDate = schedules.reduce<Record<string, Scheduling[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})

  const prevWeek = () => {
    const d = new Date(anchor)
    d.setDate(d.getDate() - 7)
    setAnchor(d)
  }
  const nextWeek = () => {
    const d = new Date(anchor)
    d.setDate(d.getDate() + 7)
    setAnchor(d)
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Flow</h2>
          <p className='text-sm text-muted-foreground'>Jadwal shift mingguan</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' className='h-8 w-8' onClick={prevWeek}>
            <ChevronLeft size={16} />
          </Button>
          <span className='text-sm font-medium min-w-32 text-center'>
            {week[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} –{' '}
            {week[6].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <Button variant='outline' size='icon' className='h-8 w-8' onClick={nextWeek}>
            <ChevronRight size={16} />
          </Button>
          <Button variant='outline' size='sm' onClick={() => setAnchor(new Date())}>
            Hari Ini
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className='text-center py-12 text-muted-foreground text-sm'>Memuat data...</div>
      ) : (
        <div className='grid grid-cols-7 gap-2'>
          {week.map((date, idx) => {
            const dateStr = fmt(date)
            const isToday = dateStr === today
            const daySchedules = byDate[dateStr] || []

            return (
              <div key={dateStr} className={cn('rounded-lg border p-2', isToday ? 'border-primary bg-primary/5' : 'border-border bg-background')}>
                {/* Day header */}
                <div className='text-center mb-2'>
                  <p className='text-xs text-muted-foreground'>{DAY_NAMES[idx]}</p>
                  <p className={cn('text-lg font-bold leading-tight', isToday && 'text-primary')}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Shifts */}
                <div className='space-y-1'>
                  {(['morning', 'afternoon', 'night'] as const).map(shift => {
                    const shiftItems = daySchedules.filter(s => s.shiftType === shift)
                    const cfg = SHIFT_CONFIG[shift]
                    const Icon = cfg.icon

                    if (shiftItems.length === 0) {
                      return (
                        <div key={shift} className={cn('rounded border p-1.5 opacity-40', cfg.color)}>
                          <div className='flex items-center gap-1'>
                            <Icon size={10} />
                            <span className='text-xs'>{cfg.label}</span>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={shift} className={cn('rounded border p-1.5', cfg.color)}>
                        <div className='flex items-center gap-1 mb-1'>
                          <Icon size={10} />
                          <span className='text-xs font-medium'>{cfg.label}</span>
                          <span className='ml-auto text-xs text-muted-foreground'>{shiftItems.length}</span>
                        </div>
                        {shiftItems.slice(0, 3).map(s => (
                          <div key={s.id} className='flex items-center gap-1 py-0.5'>
                            <span className='text-xs truncate flex-1'>{s.employeeName}</span>
                            <Badge className={cn('text-xs px-1 py-0 h-4', STATUS_BADGE[s.status] || '')}>
                              {s.status === 'scheduled' ? '●' : s.status === 'completed' ? '✓' : '✕'}
                            </Badge>
                          </div>
                        ))}
                        {shiftItems.length > 3 && (
                          <p className='text-xs text-muted-foreground'>+{shiftItems.length - 3} lagi</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {daySchedules.length === 0 && (
                  <p className='text-xs text-center text-muted-foreground mt-1'>—</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className='flex gap-3 text-xs text-muted-foreground'>
        {Object.entries(SHIFT_CONFIG).map(([k, v]) => (
          <span key={k} className='flex items-center gap-1'>
            <v.icon size={12} />
            {v.label}
          </span>
        ))}
        <span className='ml-4'>● Terjadwal</span>
        <span>✓ Selesai</span>
        <span>✕ Batal</span>
      </div>
    </div>
  )
}

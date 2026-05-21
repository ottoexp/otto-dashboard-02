import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Users, CheckCircle2, XCircle, Clock } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/report/attendance')({
  component: AttendanceReportPage,
})

const STATUS_LABEL: Record<string, string> = {
  present: 'Hadir', absent: 'Absen', late: 'Terlambat',
  leave_half: 'Cuti Setengah', leave_full: 'Cuti Penuh',
}
const STATUS_COLOR: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  leave_half: 'bg-blue-100 text-blue-700',
  leave_full: 'bg-indigo-100 text-indigo-700',
}

function fmt(time: string | null) {
  return time ? time.slice(0, 5) : '—'
}

function duration(start: string | null, end: string | null): string {
  if (!start || !end) return '—'
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) return '—'
  return `${Math.floor(mins / 60)}j ${mins % 60}m`
}

function AttendanceReportPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)

  const { data, isLoading } = useQuery({
    queryKey: ['report-attendance', dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get('/controller/attendance', {
        params: { dateFrom, dateTo, pageSize: 200 }
      })
      return data
    },
  })

  const records = data?.data || []

  const summary = {
    total: records.length,
    hadir: records.filter((r: any) => r.status === 'present').length,
    absen: records.filter((r: any) => r.status === 'absent').length,
    terlambat: records.filter((r: any) => r.status === 'late').length,
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Rekap Attendance</h2>
        <Button variant='outline' size='sm' onClick={() => window.print()}>
          <Download size={14} className='mr-2' /> Export
        </Button>
      </div>

      {/* Filter */}
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium'>Dari</label>
          <Input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)} className='h-8 w-36' />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium'>Sampai</label>
          <Input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)} className='h-8 w-36' />
        </div>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          { label: 'Total', value: summary.total, icon: Users, color: 'text-blue-500' },
          { label: 'Hadir', value: summary.hadir, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Absen', value: summary.absen, icon: XCircle, color: 'text-red-500' },
          { label: 'Terlambat', value: summary.terlambat, icon: Clock, color: 'text-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className='p-3 flex items-center gap-3'>
              <Icon size={22} className={color} />
              <div>
                <p className='text-2xl font-bold leading-tight'>{value}</p>
                <p className='text-xs text-muted-foreground'>{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Masuk</TableHead>
            <TableHead>Istirahat</TableHead>
            <TableHead>Kembali</TableHead>
            <TableHead>Pulang</TableHead>
            <TableHead>Durasi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>Memuat...</TableCell></TableRow>
          ) : records.length === 0 ? (
            <TableRow><TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>Tidak ada data</TableCell></TableRow>
          ) : (
            records.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className='text-sm'>{r.date}</TableCell>
                <TableCell className='font-medium'>{r.user_name || r.user_id}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${STATUS_COLOR[r.status] || ''}`}>
                    {STATUS_LABEL[r.status] || r.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-sm'>{fmt(r.check_in)}</TableCell>
                <TableCell className='text-sm'>{fmt(r.break_start)}</TableCell>
                <TableCell className='text-sm'>{fmt(r.break_end)}</TableCell>
                <TableCell className='text-sm'>{fmt(r.check_out)}</TableCell>
                <TableCell className='text-sm text-muted-foreground'>{duration(r.check_in, r.check_out)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

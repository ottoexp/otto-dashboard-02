import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, MapPin, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export const Route = createLazyFileRoute('/_authenticated/controller/attendance')({
  component: AttendancePage,
})

// --- API helpers ---
const getToday = async () => { const { data } = await api.get('/attendance/today'); return data.data }
const checkIn   = async (body: any) => { const { data } = await api.post('/attendance/check-in', body); return data.data }
const breakStart = async () => { const { data } = await api.post('/attendance/break-start', {}); return data.data }
const breakEnd   = async () => { const { data } = await api.post('/attendance/break-end', {}); return data.data }
const checkOut  = async (body: any) => { const { data } = await api.post('/attendance/check-out', body); return data.data }

// --- Clock ---
function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

// --- GPS hook ---
function useGPS() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const capture = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setLoading(false) },
      () => { toast.error('Gagal ambil lokasi'); setLoading(false) },
      { timeout: 10000 }
    )
  }

  return { pos, loading, capture }
}

// --- Camera hook ---
function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setActive(true)
    } catch { toast.error('Gagal aktifkan kamera') }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
    setPhoto(dataUrl)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setActive(false)
  }

  const reset = () => { setPhoto(null); setActive(false); streamRef.current?.getTracks().forEach(t => t.stop()) }

  return { videoRef, active, photo, start, capture, reset }
}

// --- Step button ---
const STEPS = [
  { key: 'check_in',   label: 'Absen Masuk',     sub: 'Foto + GPS wajib',       color: 'bg-green-500',  dot: 'bg-green-400' },
  { key: 'break_start', label: 'Mulai Istirahat', sub: 'Tandai istirahat',       color: 'bg-yellow-500', dot: 'bg-yellow-400' },
  { key: 'break_end',   label: 'Kembali Kerja',   sub: 'Kembali ke pekerjaan',   color: 'bg-blue-500',   dot: 'bg-blue-400' },
  { key: 'check_out',  label: 'Absen Pulang',     sub: 'Foto + GPS wajib',       color: 'bg-red-500',    dot: 'bg-red-400' },
]

function currentStep(record: any): string {
  if (!record) return 'check_in'
  if (!record.break_start) return 'break_start'
  if (!record.break_end) return 'break_end'
  if (!record.check_out) return 'check_out'
  return 'done'
}

function AttendancePage() {
  const now = useClock()
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()
  const gps = useGPS()
  const cam = useCamera()

  const { data: record, isLoading } = useQuery({ queryKey: ['attendance-today'], queryFn: getToday })

  const step = currentStep(record)
  const needsPhotoGPS = step === 'check_in' || step === 'check_out'

  const mutation = useMutation({
    mutationFn: async () => {
      if (needsPhotoGPS && !cam.photo) { toast.error('Ambil foto dulu'); throw new Error('no photo') }
      if (needsPhotoGPS && !gps.pos) { toast.error('Ambil lokasi GPS dulu'); throw new Error('no gps') }
      const body = { lat: gps.pos?.lat, lng: gps.pos?.lng, photo: cam.photo }
      if (step === 'check_in') return checkIn(body)
      if (step === 'break_start') return breakStart()
      if (step === 'break_end') return breakEnd()
      if (step === 'check_out') return checkOut(body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] })
      cam.reset()
      gps.pos && toast.success('Berhasil!')
    },
    onError: (e: any) => { if (e.message !== 'no photo' && e.message !== 'no gps') toast.error('Gagal absen') },
  })

  const day = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className='max-w-md mx-auto space-y-4'>
      {/* Header */}
      <div className='rounded-2xl bg-slate-800 text-white p-4'>
        <p className='text-xs text-slate-400 uppercase tracking-widest'>Selamat Datang</p>
        <p className='text-2xl font-bold leading-tight'>{auth.user?.name || '—'}</p>
        <p className='text-sm text-slate-400 capitalize'>{auth.user?.role || ''}</p>
        <div className='flex items-end justify-between mt-2'>
          <p className='text-sm text-slate-300'>{day}</p>
          <p className='text-3xl font-mono font-bold'>{time}</p>
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'><Loader2 className='animate-spin text-muted-foreground' /></div>
      ) : (
        <>
          {/* Status */}
          <Card>
            <CardContent className='p-4'>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>Status Absensi</p>
              <div className='flex items-center gap-2'>
                {step === 'done' ? <CheckCircle2 className='text-green-500' size={22} /> : <Clock className='text-yellow-500' size={22} />}
                <span className='text-base font-medium'>
                  {step === 'check_in' && 'Belum absen masuk'}
                  {step === 'break_start' && 'Sudah masuk — belum istirahat'}
                  {step === 'break_end' && 'Istirahat — belum kembali'}
                  {step === 'check_out' && 'Sudah kembali — belum pulang'}
                  {step === 'done' && 'Absensi hari ini selesai'}
                </span>
              </div>
              {record?.check_in && (
                <div className='mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1'>
                  {record.check_in && <span>Masuk: {record.check_in}</span>}
                  {record.break_start && <span>Istirahat: {record.break_start}</span>}
                  {record.break_end && <span>Kembali: {record.break_end}</span>}
                  {record.check_out && <span>Pulang: {record.check_out}</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {step !== 'done' && (
            <>
              {/* Camera — only for check_in and check_out */}
              {needsPhotoGPS && (
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <Camera size={18} />
                        <span className='font-medium'>Foto Absensi</span>
                      </div>
                      <Badge variant={cam.photo ? 'default' : 'secondary'} className='text-xs'>
                        {cam.photo ? 'Sudah diambil' : 'Belum diambil'}
                      </Badge>
                    </div>
                    {cam.photo ? (
                      <div className='relative'>
                        <img src={cam.photo} className='w-full rounded-lg max-h-48 object-cover' alt='foto' />
                        <Button size='sm' variant='outline' className='mt-2 w-full' onClick={cam.reset}>Ambil Ulang</Button>
                      </div>
                    ) : cam.active ? (
                      <div>
                        <video ref={cam.videoRef} autoPlay playsInline className='w-full rounded-lg max-h-48 object-cover' />
                        <Button className='w-full mt-2' onClick={cam.capture}><Camera size={16} className='mr-2' />Ambil Foto</Button>
                      </div>
                    ) : (
                      <Button variant='outline' className='w-full' onClick={cam.start}><Camera size={16} className='mr-2' />Aktifkan Kamera</Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* GPS — only for check_in and check_out */}
              {needsPhotoGPS && (
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        <MapPin size={18} />
                        <span className='font-medium'>Lokasi GPS</span>
                      </div>
                      <Badge variant={gps.pos ? 'default' : 'secondary'} className='text-xs'>
                        {gps.pos ? 'Sudah diambil' : 'Belum aktif'}
                      </Badge>
                    </div>
                    {gps.pos ? (
                      <p className='text-xs text-muted-foreground'>{gps.pos.lat.toFixed(6)}, {gps.pos.lng.toFixed(6)}</p>
                    ) : (
                      <Button className='w-full' onClick={gps.capture} disabled={gps.loading}>
                        {gps.loading ? <Loader2 size={16} className='animate-spin mr-2' /> : <MapPin size={16} className='mr-2' />}
                        {gps.loading ? 'Mengambil...' : 'Ambil Lokasi GPS'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step buttons */}
              <div className='space-y-2'>
                {STEPS.map((s, i) => {
                  const isActive = s.key === step
                  const isDone = STEPS.indexOf(STEPS.find(x => x.key === step)!) > i || step === 'done'
                  return (
                    <div
                      key={s.key}
                      onClick={() => isActive && mutation.mutate()}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 transition-all',
                        isActive && 'border-primary cursor-pointer hover:shadow-md',
                        isDone && 'opacity-50 bg-muted border-transparent',
                        !isActive && !isDone && 'opacity-30 border-transparent'
                      )}
                    >
                      <div className={cn('h-4 w-4 rounded-full shrink-0', isDone ? 'bg-green-400' : isActive ? s.dot : 'bg-gray-300')} />
                      <div className='flex-1'>
                        <p className={cn('font-semibold text-sm', isActive && 'text-primary')}>{s.label}</p>
                        <p className='text-xs text-muted-foreground'>{s.sub}</p>
                      </div>
                      {isActive && mutation.isPending && <Loader2 size={16} className='animate-spin text-primary' />}
                      {isDone && <CheckCircle2 size={16} className='text-green-500' />}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

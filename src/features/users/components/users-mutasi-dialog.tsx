import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useUsers } from './users-provider'
import { useMutasiCabangMutation } from '../data/users-query'

const CABANG_OPTIONS = [
  { value: 'pusat', label: 'Pusat' },
  { value: 'kapuk', label: 'Kapuk' },
  { value: 'cakung', label: 'Cakung' },
  { value: 'cikarang', label: 'Cikarang' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersMutasiDialog({ open, onOpenChange }: Props) {
  const { currentRow } = useUsers()
  const mutasi = useMutasiCabangMutation()
  const [cabang, setCabang] = useState<string>(currentRow?.cabang || 'pusat')

  const handleSubmit = async () => {
    if (!currentRow || !cabang) return
    try {
      await mutasi.mutateAsync({ id: currentRow.id, cabang })
      toast.success(`${currentRow.username} dimutasi ke ${cabang}`)
      onOpenChange(false)
    } catch {
      toast.error('Gagal mutasi user')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>Mutasi Cabang</DialogTitle>
          <DialogDescription>
            Pindahkan <strong>{currentRow?.username}</strong> ke cabang lain.
            <br />
            Cabang saat ini:{' '}
            <strong>{currentRow?.cabang || 'belum ditentukan'}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Cabang Tujuan</Label>
            <Select value={cabang} onValueChange={setCabang}>
              <SelectTrigger>
                <SelectValue placeholder='Pilih cabang...' />
              </SelectTrigger>
              <SelectContent>
                {CABANG_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={mutasi.isPending}>
            {mutasi.isPending ? 'Memproses...' : 'Mutasi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

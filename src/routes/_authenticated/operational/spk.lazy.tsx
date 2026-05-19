import { createLazyFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const Route = createLazyFileRoute('/_authenticated/operational/spk')({
  component: SPKPage,
})

function SPKPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Surat Perintah Kerja</h1>
          <p className="text-muted-foreground">Kelola SPK dan tracking progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Buat SPK Baru
        </Button>
      </div>
      <div className="rounded-md border p-8 text-center">
        <p>Halaman SPK sedang dalam pengembangan</p>
        <p className="text-muted-foreground">API endpoint sudah tersedia dan berfungsi</p>
      </div>
    </div>
  )
}
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/report/inventory')({
  component: () => (
    <div className='flex items-center justify-center h-48 text-muted-foreground'>
      Rekap Inventory — segera hadir
    </div>
  ),
})

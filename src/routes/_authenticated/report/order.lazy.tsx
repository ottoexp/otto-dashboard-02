import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/report/order')({
  component: () => (
    <div className='flex items-center justify-center h-48 text-muted-foreground'>
      Rekap Order — segera hadir
    </div>
  ),
})

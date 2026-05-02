import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: Admin,
})

function Admin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p className="text-muted-foreground">Admin page content</p>
    </div>
  )
}

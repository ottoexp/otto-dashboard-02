import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Users, Search, ArrowLeftRight } from 'lucide-react'
import { getUsers, getRoles } from '@/lib/api'
import { UsersProvider } from '@/features/users/components/users-provider'
import { UsersDialogs } from '@/features/users/components/users-dialogs'
import { UsersPrimaryButtons } from '@/features/users/components/users-primary-buttons'
import { useUsers } from '@/features/users/components/users-provider'

export const Route = createLazyFileRoute('/_authenticated/operational/people')({
  component: PersonnelPage,
})

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  invited:  'bg-blue-100 text-blue-700',
  suspended:'bg-red-100 text-red-700',
  non_apps: 'bg-yellow-100 text-yellow-700',
}

function UsersTab({ search }: { search: string }) {
  const { setOpen, setCurrentRow } = useUsers()

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => getUsers(search ? { search } : {}),
  })

  const users = data?.data ?? []
  const filteredUsers = search
    ? users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Cabang</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-16'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>Memuat...</TableCell></TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow><TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>Belum ada data</TableCell></TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id} className='cursor-pointer hover:bg-muted/50' onClick={() => { setCurrentRow(user as any); setOpen('edit') }}>
                <TableCell>
                  <p className='font-medium'>{user.firstName} {user.lastName}</p>
                  <p className='text-xs text-muted-foreground'>{user.email}</p>
                </TableCell>
                <TableCell className='text-sm'>{user.username}</TableCell>
                <TableCell className='text-sm'>{(user as any).position || '—'}</TableCell>
                <TableCell>
                  {user.cabang ? (
                    <Badge variant='outline' className='capitalize text-xs'>{user.cabang}</Badge>
                  ) : '—'}
                </TableCell>
                <TableCell className='text-sm capitalize'>{(user as any).roleName || (user as any).legacyRole || '—'}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${STATUS_COLORS[user.status] || ''}`}>
                    {user.status === 'non_apps' ? 'Non Apps' : user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentRow(user as any); setOpen('mutasi') }}
                    className='p-1 hover:text-primary'
                    title='Mutasi cabang'
                  >
                    <ArrowLeftRight size={14} />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
  )
}

function RolesTab() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Tipe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow><TableCell colSpan={3} className='text-center py-8 text-muted-foreground'>Memuat...</TableCell></TableRow>
        ) : roles.map((role: any) => (
          <TableRow key={role.id}>
            <TableCell className='font-medium capitalize'>{role.name}</TableCell>
            <TableCell className='text-sm text-muted-foreground'>{role.description || '—'}</TableCell>
            <TableCell>
              <Badge variant={role.isSystem ? 'secondary' : 'outline'} className='text-xs'>
                {role.isSystem ? 'System' : 'Custom'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PersonnelPage() {
  const [search, setSearch] = useState('')

  return (
    <UsersProvider>
      <div className='space-y-3'>
        <h2 className='text-2xl font-bold'>Personnel</h2>

        <Tabs defaultValue='users'>
          {/* Tabs + Add button on same row */}
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='users' className='flex items-center gap-1.5'>
                <Users size={14} />
                Karyawan
              </TabsTrigger>
              <TabsTrigger value='roles' className='flex items-center gap-1.5'>
                <Shield size={14} />
                Roles
              </TabsTrigger>
            </TabsList>
            <UsersPrimaryButtons />
          </div>

          {/* Search below tabs row, only for Karyawan */}
          <TabsContent value='users' className='mt-3 space-y-3'>
            <div className='relative'>
              <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Cari karyawan...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-8'
              />
            </div>
            <UsersTab search={search} />
          </TabsContent>

          <TabsContent value='roles' className='mt-3'>
            <RolesTab />
          </TabsContent>
        </Tabs>
      </div>

      <UsersDialogs />
    </UsersProvider>
  )
}

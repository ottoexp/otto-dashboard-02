import {
  User,
  Package2,
  Wrench as ServicesIcon,
  Calendar,
  ClipboardList,
  Settings as AdminIcon,
  Users as AbsensiIcon,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [],
  navGroups: [
    {
      title: '',
      items: [
        {
          title: 'Absensi',
          url: '/controller/attendance',
          icon: AbsensiIcon,
        },
        {
          title: 'Customer',
          url: '/operational/customer',
          icon: User,
          permission: { resource: 'customers', action: 'read' },
        },
        {
          title: 'Service',
          url: '/operational/service',
          icon: ServicesIcon,
        },
        {
          title: 'Inventory',
          url: '/operational/inventory',
          icon: Package2,
          permission: { resource: 'inventory', action: 'read' },
        },
        {
          title: 'Scheduling',
          url: '/operational/scheduling',
          icon: Calendar,
        },
        {
          title: 'Workorder',
          url: '/operational/spk',
          icon: ClipboardList,
        },
        {
          title: 'Admin',
          url: '/controller/admin',
          icon: AdminIcon,
        },
      ],
    },
  ],
}

import {
  User,
  Package2,
  Calendar,
  ClipboardList,
  Settings,
  Users as PersonnelIcon,
  CalendarCheck,
  GitBranch,
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
          title: 'Order',
          url: '/operational/spk',
          icon: ClipboardList,
        },
        {
          title: 'Flow',
          url: '/operational/scheduling',
          icon: GitBranch,
        },
        {
          title: 'Attendance',
          url: '/controller/attendance',
          icon: CalendarCheck,
        },
      ],
    },
    {
      title: 'Setting',
      items: [
        {
          title: 'Inventory',
          url: '/operational/inventory',
          icon: Package2,
        },
        {
          title: 'Customer',
          url: '/operational/customer',
          icon: User,
        },
        {
          title: 'Personnel',
          url: '/operational/people',
          icon: PersonnelIcon,
        },
        {
          title: 'Admin',
          url: '/controller/admin',
          icon: Settings,
        },
      ],
    },
  ],
}

import {
  Command,
  User,
  Package2,
  Users as TeamIcon,
  Wrench as ServicesIcon,
  CreditCard as TransactionsIcon,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'WEP',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
  ],
  navGroups: [
    {
      title: '',
      items: [
        {
          title: 'Customer',
          url: '/customers',
          icon: User,
        },
        {
          title: 'Sales',
          url: '/services/request',
          icon: ServicesIcon,
        },
        {
          title: 'Inventory',
          url: '/inventory/request',
          icon: Package2,
        },
        {
          title: 'Team',
          icon: TeamIcon,
          items: [
            {
              title: 'Schedule',
              url: '/team/schedule',
            },
            {
              title: 'Absensi',
              url: '/team/absensi',
            },
          ],
        },
        {
          title: 'Finance',
          icon: TransactionsIcon,
          items: [
            {
              title: 'Cash',
              url: '/transactions/cash',
            },
            {
              title: 'Bank',
              url: '/transactions/bank',
            },
            {
              title: 'Ledger',
              url: '/transactions/ledger',
            },
            {
              title: 'Report',
              url: '/transactions/report',
            },
            {
              title: 'Pajak',
              url: '/transactions/pajak',
            },
          ],
        },
      ],
    },
   ],
}

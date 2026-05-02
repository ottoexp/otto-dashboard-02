import {
  Command,
  User,
  Package2,
  Users as PeopleIcon,
  Wrench as ServicesIcon,
  CreditCard as AccountingIcon,
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
          title: 'Sales',
          icon: ServicesIcon,
          permission: { resource: 'sales', action: 'read' },
          items: [
            {
              title: 'Customer',
              url: '/customers',
              icon: User,
              permission: { resource: 'customers', action: 'read' },
            },
          ],
        },
        {
          title: 'Inventory',
          icon: Package2,
          permission: { resource: 'inventory', action: 'read' },
          items: [
            {
              title: 'Inventory Items',
              url: '/inventory',
            },
            {
              title: 'Service Inventory',
              url: '/service-inventory',
            },
          ],
        },
        {
          title: 'Accounting',
          icon: AccountingIcon,
          permission: { resource: 'finance', action: 'read' },
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
              title: 'Pajak',
              url: '/transactions/pajak',
            },
          ],
        },
        {
          title: 'People',
          icon: PeopleIcon,
          permission: { resource: 'team', action: 'read' },
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
      ],
    },
   ],
}
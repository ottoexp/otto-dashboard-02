import {
  Command,
  User,
  Package2,
  Users as PeopleIcon,
  Wrench as ServicesIcon,
  CreditCard as AccountingIcon,
  Calendar,
  DollarSign,
  Building2,
  BookOpen,
  Receipt,
  Shield,
  Settings as AdminIcon,
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
          title: 'Controller',
          icon: Shield,
          permission: { resource: 'controller', action: 'read' },
          items: [
            {
              title: 'Attendance',
              url: '/controller/attendance',
              icon: Calendar,
            },
            {
              title: 'Cash',
              url: '/controller/cash',
              icon: DollarSign,
            },
            {
              title: 'Bank',
              url: '/controller/bank',
              icon: Building2,
            },
            {
              title: 'Ledger',
              url: '/controller/ledger',
              icon: BookOpen,
            },
            {
              title: 'Tax',
              url: '/controller/tax',
              icon: Receipt,
            },
            {
              title: 'Admin',
              url: '/controller/admin',
              icon: AdminIcon,
            },
          ],
        },
        {
          title: 'Operational',
          icon: ServicesIcon,
          permission: { resource: 'operational', action: 'read' },
          items: [
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
              items: [
                {
                  title: 'Inventory Items',
                  url: '/operational/inventory',
                },
                {
                  title: 'Service Inventory',
                  url: '/operational/service-inventory',
                },
              ],
            },
            {
              title: 'People',
              url: '/operational/people',
              icon: PeopleIcon,
              permission: { resource: 'team', action: 'read' },
            },
            {
              title: 'Scheduling',
              url: '/operational/scheduling',
              icon: Calendar,
            },
          ],
        },
      ],
    },
   ],
}
import {
  User,
  Package2,
  Wrench,
  ClipboardList,
  Settings as AdminIcon,
  Users,
  GitBranch,
  Hammer,
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
          title: 'Inventory',
          icon: Package2,
          items: [
            {
              title: 'Material',
              url: '/operational/inventory/material',
            },
            {
              title: 'Tools',
              url: '/operational/inventory/tools',
            },
          ],
        },
        {
          title: 'Admin',
          icon: AdminIcon,
          items: [
            {
              title: 'Customer',
              url: '/operational/customer',
            },
            {
              title: 'Personnel',
              url: '/operational/people',
            },
          ],
        },
      ],
    },
  ],
}

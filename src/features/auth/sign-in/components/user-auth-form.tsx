import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Monitor, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CABANG_OPTIONS = [
  { value: 'pusat', label: 'Pusat' },
  { value: 'kapuk', label: 'Kapuk' },
  { value: 'cakung', label: 'Cakung' },
  { value: 'cikarang', label: 'Cikarang' },
]

const formSchema = z.object({
  cabang: z.enum(['pusat', 'kapuk', 'cakung', 'cikarang'], {
    error: () => 'Pilih cabang',
  }),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Masukkan email' : 'Email tidak valid'),
  }),
  password: z.string().min(1, 'Masukkan password').min(7, 'Password minimal 7 karakter'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectTo?: string
}

export function UserAuthForm({ className, redirectTo }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { cabang: undefined, email: '', password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { login } = await import('@/lib/api')
      const response = await login({ email: data.email, password: data.password, cabang: data.cabang })
      auth.setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        cabang: response.user.cabang || null,
      })
      auth.setAccessToken(response.accessToken)
      auth.setRefreshToken(response.refreshToken)
      setShowLayoutPicker(true)
    } catch {
      toast.error('Email, password, atau cabang tidak valid')
    } finally {
      setIsLoading(false)
    }
  }

  function chooseLayout(layout: 'desktop' | 'mobile') {
    auth.setLayout(layout)
    navigate({ to: redirectTo || '/', replace: true })
  }

  if (showLayoutPicker) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className='text-center'>
          <p className='text-base font-semibold'>Pilih tampilan</p>
          <p className='text-sm text-muted-foreground mt-1'>Sesuaikan dengan perangkat yang kamu gunakan</p>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <button
            onClick={() => chooseLayout('desktop')}
            className='flex flex-col items-center gap-3 rounded-xl border-2 p-6 hover:border-primary hover:bg-primary/5 transition-all'
          >
            <Monitor size={40} className='text-blue-500' />
            <div className='text-center'>
              <p className='font-semibold'>Desktop</p>
              <p className='text-xs text-muted-foreground mt-0.5'>PC / Laptop</p>
            </div>
          </button>
          <button
            onClick={() => chooseLayout('mobile')}
            className='flex flex-col items-center gap-3 rounded-xl border-2 p-6 hover:border-primary hover:bg-primary/5 transition-all'
          >
            <Smartphone size={40} className='text-green-500' />
            <div className='text-center'>
              <p className='font-semibold'>Mobile</p>
              <p className='text-xs text-muted-foreground mt-0.5'>HP / Tablet</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
      >
        <FormField
          control={form.control}
          name='cabang'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cabang</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih cabang...' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CABANG_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}

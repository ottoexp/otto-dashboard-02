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
      navigate({ to: redirectTo || '/', replace: true })
    } catch {
      toast.error('Email, password, atau cabang tidak valid')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {/* Layout Picker */}
      <div>
        <p className='text-sm font-medium mb-2'>Tampilan</p>
        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={() => auth.setLayout('desktop')}
            className={cn(
              'flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all',
              auth.layout === 'desktop'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <Monitor size={18} />
            <span className='text-sm font-medium'>Desktop</span>
          </button>
          <button
            type='button'
            onClick={() => auth.setLayout('mobile')}
            className={cn(
              'flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all',
              auth.layout === 'mobile'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <Smartphone size={18} />
            <span className='text-sm font-medium'>Mobile</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3'>
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
    </div>
  )
}

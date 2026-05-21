import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const CABANG_OPTIONS = [
  { value: 'pusat',    label: 'Pusat' },
  { value: 'kapuk',    label: 'Kapuk' },
  { value: 'cakung',   label: 'Cakung' },
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

const BTN = (active: boolean) =>
  cn(
    'rounded-lg border px-3 py-1 text-sm transition-all whitespace-nowrap',
    active
      ? 'border-primary bg-primary/5 text-primary font-medium'
      : 'border-border text-muted-foreground hover:border-primary/50'
  )

const ROW = 'flex items-center gap-3'
const LABEL = 'text-sm font-medium w-20 shrink-0'

interface UserAuthFormProps { redirectTo?: string }

export function UserAuthForm({ redirectTo }: UserAuthFormProps) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>

        {/* Tampilan — 1 line */}
        <div className={ROW}>
          <span className={LABEL}>Tampilan</span>
          <div className='flex gap-2'>
            <button type='button' onClick={() => auth.setLayout('desktop')} className={BTN(auth.layout === 'desktop')}>
              <Monitor size={13} className='inline mr-1' />Desktop
            </button>
            <button type='button' onClick={() => auth.setLayout('mobile')} className={BTN(auth.layout === 'mobile')}>
              <Smartphone size={13} className='inline mr-1' />Mobile
            </button>
          </div>
        </div>

        {/* Cabang — 1 line semua */}
        <FormField
          control={form.control}
          name='cabang'
          render={({ field }) => (
            <FormItem>
              <div className={ROW}>
                <span className={LABEL}>Cabang</span>
                <div className='flex flex-wrap gap-2'>
                  {CABANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => field.onChange(opt.value)}
                      className={BTN(field.value === opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <FormMessage className='ml-[92px]' />
            </FormItem>
          )}
        />

        {/* Email — 1 line */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <div className={ROW}>
                <span className={LABEL}>Email</span>
                <FormControl>
                  <Input placeholder='name@example.com' className='flex-1' {...field} />
                </FormControl>
              </div>
              <FormMessage className='ml-[92px]' />
            </FormItem>
          )}
        />

        {/* Password — 1 line */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className={ROW}>
                <span className={LABEL}>Password</span>
                <FormControl>
                  <PasswordInput placeholder='••••••••' className='flex-1' {...field} />
                </FormControl>
              </div>
              <FormMessage className='ml-[92px]' />
            </FormItem>
          )}
        />

        <Button className='w-full mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn size={15} />}
          Masuk
        </Button>
      </form>
    </Form>
  )
}

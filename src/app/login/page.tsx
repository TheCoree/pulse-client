'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import api from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { FlipButton, FlipButtonBack, FlipButtonFront } from '@/components/animate-ui/primitives/buttons/flip'
import { StarsBackground } from '@/components/animate-ui/components/backgrounds/stars'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      toast.error('Заполните все поля')
      return
    }

    setIsLoading(true)

    const formatError = (error: any) => {
      const detail = error.response?.data?.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ')
      if (typeof detail === 'object' && detail !== null) return JSON.stringify(detail)
      return 'Непредвиденная ошибка'
    }

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      // 🔥 ВАЖНО: используем api, не axios напрямую
      await api.post('/auth/login', formData)

      toast.success('Успешный вход', {
        description: 'Рады видеть вас снова!',
      })

      // 👉 туда, где реально живёт продукт
      router.push('/calendars')
      router.refresh()
    } catch (err: any) {
      if (!err.response) {
        toast.error('Сервер недоступен')
      } else if (err.response.status === 401) {
        toast.error('Неверный логин или пароль')
      } else {
        toast.error(formatError(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <StarsBackground
        starColor={resolvedTheme === 'dark' ? '#000' : '#FFF'}
        className={cn('absolute inset-0 h-screen')}
      />

      <Card className="w-full max-w-sm border-border backdrop-blur-sm relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-medium">
            pulse ttm +
          </CardTitle>
          <CardDescription>Вход в систему</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="login-form"
            onSubmit={handleLogin}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="@"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Пароль</Label>
                <button
                  type="button"
                  className="ml-auto text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Забыли пароль?
                </button>
              </div>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            form="login-form"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Входим…' : 'Войти'}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-2">
            Нет аккаунта?{' '}
            <FlipButton
              className="p-0 h-auto"
              onClick={() => router.push('/register')}
            >
              <FlipButtonFront>Создать</FlipButtonFront>
              <FlipButtonBack>Аккаунт</FlipButtonBack>
            </FlipButton>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

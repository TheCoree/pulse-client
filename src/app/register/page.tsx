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

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password || !confirmPassword) {
      toast.error('Заполните все поля')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов')
      return
    }

    setIsLoading(true)

    try {
      // Регистрация
      await api.post('/auth/register', {
        username,
        password,
      })

      toast.success('Регистрация успешна', {
        description: 'Теперь выполняем вход...',
      })

      // Автоматический вход после регистрации
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      await api.post('/auth/login', formData)

      toast.success('Добро пожаловать!', {
        description: 'Вы успешно вошли в систему',
      })

      router.push('/calendars')
      router.refresh()
    } catch (err: any) {
      if (!err.response) {
        toast.error('Сервер недоступен')
      } else if (err.response.status === 400) {
        toast.error('Пользователь уже существует', {
          description: 'Попробуйте другое имя пользователя',
        })
      } else {
        toast.error('Ошибка регистрации', {
          description: err.response?.data?.detail || 'Неизвестная ошибка',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <StarsBackground
        starColor={resolvedTheme === 'dark' ? '#FFF' : '#000'}
        className={cn('absolute inset-0 h-screen')}
      />

      <Card className="w-full max-w-sm border-border backdrop-blur-sm relative z-10">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-medium">
            pulse ttm +
          </CardTitle>
          <CardDescription>Создание нового аккаунта</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="register-form"
            onSubmit={handleRegister}
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
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            form="register-form"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-2">
            Уже есть аккаунт?{' '}
            <FlipButton
              className="p-0 h-auto"
              onClick={() => router.push('/login')}
            >
              <FlipButtonFront>Войти</FlipButtonFront>
              <FlipButtonBack>Сейчас</FlipButtonBack>
            </FlipButton>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

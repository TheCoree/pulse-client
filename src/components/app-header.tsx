'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Settings, User } from 'lucide-react'

import api from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AppHeader() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
            toast.success('Вы вышли из системы')
            router.push('/login')
        } catch {
            toast.error('Ошибка при выходе')
            router.push('/login')
        }
    }

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            {/* LEFT: Logo */}
            <div className="flex items-center gap-4">
                <span className="text-xl font-display tracking-tight font-medium">
                    pulse ttm
                </span>
            </div>

            {/* RIGHT: User Menu */}
            <div className="flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none transition-opacity hover:opacity-80 focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="/avatars/01.png" alt="@user" />
                            <AvatarFallback>USER</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Пользователь</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        user@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Профиль</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Настройки</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Выйти</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

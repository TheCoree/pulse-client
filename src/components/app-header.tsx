'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'

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
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    {
        title: 'Календари',
        href: '/calendars',
        items: [
            { title: 'Все календари', href: '/calendars', description: 'Просмотр всех доступных календарей.' },
            { title: 'Личные', href: '/calendars/personal', description: 'Ваши персональные расписания.' },
            { title: 'Общие', href: '/calendars/shared', description: 'Календари вашей команды.' },
        ]
    },
    {
        title: 'Инструменты',
        href: '/admin',
        items: [
            { title: 'Пользователи', href: '/admin/users', description: 'Управление пользователями системы.' },
            { title: 'Логи', href: '/admin/logs', description: 'Просмотр системных логов.' },
            { title: 'Настройки', href: '/admin/settings', description: 'Глобальные настройки системы.' },
        ]
    },
    {
        title: 'Заявки',
        href: '/correction-orders',
    }
]

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
            {/* LEFT: Logo + Nav */}
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2 outline-none">
                    <span className="text-xl font-display tracking-tight font-medium hover:opacity-80 transition-opacity">
                        pulse ttm
                    </span>
                </Link>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {NAV_ITEMS.map((item) => (
                            <NavigationMenuItem key={item.title}>
                                {item.items ? (
                                    <>
                                        <NavigationMenuTrigger>
                                            {item.title}
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                {item.items.map((subItem) => (
                                                    <ListItem
                                                        key={subItem.title}
                                                        title={subItem.title}
                                                        href={subItem.href}
                                                    >
                                                        {subItem.description}
                                                    </ListItem>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </>
                                ) : (
                                    <Link href={item.href} legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                            {item.title}
                                        </NavigationMenuLink>
                                    </Link>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
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

const ListItem = ({ className, title, children, href, ...props }: React.ComponentPropsWithoutRef<"a"> & { title: string }) => {
    return (
        <li>
            <NavigationMenuLink href={href}>
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </div>
            </NavigationMenuLink>
        </li>
    )
}
ListItem.displayName = "ListItem"

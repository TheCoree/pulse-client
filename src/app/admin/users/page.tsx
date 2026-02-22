'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, User as UserIcon } from 'lucide-react'

interface UserItem {
    id: number
    username: string
    role: 'Admin' | 'User'
    is_items_corrector: boolean
}

export default function AdminUsersPage() {
    const { user: currentUser, isCorrector } = useAuth()
    const [users, setUsers] = useState<UserItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const res = await api.get<UserItem[]>('/user/all-list')
            setUsers(res.data)
        } catch (err) {
            toast.error('Ошибка при загрузке пользователей')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const toggleCorrector = async (targetUserId: number, currentState: boolean) => {
        try {
            await api.patch(`/user/${targetUserId}/permissions`, {
                is_items_corrector: !currentState
            })
            toast.success('Права обновлены')
            setUsers(prev => prev.map(u =>
                u.id === targetUserId ? { ...u, is_items_corrector: !currentState } : u
            ))
        } catch (err) {
            toast.error('Ошибка при обновлении прав')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <h1 className="text-2xl font-bold mb-2">Доступ запрещен</h1>
                <p className="text-muted-foreground">У вас нет прав администратора для просмотра этой страницы.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="border-muted/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Управление пользователями</CardTitle>
                            <CardDescription>
                                Назначайте корректоров для работы с заявками из Telegram бота.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Пользователь</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead className="text-right">Корректор товаров</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.id} className="transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            {u.username}
                                            {u.id === currentUser.id && <Badge variant="secondary" className="ml-2">Вы</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{u.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.role === 'Admin' ? 'default' : 'outline'}>
                                            {u.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className={`text-xs ${u.is_items_corrector ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                                {u.is_items_corrector ? 'Активен' : 'Отключен'}
                                            </span>
                                            <Switch
                                                checked={u.is_items_corrector}
                                                onCheckedChange={() => toggleCorrector(u.id, u.is_items_corrector)}
                                                disabled={u.role === 'Admin'} // Админы и так корректоры
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

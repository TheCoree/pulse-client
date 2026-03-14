import { useState } from 'react'
import { MoreVertical, Settings, Trash2, UserMinus, UserPlus, Pencil } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import ManageAccessDialog from './manage-access-dialog'
import EditCalendarDialog from './edit-calendar-dialog'

export interface Participant {
    id: number
    username: string
    display_name?: string
    role: 'owner' | 'editor' | 'viewer'
}

export interface Calendar {
    id: number
    name: string
    description?: string
    role?: 'owner' | 'editor' | 'viewer'
    participants: Participant[]
}

const ROLE_LABELS: Record<string, { label: string, color: string }> = {
    'owner': { label: 'Владелец', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'editor': { label: 'Редактор', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'viewer': { label: 'Читатель', color: 'bg-muted text-muted-foreground' },
}

export default function CalendarCard({
    calendar,
    onRefresh,
}: {
    calendar: Calendar
    onRefresh?: () => void
}) {
    const roleInfo = calendar.role ? ROLE_LABELS[calendar.role] : null
    const [isDeleting, setIsDeleting] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showAccessDialog, setShowAccessDialog] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await api.delete(`/calendars/${calendar.id}`)
            toast.success('Календарь удален')
            onRefresh?.()
        } catch {
            toast.error('Не удалось удалить календарь')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleLeave = async () => {
        try {
            await api.delete(`/calendars/${calendar.id}/users/me`)
            toast.success('Вы покинули календарь')
            onRefresh?.()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Не удалось покинуть календарь')
        } finally {
            setShowLeaveConfirm(false)
        }
    }

    return (
        <div
            className={`
                group
                flex flex-col
                h-full
                rounded-xl
                border
                p-5
                bg-background
                hover:border-primary/50
                hover:shadow-lg
                hover:shadow-primary/5
                transition-all
                duration-300
                relative
                ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                {roleInfo && (
                    <Badge variant="outline" className={`${roleInfo.color} font-medium`}>
                        {roleInfo.label}
                    </Badge>
                )}
                
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            nativeButton={true}
                            render={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/calendars/${calendar.id}`}>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Открыть
                                </DropdownMenuItem>
                            </Link>

                            {calendar.role === 'owner' && (
                                <>
                                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Переименовать
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={() => setShowAccessDialog(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Добавить участника
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="text-red-500 focus:text-red-500"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить календарь
                                    </DropdownMenuItem>
                                </>
                            )}

                            {calendar.role !== 'owner' && (
                                <DropdownMenuItem 
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => setShowLeaveConfirm(true)}
                                >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Покинуть
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Link href={`/calendars/${calendar.id}`} className="flex-1 block">
                <div className="font-display text-lg font-semibold truncate group-hover:text-primary transition-colors">
                    {calendar.name}
                </div>

                {calendar.description && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {calendar.description}
                    </div>
                )}
            </Link>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {calendar.participants.map((p) => (
                        <Avatar 
                            key={p.id} 
                            className="h-7 w-7 border-2 border-background ring-0 transition-transform hover:-translate-y-1"
                            title={p.display_name || p.username}
                        >
                            <AvatarFallback className="text-[10px] bg-muted">
                                {(p.display_name || p.username).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                
                <Link href={`/calendars/${calendar.id}`}>
                    <Button variant="link" className="h-auto p-0 text-xs font-medium text-muted-foreground group-hover:text-primary">
                        Подробнее
                    </Button>
                </Link>
            </div>

            {/* Dialogs moved outside the dropdown menu structure to avoid premature unmounting */}
            {calendar.role === 'owner' && (
                <>
                    <EditCalendarDialog 
                        calendar={calendar}
                        open={showEditDialog}
                        onOpenChange={setShowEditDialog}
                        onRefresh={onRefresh}
                    />
                    <ManageAccessDialog
                        calendar={calendar}
                        open={showAccessDialog}
                        onOpenChange={setShowAccessDialog}
                        onRefresh={onRefresh}
                    />
                </>
            )}

            {/* Alert Dialogs for confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить календарь?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить календарь «{calendar.name}»? Это действие нельзя отменить, и все события будут потеряны.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Покинуть календарь?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите покинуть календарь «{calendar.name}»? Вы потеряете доступ к событиям, если вас не добавят снова.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                handleLeave()
                            }}
                        >
                            Покинуть
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

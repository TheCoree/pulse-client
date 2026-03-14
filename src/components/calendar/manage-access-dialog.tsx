import { useState, useEffect } from 'react'
import {
    UserPlus,
    X,
    Shield,
    ShieldCheck,
    User as UserIcon,
    Loader2,
    AlertCircle
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Calendar, Participant } from './calendar-card'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from '@/components/ui/combobox'
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

interface UserSuggestion {
    id: number
    username: string
    display_name?: string
}

interface ManageAccessDialogProps {
    calendar: Calendar
    onRefresh?: () => void
    trigger?: React.ReactElement
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function ManageAccessDialog({
    calendar,
    onRefresh,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: ManageAccessDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen

    const [isLoading, setIsLoading] = useState(false)
    const [newUsername, setNewUsername] = useState('')
    const [newRole, setNewRole] = useState<'owner' | 'editor' | 'viewer'>('viewer')

    const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Ownership transfer confirmation state
    const [showTransferConfirm, setShowTransferConfirm] = useState(false)
    const [pendingTransferData, setPendingTransferData] = useState<{ username: string, role: string } | null>(null)

    const handleAddUser = async (username?: string, role?: string) => {
        const targetUsername = username || newUsername
        const targetRole = role || newRole

        if (!targetUsername.trim()) return

        // Intercept owner assignment
        if (targetRole === 'owner' && !pendingTransferData) {
            setPendingTransferData({ username: targetUsername, role: targetRole })
            setShowTransferConfirm(true)
            return
        }

        try {
            setIsLoading(true)
            await api.post(`/calendars/${calendar.id}/users`, {
                username: targetUsername,
                role: targetRole,
            })
            toast.success(targetRole === 'owner' ? `Владение передано ${targetUsername}` : `Участник ${targetUsername} добавлен`)

            // Clear only if adding new
            if (!username) {
                setNewUsername('')
                setSuggestions([])
            }

            setPendingTransferData(null)
            onRefresh?.()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Не удалось обновить доступ')
        } finally {
            setIsLoading(false)
        }
    }

    // Debounced user search
    useEffect(() => {
        setIsSearching(true)
        const timer = setTimeout(async () => {
            try {
                const response = await api.get(`/user/search?q=${encodeURIComponent(newUsername)}`)
                setSuggestions(response.data)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsSearching(false)
            }
        }, newUsername ? 300 : 0) // Immediate for empty query

        return () => clearTimeout(timer)
    }, [newUsername])


    const handleRemoveUser = async (userId: number, username: string) => {
        try {
            await api.delete(`/calendars/${calendar.id}/users/${userId}`)
            toast.success(`Пользователь ${username} удален`)
            onRefresh?.()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Не удалось удалить пользователя')
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <ShieldCheck className="h-3 w-3 text-blue-500" />
            case 'editor': return <Shield className="h-3 w-3 text-green-500" />
            default: return <UserIcon className="h-3 w-3 text-muted-foreground" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && (
                <DialogTrigger
                    nativeButton={!trigger}
                    render={trigger}
                />
            )}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Управление доступом</DialogTitle>
                    <DialogDescription>
                        Добавьте пользователей в календарь «{calendar.name}» и настройте их роли.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Add User Section with Suggestions */}
                    <div className="flex gap-2 items-start">
                        <div className="flex-1 relative">
                            <Combobox
                                value={newUsername || ''}
                                onValueChange={(val) => setNewUsername(val || '')}
                            >
                                <ComboboxInput
                                    placeholder="Username пользователя"
                                    className="w-full"
                                    showTrigger={false}
                                />
                                <ComboboxContent sideOffset={4} align="start" className="min-w-[200px]">
                                    <ComboboxList className="min-h-[100px] flex flex-col">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            suggestions.map((user) => (
                                                <ComboboxItem key={user.id} value={user.username}>
                                                    <div className="flex flex-col">
                                                        <span>{user.username}</span>
                                                        {user.display_name && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {user.display_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </ComboboxItem>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center">
                                                {newUsername ? 'Пользователь не найден' : 'Начните вводить имя...'}
                                            </div>
                                        )}
                                        <ComboboxEmpty className="hidden" />
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                        <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="owner">Владелец</SelectItem>
                                <SelectItem value="editor">Редактор</SelectItem>
                                <SelectItem value="viewer">Читатель</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => handleAddUser()}
                            disabled={isLoading || !newUsername.trim()}
                        >
                            Добавить
                        </Button>
                    </div>

                    {/* Participants List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Участники ({calendar.participants.length})</h4>
                        <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {calendar.participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors group/item"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-[10px] bg-background border">
                                                {(participant.display_name || participant.username).slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    {participant.display_name || participant.username}
                                                </span>
                                                {getRoleIcon(participant.role)}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                @{participant.username}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {calendar.role === 'owner' && participant.role !== 'owner' ? (
                                            <Select
                                                value={participant.role}
                                                onValueChange={(val) => handleAddUser(participant.username, val as any)}
                                            >
                                                <SelectTrigger className="h-7 w-[100px] text-[10px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="owner" className="text-red-500">Владелец</SelectItem>
                                                    <SelectItem value="editor">Редактор</SelectItem>
                                                    <SelectItem value="viewer">Читатель</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] font-normal">
                                                {participant.role === 'owner' ? 'Владелец' :
                                                    participant.role === 'editor' ? 'Редактор' : 'Читатель'}
                                            </Badge>
                                        )}

                                        {calendar.role === 'owner' && participant.role !== 'owner' && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="!h-8 !w-8 text-muted-foreground text-red-500"
                                                onClick={() => handleRemoveUser(participant.id, participant.username)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>

            {/* Ownership Transfer Confirmation */}
            <AlertDialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Передача прав владельца
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите назначить пользователя <strong>{pendingTransferData?.username}</strong> владельцем календаря?
                            <br /><br />
                            После этого <strong>вы станете редактором</strong> и потеряете возможность управлять доступом и удалять календарь.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingTransferData(null)}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (pendingTransferData) {
                                    // Trigger the actual update now that we have data and confirmed
                                    handleAddUser(pendingTransferData.username, pendingTransferData.role)
                                }
                            }}
                        >
                            Подтверждаю передачу
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}

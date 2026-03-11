'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Send, CheckCircle2, Loader2,
    Edit3, X, Save, Trash2, ExternalLink, ShieldCheck, AtSign
} from 'lucide-react'
import { toast } from 'sonner'

import api from '@/lib/api'
import AppHeader from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserData {
    id: number
    username: string
    display_name: string | null
    telegram_id: number | null
    role: string
}

export default function ProfilePage() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isUnlinking, setIsUnlinking] = useState(false)
    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/me')
            setUserData(res.data)
            setDisplayName(res.data.display_name || '')
            setUsername(res.data.username || '')
        } catch (error) {
            toast.error('Ошибка при загрузке профиля')
        } finally {
            setIsLoading(false)
        }
    }

    const formatError = (error: any) => {
        const detail = error.response?.data?.detail
        if (typeof detail === 'string') return detail
        if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ')
        if (typeof detail === 'object' && detail !== null) return JSON.stringify(detail)
        return 'Непредвиденная ошибка'
    }

    const handleSaveProfile = async () => {
        // Basic client-side validation
        if (username.length < 3 || username.length > 14) {
            toast.error('Username должен быть от 3 до 14 символов')
            return
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            toast.error('Username может содержать только латиницу, цифры и подчеркивание')
            return
        }

        setIsSaving(true)
        try {
            await api.patch('/user/me', {
                display_name: displayName,
                username: username
            })
            toast.success('Профиль обновлен')
            setIsEditing(false)
            fetchProfile()
        } catch (error: any) {
            toast.error(formatError(error))
        } finally {
            setIsSaving(false)
        }
    }

    const handleConnectTelegram = async () => {
        setIsGenerating(true)
        try {
            const res = await api.post('/user/telegram/generate-token')
            const token = res.data.token
            const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'pulse_notify_bot'

            const tgLink = `tg://resolve?domain=${botUsername}&start=${token}`
            const webLink = `https://t.me/${botUsername}?start=${token}`

            window.location.href = tgLink

            toast.info('Пытаемся открыть Telegram...', {
                description: 'Если приложение не открылось, используйте прямую ссылку',
                action: {
                    label: 'Открыть t.me',
                    onClick: () => window.open(webLink, '_blank')
                }
            })
        } catch (error: any) {
            toast.error(formatError(error))
        } finally {
            setIsGenerating(false)
        }
    }

    const handleUnlinkTelegram = async () => {
        setIsUnlinking(true)
        try {
            await api.delete('/user/telegram')
            toast.success('Telegram отвязан')
            setShowUnlinkDialog(false)
            fetchProfile()
        } catch (error: any) {
            toast.error(formatError(error))
        } finally {
            setIsUnlinking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-neutral-800 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200">
            <AppHeader />

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-display font-medium text-white mb-1">Профиль</h1>
                        <p className="text-neutral-500 text-sm">Персонализация и подключение уведомлений</p>
                    </div>
                    <Button
                        variant={isEditing ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-neutral-800 hover:bg-neutral-900 transition-colors"
                    >
                        {isEditing ? <><X className="w-4 h-4 mr-2" /> Отмена</> : <><Edit3 className="w-4 h-4 mr-2" /> Изменить</>}
                    </Button>
                </div>

                <div className="space-y-8">
                    {/* Personal Info Card */}
                    <Card className="bg-neutral-900/50 border-neutral-800 overflow-hidden">
                        <CardHeader className="border-b border-neutral-900 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-neutral-500" />
                                Личные данные
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="displayName" className="text-neutral-400">Имя и фамилия</Label>
                                                <Input
                                                    id="displayName"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="Напр. Иван Иванов"
                                                    className="bg-neutral-950 border-neutral-800 focus:ring-1 focus:ring-neutral-700 h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username" className="text-neutral-400">Логин</Label>
                                                <div className="relative">
                                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                                    <Input
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                                        placeholder="username"
                                                        className="bg-neutral-950 border-neutral-800 focus:ring-1 focus:ring-neutral-700 h-11 pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto h-11 px-8 bg-neutral-100 text-neutral-950 hover:bg-white transition-all font-medium">
                                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Сохранить изменения
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col md:flex-row gap-8"
                                    >
                                        <div className="p-1 rounded-full bg-neutral-800 inline-block self-start">
                                            <div className="w-14 h-14 rounded-full bg-neutral-950 flex items-center justify-center border border-neutral-800">
                                                <User className="w-6 h-6 text-neutral-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">ФИО / Отображаемое имя</p>
                                                <p className="text-xl text-white font-medium">{userData?.display_name || <span className="text-neutral-700 italic">Не указано</span>}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">Системный логин</p>
                                                <p className="text-xl text-white font-medium flex items-center gap-1.5">
                                                    <span className="text-neutral-600">@</span>{userData?.username}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Telegram Notifications Card */}
                    <Card className="bg-neutral-900/50 border-neutral-800 transition-all overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Уведомления</CardTitle>
                            <CardDescription className="text-neutral-500">Подключение Telegram канала для оповещений</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {userData?.telegram_id ? (
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-500 font-medium">Telegram подключен</p>
                                            <p className="text-xs text-neutral-600 font-mono">ID: {userData.telegram_id}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowUnlinkDialog(true)}
                                        className="text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                                    >
                                        Отвязать
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        Вы сможете получать мгновенные уведомления о статусах ваших заявок, комментариях и важных системных событиях.
                                    </p>
                                    <Button
                                        onClick={handleConnectTelegram}
                                        disabled={isGenerating}
                                        className="w-full md:w-auto h-12 px-8 bg-[#229ED9] hover:bg-[#1e8ec3] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/5"
                                    >
                                        {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-4 w-4 fill-current" />}
                                        Подключить Telegram через бота
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Unlink Confirmation Dialog */}
            <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Отвязать Telegram?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы перестанете получать уведомления о событиях в системе. Вы сможете подключить его снова в любой момент.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUnlinking}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleUnlinkTelegram()
                            }}
                            disabled={isUnlinking}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isUnlinking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Да, отвязать"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

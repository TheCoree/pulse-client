'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { CalendarDays, FileIcon, Download, ArrowLeft, ExternalLink, Share2, Info } from 'lucide-react'
import { CorrectionOrderLightbox } from '@/components/correction/CorrectionOrderLightbox'
import { toast } from 'sonner'

interface ContentBlock {
    id: number
    order: number
    type: 'text' | 'image' | 'file'
    text?: string
    file_url?: string
}

export default function EventStandalonePage() {
    const { eventId } = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<any>(null)
    const [blocks, setBlocks] = useState<ContentBlock[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [lightboxUrls, setLightboxUrls] = useState<string[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(0)

    useEffect(() => {
        if (!eventId) return

        const fetchData = async () => {
            try {
                setIsLoading(true)
                const eventRes = await api.get(`/events/${eventId}`)
                setEvent(eventRes.data)

                const contentRes = await api.get(`/events/${eventId}/content`)
                setBlocks(contentRes.data)
            } catch (err: any) {
                console.error(err)
                setError(err.response?.data?.detail || 'Ошибка при загрузке события')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [eventId])

    const imageUrls = blocks
        .filter(b => b.type === 'image' && b.file_url)
        .map(b => `${process.env.NEXT_PUBLIC_API_URL}${b.file_url}`)

    const openLightbox = (fileUrl: string) => {
        const idx = imageUrls.findIndex(u => u.endsWith(fileUrl.split('/').pop()!))
        setLightboxIndex(Math.max(0, idx))
        setLightboxUrls(imageUrls)
    }

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Ссылка скопирована')
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505] text-zinc-400">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-500 animate-pulse">Загрузка...</p>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#050505] text-zinc-100 p-8">
                <div className="text-center space-y-8 max-w-xs">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white">Упс!</h1>
                        <p className="text-sm text-zinc-400 leading-relaxed">{error || 'Это событие скрыто или удалено'}</p>
                    </div>
                    <Button onClick={() => router.push('/')} variant="link" className="text-primary font-bold gap-2">
                        <ArrowLeft className="w-4 h-4" /> На главную
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-primary/30 selection:text-white">

            {/* Top Navbar */}
            <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900/50">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href={`/calendars/${event.calendar_id}`} className="group flex items-center gap-2.5 text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-bold text-zinc-500 hidden sm:inline">Вернуться</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl"
                            onClick={handleShare}
                            title="Скопировать ссылку"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <article className="max-w-2xl mx-auto px-6 pt-12 pb-40">

                {/* Event Header */}
                <header className="mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <span className="text-[11px] font-bold text-primary">
                                {event.calendar?.name || 'Событие'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500">
                            <Info className="w-3 h-3" />
                            <span className="text-[11px] font-bold">Детали</span>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-8 leading-[1.15] break-words selection:bg-primary">
                        {event.title}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 border-y border-zinc-900/50 py-8 mb-12">
                        {isSameDay(new Date(event.start), new Date(event.end)) ? (
                            <>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-zinc-500">Дата</p>
                                    <p className="text-lg font-bold text-zinc-100">
                                        {format(new Date(event.start), 'dd MMMM yyyy', { locale: ru })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-zinc-500">Время</p>
                                    <p className="text-lg font-bold text-zinc-100">
                                        {format(new Date(event.start), 'HH:mm', { locale: ru })} — {format(new Date(event.end), 'HH:mm', { locale: ru })}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-zinc-500">Начало</p>
                                    <p className="text-lg font-bold text-zinc-100">
                                        {format(new Date(event.start), 'dd MMMM yyyy', { locale: ru })}
                                    </p>
                                    <p className="text-sm font-medium text-zinc-400">
                                        {format(new Date(event.start), 'HH:mm', { locale: ru })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-zinc-500">Конец</p>
                                    <p className="text-lg font-bold text-zinc-100">
                                        {format(new Date(event.end), 'dd MMMM yyyy', { locale: ru })}
                                    </p>
                                    <p className="text-sm font-medium text-zinc-400">
                                        {format(new Date(event.end), 'HH:mm', { locale: ru })}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Dynamic Blocks */}
                <section className="space-y-10">
                    {blocks.length > 0 ? (
                        blocks.map((block, idx) => (
                            <div key={block.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                {block.type === 'text' && block.text && (
                                    <p className="text-lg sm:text-xl text-zinc-300 font-light leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                                        {block.text}
                                    </p>
                                )}

                                {block.type === 'image' && block.file_url && (
                                    <div
                                        className="group relative w-full aspect-video rounded-3xl overflow-hidden cursor-zoom-in transition-all active:scale-[0.98] border border-zinc-900"
                                        onClick={() => openLightbox(block.file_url!)}
                                    >
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${block.file_url}`}
                                            alt="Event Attachment"
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-4 right-4 text-white/50 group-hover:text-white transition-colors">
                                            <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'file' && block.file_url && (
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL}${block.file_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-5 p-5 rounded-[2rem] border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 transition-all group"
                                    >
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0a0a] border border-zinc-800 text-zinc-500 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-inner">
                                            <FileIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-black truncate text-zinc-100 leading-tight mb-1 break-words">
                                                {block.text || 'Прикрепленный файл'}
                                            </p>
                                            <p className="text-xs text-zinc-500 font-bold flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                                <Download className="w-3 h-3" /> Нажмите для загрузки
                                            </p>
                                        </div>
                                    </a>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center border-t border-zinc-900/50">
                            <CalendarDays className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                            <p className="text-sm font-medium text-zinc-600 italic">Описание отсутствует</p>
                        </div>
                    )}
                </section>
            </article>

            {/* Floating Action Button */}
            <footer className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none px-6">
                <div className="w-full max-w-sm pointer-events-auto shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-[2.5rem]">
                    <Button
                        className="w-full h-16 rounded-[2.5rem] bg-white text-black hover:bg-zinc-100 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] gap-3 relative overflow-hidden group shadow-xl"
                        onClick={() => router.push(`/calendars/${event.calendar_id}?event=${event.id}`)}
                    >
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ExternalLink className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Открыть в календаре</span>
                    </Button>
                </div>
            </footer>

            {/* Ambient background blur */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-900/40 blur-[120px] rounded-full" />
            </div>

            <CorrectionOrderLightbox
                isOpen={lightboxUrls.length > 0}
                onClose={() => setLightboxUrls([])}
                urls={lightboxUrls}
                initialIndex={lightboxIndex}
            />
        </div>
    )
}

'use client'

import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { CheckCircle2, AlertCircle, XCircle, Trash2, Maximize2, User as UserIcon, Calendar as CalendarIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface CorrectionOrder {
    id: number
    telegram_user_id: number
    telegram_username?: string
    telegram_full_name?: string
    description?: string
    photo_urls: string[]
    created_at: string
    is_corrected: boolean
    is_reported: boolean
    report_text?: string
    is_rejected: boolean
    is_user_confirmed: boolean
    is_updated: boolean
    reply_text?: string
    reply_photo_urls: string[]
}

interface CorrectionOrderCardProps {
    order: CorrectionOrder
    isCorrector: boolean
    onUpdateStatus: (id: number, update: any) => void
    onDelete: (id: number) => void
    onReport: (id: number) => void
    onConfirmWithReply: (id: number) => void
    onOpenLightbox: (urls: string[], index: number) => void
}

export function CorrectionOrderCard({
    order,
    isCorrector,
    onUpdateStatus,
    onDelete,
    onReport,
    onConfirmWithReply,
    onOpenLightbox
}: CorrectionOrderCardProps) {
    const tgLink = order.telegram_username
        ? `https://t.me/${order.telegram_username}`
        : `tg://user?id=${order.telegram_user_id}`

    return (
        <Card className="overflow-hidden border-muted/50 transition-all hover:border-primary/20 flex flex-col md:flex-row h-auto md:min-h-[200px] p-0">
            {/* Image Section - No padding, flush with edges, overflow-hidden for hover effect */}
            <div
                className="relative w-full md:w-60 h-60 md:h-auto bg-black/5 cursor-pointer group shrink-0 border-b md:border-b-0 md:border-r border-muted/20 overflow-hidden"
                onClick={() => onOpenLightbox(order.photo_urls, 0)}
            >
                {order.photo_urls.length > 0 ? (
                    <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${order.photo_urls[0]}`}
                        alt="Product"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground italic">Фото нет</div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white w-8 h-8" />
                </div>
                {order.photo_urls.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full font-medium">
                        {order.photo_urls.length} фото
                    </div>
                )}
            </div>

            {/* Content Section - Reduced vertical padding, no separator */}
            <div className="flex flex-col flex-grow p-4 md:p-5 min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Заявка #{order.id}</span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] uppercase font-bold py-0 h-4">Telegram</Badge>
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                            <UserIcon className="w-4 h-4 text-primary" />
                            {order.telegram_full_name || 'Без имени'}
                            {order.telegram_username && (
                                <span className="text-xs font-normal text-muted-foreground">(@{order.telegram_username})</span>
                            )}
                        </CardTitle>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {order.is_corrected && (
                            order.is_user_confirmed ? (
                                <Badge className="bg-green-600 hover:bg-green-700 text-[10px] h-5">Выполнено</Badge>
                            ) : (
                                <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 text-[10px] h-5 font-bold">Ожидает клиента</Badge>
                            )
                        )}
                        {order.is_rejected && <Badge variant="destructive" className="text-[10px] h-5">Отклонено</Badge>}
                        {order.is_reported && <Badge variant="outline" className="border-amber-500 text-amber-500 bg-amber-500/5 text-[10px] h-5 font-semibold tracking-tight">Запрос инфо</Badge>}
                        {order.is_updated && <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] h-5">Обновлено</Badge>}
                    </div>
                </div>

                <div className="flex-grow space-y-3">
                    <p className="text-foreground whitespace-pre-wrap text-[15px] leading-relaxed font-medium">
                        {order.description || <span className="text-muted-foreground italic font-normal">Без описания...</span>}
                    </p>
                    {order.is_reported && order.report_text && (
                        <div className="bg-amber-500/5 border-l-2 border-amber-500 p-2.5 rounded-r-md overflow-hidden">
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight mb-0.5">Причина запроса:</p>
                            <p className="text-xs text-amber-700 leading-snug break-all whitespace-pre-wrap">{order.report_text}</p>
                        </div>
                    )}

                    {order.reply_text && (
                        <div className="bg-green-500/5 border-l-2 border-green-500 p-2.5 rounded-r-md overflow-hidden">
                            <p className="text-[10px] text-green-700 font-bold uppercase tracking-tight mb-0.5">Ответ корректора:</p>
                            <p className="text-xs text-green-700 leading-snug break-all whitespace-pre-wrap">{order.reply_text}</p>
                        </div>
                    )}

                    {order.reply_photo_urls && order.reply_photo_urls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {order.reply_photo_urls.map((url, i) => (
                                <div
                                    key={i}
                                    className="relative w-16 h-16 rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); onOpenLightbox(order.reply_photo_urls, i); }}
                                >
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${url}`}
                                        alt={`Reply photo ${i}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <a
                                        href={tgLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors font-mono"
                                    >
                                        TG ID: {order.telegram_user_id}
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                }
                            />
                            <TooltipContent>Открыть профиль в Telegram</TooltipContent>
                        </Tooltip>
                    </div>

                    {isCorrector && (
                        <div className="flex items-center gap-1.5">
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            size="sm"
                                            disabled={order.is_user_confirmed}
                                            variant={order.is_corrected ? "secondary" : "default"}
                                            className={`h-8 px-3 text-xs font-semibold transition-all ${!order.is_corrected ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" : ""}`}
                                            onClick={() => {
                                                if (order.is_corrected) {
                                                    // Rollback logic
                                                    onUpdateStatus(order.id, {
                                                        is_corrected: false,
                                                        is_rejected: false,
                                                        is_reported: false,
                                                        report_text: null,
                                                        is_user_confirmed: false,
                                                        is_updated: false
                                                    })
                                                } else {
                                                    onConfirmWithReply(order.id)
                                                }
                                            }}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                            {order.is_corrected ? "Откатить" : "Готово"}
                                        </Button>
                                    }
                                />
                                <TooltipContent className="text-[10px]">
                                    {order.is_user_confirmed
                                        ? "Нельзя отменить, клиент уже подтвердил наличие"
                                        : (order.is_corrected ? "Сбросить статус выполнения" : "Подтвердить исправление")
                                    }
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            size="sm"
                                            disabled={order.is_user_confirmed}
                                            variant={order.is_reported ? "secondary" : "outline"}
                                            className={`h-8 w-8 p-0 rounded-md transition-all ${order.is_reported ? "bg-amber-600/20 text-amber-700 hover:bg-amber-600/30 ring-1 ring-amber-600/30" : ""}`}
                                            onClick={() => {
                                                if (order.is_reported) {
                                                    onUpdateStatus(order.id, { is_reported: false, report_text: null })
                                                } else {
                                                    onReport(order.id)
                                                }
                                            }}
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" />
                                        </Button>
                                    }
                                />
                                <TooltipContent className="text-[10px]">{order.is_user_confirmed ? "Заблокировано" : (order.is_reported ? "Отменить запрос" : "Запросить доп. информацию")}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            size="sm"
                                            disabled={order.is_user_confirmed}
                                            variant={order.is_rejected ? "destructive" : "outline"}
                                            className={`h-8 w-8 p-0 rounded-md transition-all ${order.is_rejected ? "bg-destructive text-destructive-foreground" : ""}`}
                                            onClick={() => onUpdateStatus(order.id, {
                                                is_rejected: !order.is_rejected,
                                                is_corrected: false,
                                                is_reported: false,
                                                report_text: null
                                            })}
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                        </Button>
                                    }
                                />
                                <TooltipContent className="text-[10px]">{order.is_user_confirmed ? "Заблокировано" : (order.is_rejected ? "Отменить отклонение" : "Отклонить заявку")}</TooltipContent>
                            </Tooltip>

                            <div className="w-px h-4 bg-muted mx-1" />

                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                            onClick={() => onDelete(order.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    }
                                />
                                <TooltipContent className="text-[10px]">Полностью удалить заявку</TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

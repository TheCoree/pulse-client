'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination'
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Loader2, Inbox, CheckCircle2, AlertCircle, ArrowUpDown } from 'lucide-react'

// Modular Components
import { CorrectionOrderCard } from '@/components/correction/CorrectionOrderCard'
import { CorrectionOrderLightbox } from '@/components/correction/CorrectionOrderLightbox'
import { ReplyDialog } from '@/components/correction/ReplyDialog'

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

interface ApiResponse {
    items: CorrectionOrder[]
    total: number
    skip: number
    limit: number
}

export default function CorrectionOrdersPage() {
    const { isCorrector, loading: authLoading } = useAuth()
    const [data, setData] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState("new")
    const [sort, setSort] = useState("newest")
    const limit = 10

    // State for Dialogs
    const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null)
    const [reportOrder, setReportOrder] = useState<{ id: number, text: string } | null>(null)
    const [confirmReplyOrder, setConfirmReplyOrder] = useState<number | null>(null)
    const [lightbox, setLightbox] = useState<{ urls: string[], index: number } | null>(null)

    const fetchData = useCallback(async (p: number, s: string, so: string, silent = false) => {
        if (!silent) setLoading(true)
        try {
            const skip = (p - 1) * limit
            const res = await api.get<ApiResponse>(`/correction-orders/?skip=${skip}&limit=${limit}&status_filter=${s}&sort=${so}`)
            setData(res.data)
        } catch (err) {
            toast.error('Ошибка при загрузке заявок')
        } finally {
            if (!silent) setLoading(false)
        }
    }, [limit])

    useEffect(() => {
        fetchData(page, status, sort)

        // Background auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchData(page, status, sort, true)
        }, 30000)

        return () => clearInterval(interval)
    }, [page, status, sort, fetchData])

    const handleUpdateStatus = async (id: number, update: any) => {
        let dataToUpload = update;
        let isFormData = update instanceof FormData;

        // Auto-convert plain objects to FormData since backend now uses Form fields
        if (!isFormData && typeof update === 'object' && update !== null) {
            dataToUpload = new FormData();
            Object.entries(update).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    dataToUpload.append(key, String(value));
                }
            });
            isFormData = true;
        }

        // Optimistic update
        const previousData = data;
        setData(prev => {
            if (!prev) return null;
            // For status updates, we filter out the item if it no longer matches the current view
            const updatedItems = prev.items.map(item =>
                item.id === id ? { ...item, ... (update instanceof FormData ? {} : update) } : item
            ).filter(item => {
                // If we are confirming (is_corrected: true), it should move from 'new' to 'corrected'
                const isCorrected = update instanceof FormData ? update.get('is_corrected') === 'true' : update.is_corrected;
                const isRejected = update instanceof FormData ? update.get('is_rejected') === 'true' : update.is_rejected;
                const isReported = update instanceof FormData ? update.get('is_reported') === 'true' : update.is_reported;

                if (status === 'new') {
                    // Item stays if it's NOT corrected, NOT rejected and NOT reported
                    const stays = !isCorrected && !isRejected && !isReported;
                    return stays;
                } else if (status === 'corrected') {
                    return isCorrected;
                } else if (status === 'problematic') {
                    return isRejected || isReported;
                }
                return true;
            });

            return {
                ...prev,
                items: updatedItems,
                total: prev.total - (prev.items.length - updatedItems.length)
            };
        });

        try {
            await api.patch(`/correction-orders/${id}`, dataToUpload);
            toast.success('Статус обновлен');
            fetchData(page, status, sort, true); // Silent refresh
        } catch (err: any) {
            setData(previousData); // Rollback on error
            toast.error('Не удалось обновить статус');
        }
    }

    const handleDelete = async () => {
        if (!deleteOrderId) return
        const previousData = data

        // Optimistic removal
        setData(prev => {
            if (!prev) return null
            return {
                ...prev,
                items: prev.items.filter(item => item.id !== deleteOrderId),
                total: prev.total - 1
            }
        })

        setDeleteOrderId(null)

        try {
            await api.delete(`/correction-orders/${deleteOrderId}`)
            toast.success('Заявка успешно удалена')
            fetchData(page, status, sort, true) // Silent refresh
        } catch (err) {
            setData(previousData) // Rollback
            toast.error('Ошибка при удалении')
        }
    }

    const submitReport = async () => {
        if (!reportOrder) return
        await handleUpdateStatus(reportOrder.id, {
            is_reported: true,
            report_text: reportOrder.text,
            is_corrected: false,
            is_rejected: false
        })
        setReportOrder(null)
    }

    const handleConfirmReply = async (text: string, photos: File[]) => {
        if (!confirmReplyOrder) return

        const formData = new FormData()
        formData.append('is_corrected', 'true')
        formData.append('is_rejected', 'false')
        formData.append('is_reported', 'false')
        formData.append('report_text', '')
        formData.append('is_user_confirmed', 'false')
        formData.append('is_updated', 'false')

        if (text) formData.append('reply_text', text)
        photos.forEach(photo => formData.append('reply_photos', photo))

        await handleUpdateStatus(confirmReplyOrder, formData)
        setConfirmReplyOrder(null)
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const totalPages = data ? Math.ceil(data.total / limit) : 0

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div className="flex flex-col gap-2 text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight">Заявки</h1>
                    <p className="text-muted-foreground text-lg">
                        Управляйте исправлениями товаров прямо из панели.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={sort} onValueChange={(v) => { if (v) { setSort(v); setPage(1); } }}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <ArrowUpDown className="w-4 h-4 mr-2 opacity-50" />
                            <SelectValue placeholder="Сортировка" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                            <SelectItem value="newest">Сначала новые</SelectItem>
                            <SelectItem value="oldest">Сначала старые</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }} className="mb-8">
                <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/50 p-1">
                    <TabsTrigger value="new" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Inbox className="w-4 h-4 mr-2" />
                        Новые
                    </TabsTrigger>
                    <TabsTrigger value="corrected" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Готово
                    </TabsTrigger>
                    <TabsTrigger value="problematic" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Проблемы
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse text-sm">Загрузка данных...</p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-6 mb-10 min-h-[400px]">
                        {data?.items.map((order) => (
                            <CorrectionOrderCard
                                key={order.id}
                                order={order}
                                isCorrector={isCorrector}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={setDeleteOrderId}
                                onReport={(id) => setReportOrder({ id, text: '' })}
                                onConfirmWithReply={setConfirmReplyOrder}
                                onOpenLightbox={(urls, index) => setLightbox({ urls, index })}
                            />
                        ))}

                        {data?.items.length === 0 && (
                            <div className="text-center py-24 bg-muted/20 rounded-2Xl border border-dashed border-muted/50 flex flex-col items-center gap-4">
                                <div className="p-4 bg-muted/30 rounded-full">
                                    <Inbox className="w-10 h-10 text-muted-foreground opacity-30" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-lg font-medium">Ничего не найдено</p>
                                    <p className="text-muted-foreground/60 text-sm">В этой категории пока нет заявок</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="py-6 border-t border-muted/30">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1) }}
                                            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href="#"
                                                isActive={page === i + 1}
                                                onClick={(e) => { e.preventDefault(); setPage(i + 1) }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1) }}
                                            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* ── AlertDialog for Deletion ─────────────────────────────────────────── */}
            <AlertDialog open={deleteOrderId !== null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие необратимо. Заявка #{deleteOrderId} и прикрепленные к ней фотографии будут навсегда удалены с сервера.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Dialog for Report Reason ─────────────────────────────────────────── */}
            <Dialog open={reportOrder !== null} onOpenChange={(open) => !open && setReportOrder(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Запрос доп. информации</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Опишите, какая информация нужна от пользователя..."
                            value={reportOrder?.text || ''}
                            onChange={(e) => setReportOrder(prev => prev ? { ...prev, text: e.target.value } : null)}
                            className="min-h-[100px] bg-muted/20 focus:bg-background transition-colors"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReportOrder(null)}>Отмена</Button>
                        <Button onClick={submitReport} className="bg-orange-600 hover:bg-orange-700 text-white">Отправить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog for Reply Attachments ─────────────────────────────────────── */}
            <ReplyDialog
                isOpen={confirmReplyOrder !== null}
                onClose={() => setConfirmReplyOrder(null)}
                orderId={confirmReplyOrder || 0}
                onConfirm={handleConfirmReply}
            />

            {/* ── Image Lightbox ─────────────────────────────────────────────────── */}
            {lightbox && (
                <CorrectionOrderLightbox
                    isOpen={true}
                    onClose={() => setLightbox(null)}
                    urls={lightbox.urls}
                    initialIndex={lightbox.index}
                />
            )}
        </div>
    )
}

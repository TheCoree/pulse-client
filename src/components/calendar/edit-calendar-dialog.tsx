'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from './calendar-card'

const formSchema = z.object({
    name: z.string().min(1, 'Название обязательно').max(50),
    description: z.string().max(200).optional(),
})

interface EditCalendarDialogProps {
    calendar: Calendar
    open: boolean
    onOpenChange: (open: boolean) => void
    onRefresh?: () => void
}

export default function EditCalendarDialog({ calendar, open, onOpenChange, onRefresh }: EditCalendarDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: calendar.name,
            description: calendar.description || '',
        },
    })

    // Reset form when calendar changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                name: calendar.name,
                description: calendar.description || '',
            })
        }
    }, [open, calendar, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            await api.patch(`/calendars/${calendar.id}`, values)
            toast.success('Календарь обновлен')
            onOpenChange(false)
            onRefresh?.()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Не удалось обновить календарь')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редактировать календарь</DialogTitle>
                    <DialogDescription>
                        Измените название или описание вашего календаря.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Например: Работа" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Короткое описание календаря (необязательно)" 
                                            className="resize-none"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { toast } from 'sonner'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'

const formSchema = z.object({
    name: z.string().min(1, 'Название обязательно').max(255),
    description: z.string().max(1000).optional(),
})

interface CreateCalendarDialogProps {
    onSuccess?: () => void
}

export default function CreateCalendarDialog({ onSuccess }: CreateCalendarDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true)
            await api.post('/calendars/', values)
            toast.success('Календарь создан')
            setOpen(false)
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Не удалось создать календарь')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger 
                nativeButton={true}
                render={
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Создать календарь
                    </Button>
                } 
            />
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Создать новый календарь</DialogTitle>
                    <DialogDescription>
                        Введите название и описание для вашего нового календаря.
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
                                        <Input placeholder="Например: Рабочий, Личный..." {...field} />
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
                                            placeholder="О чем этот календарь?" 
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
                                {isLoading ? 'Создание...' : 'Создать'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

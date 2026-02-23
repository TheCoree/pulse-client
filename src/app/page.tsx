'use client'

import { motion } from "framer-motion"
import { Calendar, FileText, Settings, Users } from "lucide-react"
import Link from "next/link"

import AppHeader from "@/components/app-header"
import { BackgroundBeams } from "@/components/ui/beams"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const features = [
    {
      title: "Календари",
      description: "Управляйте своими расписаниями и следите за важными событиями.",
      icon: Calendar,
      href: "/calendars",
      color: "text-blue-500",
    },
    {
      title: "Заявки",
      description: "Просматривайте и обрабатывайте заявки на корректировку данных.",
      icon: FileText,
      href: "/correction-orders",
      color: "text-purple-500",
    },
    {
      title: "Пользователи",
      description: "Управление доступом и ролями пользователей системы.",
      icon: Users,
      href: "/admin/users",
      color: "text-emerald-500",
    },
    {
      title: "Настройки",
      description: "Глобальные параметры системы и интеграции.",
      icon: Settings,
      href: "/admin/settings",
      color: "text-orange-500",
    },
  ]

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white selection:bg-purple-500/30">
      <AppHeader />

      <main className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-6 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent leading-tight">
            Система управления <br />
            <span className="text-purple-400">pulse ttm</span>
          </h1>
          <p className="text-lg text-neutral-400 leading-relaxed font-light">
            Профессиональный инструмент для работы с календарями,
            обработки заявок на корректировку и эффективного администрирования.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link href={feature.href} className="block group">
                <Card className="h-full bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:translate-y-[-4px] backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className={`p-2 w-fit rounded-lg bg-neutral-800 mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-white transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-neutral-400 mt-2 line-clamp-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* <BackgroundBeams /> */}
    </div>
  )
}
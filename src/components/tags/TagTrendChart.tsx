'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import type { MonthlyTrendData, RelatedTagData } from '@/types/tag-statistics'
import { cn } from '@/lib/utils'

interface TagTrendChartProps {
  data: MonthlyTrendData[]
  className?: string
}

export function TagTrendChart({ data, className }: TagTrendChartProps) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = (resolvedTheme ?? theme) === 'dark'

  // Refined monochromatic colors (Zinc/Slate)
  const colors = React.useMemo(() => ({
    primary: isDark ? '#e4e4e7' : '#27272a', // zinc-200 : zinc-800
    border: isDark ? '#3f3f46' : '#e4e4e7',   // zinc-700 : zinc-200
    text: isDark ? '#71717a' : '#a1a1aa',     // zinc-500 : zinc-400
    grid: isDark ? '#27272a' : '#f4f4f5',     // zinc-800 : zinc-100
    background: isDark ? '#18181b' : '#ffffff',
    tooltipBg: isDark ? '#09090b' : '#ffffff',
  }), [isDark])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      name: item.month,
      posts: item.count,
      growth: item.growthRate ?? 0,
    }))
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Publishing Trend</h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Monthly post frequency
        </p>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              className="text-[10px] font-medium"
              tick={{ fill: colors.text }}
              stroke={colors.border}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              className="text-[10px] font-medium"
              tick={{ fill: colors.text }}
              stroke={colors.border}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: colors.text,
                fontSize: '12px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: colors.text, marginBottom: '4px', fontWeight: 500 }}
              cursor={{ stroke: colors.border, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="posts"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#colorPosts)"
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0, fill: colors.primary }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface TagCorrelationChartProps {
  data: RelatedTagData[]
  className?: string
}

export function TagCorrelationChart({ data, className }: TagCorrelationChartProps) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = (resolvedTheme ?? theme) === 'dark'

  const colors = React.useMemo(() => ({
    primary: isDark ? '#e4e4e7' : '#27272a',
    border: isDark ? '#3f3f46' : '#e4e4e7',
    text: isDark ? '#71717a' : '#a1a1aa',
    background: isDark ? '#18181b' : '#ffffff',
    tooltipBg: isDark ? '#09090b' : '#ffffff',
  }), [isDark])

  const chartData = React.useMemo(() => {
    return data.slice(0, 6).map((item) => ({
      tag: item.tag.name,
      correlation: Math.round(item.correlation * 100),
      posts: item.coOccurrenceCount,
    }))
  }, [data])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        'rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Topic Correlation</h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Relationship with other tags
        </p>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid
              stroke={colors.border}
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="tag"
              tick={{ fill: colors.text, fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: colors.text, fontSize: 10 }}
              axisLine={false}
              stroke={colors.border}
            />
            <Radar
              name="Co-occurrence (%)"
              dataKey="correlation"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                color: colors.text,
                fontSize: '12px',
              }}
              cursor={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface PostDistributionHeatmapProps {
  data: Array<{ date: string; posts: number; dayOfWeek?: number }>
  className?: string
}

export function PostDistributionHeatmap({ data, className }: PostDistributionHeatmapProps) {
  const heatmapData = React.useMemo(() => {
    const grouped = new Map<number, { day: string; count: number }[]>()

    data.forEach((item) => {
      const dateUTC = new Date(item.date + 'T00:00:00Z')
      const week = Math.floor((dateUTC.getUTCDate() - 1) / 7)

      const dayOfWeek = item.dayOfWeek !== undefined
        ? item.dayOfWeek
        : dateUTC.getUTCDay()

      if (!grouped.has(week)) {
        grouped.set(week, [])
      }

      // Shortened day names
      grouped.get(week)?.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        count: item.posts,
      })
    })

    return Array.from(grouped.values()).slice(0, 4)
  }, [data])

  const getHeatColor = (count: number) => {
    // Monochromatic scale (Zinc)
    if (count === 0) return 'bg-muted/30 border border-muted/20'
    if (count <= 2) return 'bg-primary/20 border border-primary/30'
    if (count <= 5) return 'bg-primary/50 border border-primary/60'
    return 'bg-primary border border-primary/80 shadow-sm'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity Heatmap</h2>
        <p className="mt-1 text-xs text-muted-foreground/80">
          Weekly posting pattern
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-2">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-2">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: weekIndex * 0.1 + dayIndex * 0.05 }}
                  className={cn(
                    'flex-1 aspect-square rounded-md',
                    'flex items-center justify-center',
                    'transition-all duration-200 hover:scale-105',
                    getHeatColor(day.count)
                  )}
                  title={`${day.day}: ${day.count} posts`}
                >
                  <span className="text-[10px] font-medium text-foreground/70">
                    {day.day[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
          <span>Less</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted/30 border border-muted/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/50 border border-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary border border-primary/80" />
          </div>
          <span>More</span>
        </div>
      </div>
    </motion.div>
  )
}

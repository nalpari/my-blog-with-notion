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

  // 테마별 색상 정의
  const colors = React.useMemo(() => ({
    primary: isDark ? '#8b5cf6' : '#7c3aed',
    border: isDark ? '#27272a' : '#e4e4e7',
    text: isDark ? '#a1a1aa' : '#71717a',
    background: isDark ? '#18181b' : '#ffffff',
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
        'rounded-xl border border-border bg-card overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-lg font-semibold">포스트 트렌드</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          월별 포스트 발행 추이
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
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.6} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: colors.text }}
              stroke={colors.border}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: colors.text }}
              stroke={colors.border}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
              }}
              labelStyle={{ color: colors.text }}
            />
            <Area
              type="monotone"
              dataKey="posts"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#colorPosts)"
              strokeWidth={3}
              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
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

  // 테마별 색상 정의
  const colors = React.useMemo(() => ({
    primary: isDark ? '#8b5cf6' : '#7c3aed',
    border: isDark ? '#27272a' : '#e4e4e7',
    text: isDark ? '#a1a1aa' : '#71717a',
    background: isDark ? '#18181b' : '#ffffff',
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
        'rounded-xl border border-border bg-card overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border bg-gradient-to-r from-secondary/5 to-secondary/10">
        <h2 className="text-lg font-semibold">연관 태그 분석</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          함께 사용된 태그와의 상관관계
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
              tick={{ fill: colors.text, fontSize: 12 }}
              stroke={colors.border}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: colors.text }}
              stroke={colors.border}
            />
            <Radar
              name="상관관계 (%)"
              dataKey="correlation"
              stroke={colors.primary}
              fill={colors.primary}
              fillOpacity={0.5}
              strokeWidth={2}
              dot={{ r: 4, fill: colors.primary }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
              }}
            />
            <Legend />
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
      
      grouped.get(week)?.push({
        day: ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek],
        count: item.posts,
      })
    })
    
    return Array.from(grouped.values()).slice(0, 4)
  }, [data])

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-muted/30 border border-muted'
    if (count <= 2) return 'bg-primary/40 border border-primary/50'
    if (count <= 5) return 'bg-primary/70 border border-primary'
    return 'bg-primary border border-primary shadow-sm'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="p-6 border-b border-border bg-gradient-to-r from-accent/5 to-accent/10">
        <h2 className="text-lg font-semibold">포스트 활동 히트맵</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          요일별 포스트 발행 패턴
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
                    'flex-1 aspect-square rounded-lg',
                    'flex items-center justify-center',
                    'transition-all duration-200 hover:scale-110',
                    getHeatColor(day.count)
                  )}
                  title={`${day.day}: ${day.count}개 포스트`}
                >
                  <span className="text-xs font-medium text-foreground/70">
                    {day.day}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>적음</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-muted/30 border border-muted" />
            <div className="w-4 h-4 rounded bg-primary/40 border border-primary/50" />
            <div className="w-4 h-4 rounded bg-primary/70 border border-primary" />
            <div className="w-4 h-4 rounded bg-primary border border-primary shadow-sm" />
          </div>
          <span>많음</span>
        </div>
      </div>
    </motion.div>
  )
}

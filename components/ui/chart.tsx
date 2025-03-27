"use client"

import type React from "react"

import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Area } from "recharts"

export { Line, Bar, Area, CartesianGrid, XAxis, YAxis, Legend }

interface ChartTooltipContentProps {
  label: string
  payload: any[]
  labelFormatter?: (label: string) => string
  formatter?: (value: number) => string
}

export function ChartTooltipContent({ label, payload, labelFormatter, formatter }: ChartTooltipContentProps) {
  return (
    <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
      <div className="text-sm font-medium">{labelFormatter ? labelFormatter(label) : label}</div>
      <ul className="mt-2 space-y-1">
        {payload?.map((item, index) => (
          <li key={index} className="flex items-center justify-between text-xs">
            <span className="mr-2">{item.name}</span>
            <span>{formatter ? formatter(item.value) : item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ChartContainerProps {
  children: React.ReactElement
  className?: string
}

export function ChartContainer({ children, className }: ChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      {children}
    </ResponsiveContainer>
  )
}

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

export function Chart({ data, children }: ChartProps) {
  return (
    <LineChart width={500} height={300} data={data}>
      {children}
    </LineChart>
  )
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  return <Tooltip content={(props) => content as React.ReactElement} />
}


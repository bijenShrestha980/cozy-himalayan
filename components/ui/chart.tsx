import type * as React from "react"

export const ChartContainer = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const Chart = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const LineChart = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const Line = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const XAxis = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const YAxis = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const ResponsiveContainer = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const ChartTooltip = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const ChartTooltipContent = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}

export const ChartTooltipTitle = ({
  className,
  ...props
}: { className?: string; children: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div className={className} {...props}>
      {props.children}
    </div>
  )
}

export const ChartTooltipItem = ({
  className,
  label,
  value,
}: { className?: string; label: string; value: (value: any) => string }) => {
  return (
    <div className={className}>
      {label}: {value("value")}
    </div>
  )
}

export const ChartLegend = ({ className, ...props }: { className?: string; children: React.ReactNode }) => {
  return <div className={className} {...props} />
}


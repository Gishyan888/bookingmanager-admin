import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

function useChartColors() {
  const { resolved } = useTheme()
  const dark = resolved === 'dark'
  return {
    grid: dark ? '#1e293b' : '#f1f5f9',
    axis: dark ? '#64748b' : '#94a3b8',
    text: dark ? '#cbd5e1' : '#64748b',
    tooltipBg: dark ? '#0f172a' : '#ffffff',
    tooltipBorder: dark ? '#1e293b' : '#e2e8f0',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
    cursorFill: dark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.06)',
  }
}

function tooltipProps(c) {
  return {
    contentStyle: {
      background: c.tooltipBg,
      border: `1px solid ${c.tooltipBorder}`,
      borderRadius: 12,
      fontSize: 12,
      color: c.tooltipText,
      boxShadow: '0 4px 14px rgba(15,23,42,0.10)',
    },
    labelStyle: { color: c.tooltipText },
    itemStyle: { color: c.tooltipText },
    cursor: { fill: c.cursorFill },
  }
}

export function TrendAreaChart({ data, height = 280 }) {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="bookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.grid} />
        <XAxis
          dataKey="label"
          tick={{ fill: c.text, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: c.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip {...tooltipProps(c)} />
        <Legend wrapperStyle={{ fontSize: 12, color: c.text }} />
        <Area
          type="monotone"
          dataKey="bookings"
          stroke="#7c3aed"
          strokeWidth={2.4}
          fill="url(#bookings)"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2.4}
          fill="url(#revenue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function HotelsBarChart({ data, height = 280 }) {
  const c = useChartColors()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={c.grid} />
        <XAxis
          dataKey="name"
          tick={{ fill: c.text, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: c.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip {...tooltipProps(c)} />
        <Bar
          dataKey="bookings"
          radius={[6, 6, 0, 0]}
          fill="#7c3aed"
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#94a3b8']

export function RoomStatusPie({ data, height = 220 }) {
  const c = useChartColors()
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipProps(c)} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: c.text }}
          formatter={(value, entry) => {
            const item = data[entry.payload?.index ?? 0]
            const pct = total ? Math.round((item.value / total) * 100) : 0
            return (
              <span style={{ color: c.text }}>
                {value} <span style={{ color: c.axis }}>· {pct}%</span>
              </span>
            )
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

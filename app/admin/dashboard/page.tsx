"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, Package, Users } from "lucide-react"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
  ChartTooltipTitle,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total sales
        const { data: ordersData, error: ordersError } = await supabase.from("orders").select("*")

        if (ordersError) throw ordersError

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "customer")

        if (customersError) throw customersError

        // Calculate stats
        const totalSales = ordersData.reduce((sum, order) => sum + order.total, 0)
        const totalOrders = ordersData.length
        const totalCustomers = customersData.length
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

        setStats({
          totalSales,
          totalOrders,
          totalCustomers,
          averageOrderValue,
        })

        // Get recent orders
        const { data: recent, error: recentError } = await supabase
          .from("orders")
          .select("*, users(first_name, last_name)")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentError) throw recentError
        setRecentOrders(recent)

        // Generate mock sales data for the chart
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return {
            date: date.toISOString().split("T")[0],
            sales: Math.floor(Math.random() * 5000) + 1000,
          }
        })

        setSalesData(last30Days)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+15% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+7.2% from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                        minTickGap={10}
                      />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent>
                            <ChartTooltipTitle>Sales</ChartTooltipTitle>
                            <ChartTooltipItem
                              label="Date"
                              value={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              }
                            />
                            <ChartTooltipItem label="Sales" value={(value) => `$${value}`} />
                          </ChartTooltipContent>
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        strokeWidth={2}
                        activeDot={{
                          r: 6,
                          style: { fill: "var(--color-primary)", opacity: 0.8 },
                        }}
                        style={{
                          stroke: "var(--color-primary)",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>You have {stats.totalOrders} total orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.users.first_name} {order.users.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">Order #{order.id.substring(0, 8)}</p>
                      </div>
                      <div className="ml-auto font-medium">${order.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: "Jan", electronics: 2000, clothing: 1400, home: 800 },
                        { name: "Feb", electronics: 1800, clothing: 1600, home: 900 },
                        { name: "Mar", electronics: 2200, clothing: 1800, home: 1000 },
                        { name: "Apr", electronics: 2600, clothing: 2000, home: 1200 },
                        { name: "May", electronics: 2400, clothing: 2200, home: 1100 },
                        { name: "Jun", electronics: 2800, clothing: 2400, home: 1300 },
                      ]}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent>
                            <ChartTooltipTitle>Sales by Category</ChartTooltipTitle>
                            <ChartTooltipItem label="Electronics" value={(value) => `$${value}`} />
                            <ChartTooltipItem label="Clothing" value={(value) => `$${value}`} />
                            <ChartTooltipItem label="Home" value={(value) => `$${value}`} />
                          </ChartTooltipContent>
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="electronics"
                        strokeWidth={2}
                        style={{ stroke: "var(--color-primary)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clothing"
                        strokeWidth={2}
                        style={{ stroke: "var(--color-secondary)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="home"
                        strokeWidth={2}
                        style={{ stroke: "var(--color-muted-foreground)" }}
                      />
                      <ChartLegend />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Wireless Earbuds", category: "Electronics", sales: 245 },
                    { name: "Smart Watch", category: "Electronics", sales: 185 },
                    { name: "Cotton T-Shirt", category: "Clothing", sales: 152 },
                    { name: "Kitchen Blender", category: "Home", sales: 132 },
                    { name: "Yoga Mat", category: "Fitness", sales: 108 },
                  ].map((product, i) => (
                    <div key={i} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="ml-auto font-medium">{product.sales} sold</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


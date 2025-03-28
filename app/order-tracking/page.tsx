"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Package, Search, Truck } from "lucide-react"

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [trackingId, setTrackingId] = useState("")
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login?redirect=/order-tracking")
        return
      }

      setUser(session.user)
      fetchOrders(session.user.id)
    }

    checkUser()
  }, [router])

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsTracking(true)

    try {
      // In a real app, you would fetch tracking information from a shipping API
      // For this example, we'll just find the order in the user's orders
      const order = orders.find((o) => o.id.substring(0, 8) === trackingId || o.id === trackingId)
      setTrackedOrder(order || null)
    } catch (error) {
      console.error("Error tracking order:", error)
    } finally {
      setIsTracking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusSteps = (status: string) => {
    const allSteps = [
      { name: "Order Placed", icon: Package, completed: true },
      { name: "Processing", icon: Package, completed: ["processing", "shipped", "delivered"].includes(status) },
      { name: "Shipped", icon: Truck, completed: ["shipped", "delivered"].includes(status) },
      { name: "Delivered", icon: Package, completed: status === "delivered" },
    ]
    return allSteps
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Order Tracking</h1>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="track" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="track">Track an Order</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Track Your Order</CardTitle>
              <CardDescription>Enter your order ID to track your shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter order ID"
                    className="pl-8"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isTracking}>
                  {isTracking ? "Tracking..." : "Track"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {trackedOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Order #{trackedOrder.id.substring(0, 8)}</CardTitle>
                <CardDescription>Placed on {formatDate(trackedOrder.created_at)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <h3 className="font-medium">
                    Status: {trackedOrder.status.charAt(0).toUpperCase() + trackedOrder.status.slice(1)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {trackedOrder.status === "pending" && "Your order has been received and is awaiting processing."}
                    {trackedOrder.status === "processing" && "Your order is being processed and prepared for shipping."}
                    {trackedOrder.status === "shipped" && "Your order has been shipped and is on its way to you."}
                    {trackedOrder.status === "delivered" && "Your order has been delivered."}
                    {trackedOrder.status === "cancelled" && "Your order has been cancelled."}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute left-5 top-0 h-full w-0.5 bg-muted"></div>
                  <div className="space-y-8">
                    {getStatusSteps(trackedOrder.status).map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div
                          className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${
                            step.completed ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className="font-medium">{step.name}</h4>
                          {step.completed && (
                            <p className="text-sm text-muted-foreground">
                              {index === 0 && formatDate(trackedOrder.created_at)}
                              {index === 1 && "Your order is being prepared"}
                              {index === 2 && "Your order is on its way"}
                              {index === 3 && "Your order has arrived"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p className="text-sm">
                    {trackedOrder.shipping_address.name}
                    <br />
                    {trackedOrder.shipping_address.address}
                    <br />
                    {trackedOrder.shipping_address.city}, {trackedOrder.shipping_address.state}{" "}
                    {trackedOrder.shipping_address.postal_code}
                    <br />
                    {trackedOrder.shipping_address.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
              <CardDescription>View and track your recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                  <Link href="/products">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-md">
                      <div>
                        <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                        <div className="mt-2">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <div className="mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTrackingId(order.id.substring(0, 8))
                              setTrackedOrder(order)
                              document.querySelector('[data-value="track"]')?.click()
                            }}
                          >
                            Track Order
                          </Button>
                          <Link href={`/order-details/${order.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


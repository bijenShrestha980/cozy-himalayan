"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // In a real app, you would fetch payment data from Supabase
        // For this example, we'll use mock data
        const mockPayments = Array.from({ length: 10 }, (_, i) => ({
          id: `pay_${Math.random().toString(36).substring(2, 10)}`,
          order_id: `ord_${Math.random().toString(36).substring(2, 10)}`,
          amount: Math.floor(Math.random() * 500) + 50,
          status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
          method: ["paypal", "credit_card"][Math.floor(Math.random() * 2)],
          customer_name: ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis"][Math.floor(Math.random() * 4)],
          date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        }))

        setPayments(mockPayments)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching payments:", error)
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
        <h2 className="text-3xl font-bold tracking-tight">Payment Management</h2>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
            <TabsTrigger value="credit_card">Credit Card</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search payments..." className="w-full pl-8" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>All Payments</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.order_id}</TableCell>
                      <TableCell>{payment.customer_name}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{payment.method === "paypal" ? "PayPal" : "Credit Card"}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="paypal" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>PayPal Payments</CardTitle>
              <CardDescription>View and manage PayPal payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments
                    .filter((payment) => payment.method === "paypal")
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.order_id}</TableCell>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="credit_card" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Credit Card Payments</CardTitle>
              <CardDescription>View and manage credit card payment transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments
                    .filter((payment) => payment.method === "credit_card")
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.order_id}</TableCell>
                        <TableCell>{payment.customer_name}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                        <TableCell>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle>PayPal Integration Settings</CardTitle>
          <CardDescription>Configure your PayPal payment gateway settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="client-id" className="text-sm font-medium">
              PayPal Client ID
            </label>
            <Input id="client-id" placeholder="Enter your PayPal client ID" />
          </div>
          <div className="space-y-2">
            <label htmlFor="secret" className="text-sm font-medium">
              PayPal Secret
            </label>
            <Input id="secret" type="password" placeholder="Enter your PayPal secret" />
          </div>
          <div className="space-y-2">
            <label htmlFor="mode" className="text-sm font-medium">
              Environment
            </label>
            <Select defaultValue="sandbox">
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  )
}


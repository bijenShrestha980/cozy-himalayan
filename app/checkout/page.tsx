"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { CartItem, Product } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<(CartItem & { product: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("paypal")
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  })
  const [processingPayment, setProcessingPayment] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login?redirect=/checkout")
          return
        }

        setUser(session.user)

        // Fetch user profile to pre-fill shipping info
        // Use a direct query without RLS checks to avoid recursion
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          // Continue without user data
        } else if (userData) {
          setShippingInfo({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            postalCode: userData.postal_code || "",
            country: userData.country || "US",
            phone: userData.phone || "",
          })
        }

        fetchCartItems(session.user.id)
      } catch (error) {
        console.error("Error checking user:", error)
        toast({
          title: "Error",
          description: "There was a problem loading your information. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    checkUser()
  }, [router, toast])

  const fetchCartItems = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("cart_items").select("*, product:products(*)").eq("user_id", userId)

      if (error) throw error

      if (!data || data.length === 0) {
        router.push("/cart")
        toast({
          title: "Empty cart",
          description: "Your cart is empty. Add some products before checkout.",
          variant: "destructive",
        })
        return
      }

      setCartItems(data)
    } catch (error) {
      console.error("Error fetching cart items:", error)
      toast({
        title: "Error",
        description: "There was a problem loading your cart items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessingPayment(true)

    try {
      // In a real app, you would process payment with PayPal SDK here
      // For this example, we'll simulate a successful payment

      // Create order in database using a function to avoid RLS issues
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          userId: user.id,
          total: calculateTotal(),
          shippingAddress: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            address: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postal_code: shippingInfo.postalCode,
            country: shippingInfo.country,
          },
          paymentMethod: paymentMethod,
          cartItems: cartItems.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      })

      if (error) throw error

      if (data && data.orderId) {
        // Redirect to success page
        router.push(`/order-confirmation/${data.orderId}`)
      } else {
        throw new Error("No order ID returned")
      }
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
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
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your shipping details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="paypal" onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="credit_card">Credit Card</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paypal" className="p-4">
                    <div className="flex items-center justify-center p-6 border rounded-md">
                      <img src="/placeholder.svg?height=60&width=120&text=PayPal" alt="PayPal" className="h-12" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      You will be redirected to PayPal to complete your purchase securely.
                    </p>
                  </TabsContent>
                  <TabsContent value="credit_card" className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name-on-card">Name on Card</Label>
                      <Input id="name-on-card" placeholder="John Doe" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={processingPayment}>
                  {processingPayment ? "Processing..." : `Pay $${calculateTotal().toFixed(2)}`}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


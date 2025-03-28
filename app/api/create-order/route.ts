import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // If we don't have the service role key, we can't bypass RLS
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { userId, total, shippingAddress, paymentMethod, cartItems } = await request.json()

    // Validate input
    if (!userId || !total || !shippingAddress || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create order using service role to bypass RLS
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          status: "pending",
          total,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
        },
      ])
      .select()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    if (!orderData || orderData.length === 0) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    const orderId = orderData[0].id

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Clear cart
    const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (clearCartError) {
      console.error("Error clearing cart:", clearCartError)
      // Continue anyway, as the order is already created
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error("Error processing order:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}


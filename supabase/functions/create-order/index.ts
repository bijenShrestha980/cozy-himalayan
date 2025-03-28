// supabase/functions/create-order/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    )

    // Get the request body
    const { userId, total, shippingAddress, paymentMethod, cartItems } = await req.json()

    // Validate input
    if (!userId || !total || !shippingAddress || !cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }

    // Create order using service role to bypass RLS
    const { data: orderData, error: orderError } = await supabaseClient
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
      throw orderError
    }

    if (!orderData || orderData.length === 0) {
      throw new Error("Failed to create order")
    }

    const orderId = orderData[0].id

    // Create order items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabaseClient.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      throw itemsError
    }

    // Clear cart
    const { error: clearCartError } = await supabaseClient.from("cart_items").delete().eq("user_id", userId)

    if (clearCartError) {
      console.error("Error clearing cart:", clearCartError)
      // Continue anyway, as the order is already created
    }

    return new Response(JSON.stringify({ success: true, orderId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing order:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})


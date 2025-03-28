import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  // In development, we'll log a warning
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Missing Supabase environment variables. Make sure to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }
  // In production, we'll throw an error
  else {
    throw new Error("Missing Supabase environment variables")
  }
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  created_at: string
  stock_quantity: number
}

export type Order = {
  id: string
  user_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  created_at: string
  payment_intent_id?: string
  shipping_address: {
    name: string
    address: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export type User = {
  id: string
  email: string
  role: "admin" | "customer"
  first_name?: string
  last_name?: string
  created_at: string
}

export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export type CartItem = {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}


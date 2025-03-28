"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function addToCart(productId: string, quantity = 1) {
  try {
    if (!productId) {
      return {
        success: false,
        message: "Invalid product ID",
      }
    }

    // Get the current session
    const cookieStore = cookies()
    const supabaseClient = supabase

    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      // Instead of redirecting, return a result indicating authentication is required
      return {
        success: false,
        message: "Authentication required",
        requiresAuth: true,
        redirectUrl: "/auth/login?redirect=/products",
      }
    }

    const userId = session.user.id

    // IMPORTANT: Check if the user exists in the users table
    const { data: userExists, error: userCheckError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError || !userExists) {
      // User doesn't exist in the users table, create the record
      console.log("User not found in users table, creating record...")

      const { error: insertUserError } = await supabaseClient.from("users").insert([
        {
          id: userId,
          email: session.user.email,
          role: "customer",
          // Add any other required fields with default values
          first_name: session.user.user_metadata?.first_name || "",
          last_name: session.user.user_metadata?.last_name || "",
        },
      ])

      if (insertUserError) {
        console.error("Error creating user record:", insertUserError)
        throw new Error("Failed to create user record: " + insertUserError.message)
      }
    }

    // Now check if the product exists
    const { data: productExists, error: productCheckError } = await supabaseClient
      .from("products")
      .select("id")
      .eq("id", productId)
      .single()

    if (productCheckError || !productExists) {
      return {
        success: false,
        message: "Product not found",
      }
    }

    // Check if the product is already in the cart
    const { data: existingCartItem, error: checkError } = await supabaseClient
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    if (existingCartItem) {
      // Update quantity if item exists
      const { error: updateError } = await supabaseClient
        .from("cart_items")
        .update({ quantity: existingCartItem.quantity + quantity })
        .eq("id", existingCartItem.id)

      if (updateError) throw updateError
    } else {
      // Add new item to cart
      const { error: insertError } = await supabaseClient.from("cart_items").insert([
        {
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        },
      ])

      if (insertError) throw insertError
    }

    // Revalidate the cart page to reflect changes
    revalidatePath("/cart")

    return { success: true, message: "Item added to cart" }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add item to cart",
    }
  }
}

export async function getCartItemsCount() {
  try {
    const cookieStore = cookies()
    const supabaseClient = supabase

    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return 0
    }

    const userId = session.user.id

    // Check if user exists in users table
    const { data: userExists } = await supabaseClient.from("users").select("id").eq("id", userId).single()

    if (!userExists) {
      return 0 // Return 0 if user doesn't exist in users table
    }

    const { data, error, count } = await supabaseClient
      .from("cart_items")
      .select("*", { count: "exact" })
      .eq("user_id", userId)

    if (error) throw error

    return count || 0
  } catch (error) {
    console.error("Error getting cart count:", error)
    return 0
  }
}


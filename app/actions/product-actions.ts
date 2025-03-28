"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { deleteFromBlob } from "@/lib/blob"

export async function updateProductImages(productId: string, imageUrls: string[]) {
  try {
    const cookieStore = cookies()
    const supabaseClient = supabase

    // Get the current session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return {
        success: false,
        message: "Authentication required",
      }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || userData?.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      }
    }

    // Update product with new image URLs
    const { error: updateError } = await supabaseClient
      .from("products")
      .update({
        image_url: imageUrls[0] || null, // Primary image
        additional_images: imageUrls.slice(1), // Additional images
      })
      .eq("id", productId)

    if (updateError) {
      throw updateError
    }

    // Revalidate product pages
    revalidatePath(`/products/${productId}`)
    revalidatePath("/products")
    revalidatePath("/admin/products")

    return {
      success: true,
      message: "Product images updated successfully",
    }
  } catch (error) {
    console.error("Error updating product images:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update product images",
    }
  }
}

export async function deleteProductImage(productId: string, imageUrl: string) {
  try {
    const cookieStore = cookies()
    const supabaseClient = supabase

    // Get the current session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return {
        success: false,
        message: "Authentication required",
      }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || userData?.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      }
    }

    // Get current product data
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("image_url, additional_images")
      .eq("id", productId)
      .single()

    if (productError) {
      throw productError
    }

    // Update product images
    const updatedData: { image_url?: string | null; additional_images?: string[] } = {}

    if (product.image_url === imageUrl) {
      // If deleting the primary image
      updatedData.image_url = product.additional_images?.[0] || null
      updatedData.additional_images = product.additional_images?.slice(1) || []
    } else if (product.additional_images?.includes(imageUrl)) {
      // If deleting from additional images
      updatedData.additional_images = product.additional_images.filter((url) => url !== imageUrl)
    }

    // Update product
    const { error: updateError } = await supabaseClient.from("products").update(updatedData).eq("id", productId)

    if (updateError) {
      throw updateError
    }

    // Delete from Blob storage
    await deleteFromBlob(imageUrl)

    // Revalidate product pages
    revalidatePath(`/products/${productId}`)
    revalidatePath("/products")
    revalidatePath("/admin/products")

    return {
      success: true,
      message: "Product image deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting product image:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete product image",
    }
  }
}


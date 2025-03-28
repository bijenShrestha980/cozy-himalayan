import { put, del, list, type PutBlobResult } from "@vercel/blob"

/**
 * Uploads a file to Vercel Blob storage
 * @param file The file to upload
 * @param folder Optional folder path to organize files
 * @returns Promise with the upload result
 */
export async function uploadToBlob(file: File, folder = "uploads"): Promise<PutBlobResult> {
  try {
    // Generate a unique filename with original extension
    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return blob
  } catch (error) {
    console.error("Error uploading to Blob:", error)
    throw error
  }
}

/**
 * Deletes a file from Vercel Blob storage
 * @param url The URL of the file to delete
 * @returns Promise with the deletion result
 */
export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("Error deleting from Blob:", error)
    throw error
  }
}

/**
 * Lists files in a folder in Vercel Blob storage
 * @param prefix The folder prefix to list files from
 * @returns Promise with the list of files
 */
export async function listBlobFiles(prefix = "uploads"): Promise<any> {
  try {
    const files = await list({
      prefix,
    })

    return files
  } catch (error) {
    console.error("Error listing Blob files:", error)
    throw error
  }
}


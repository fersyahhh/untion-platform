import { supabase } from "../../../lib/supabase";

/**
 * Upload PDF file to Supabase Storage
 * @param roomId - Room UUID
 * @param file - PDF File object
 * @returns Public URL of uploaded file
 */
export async function uploadPdf(roomId: string, file: File): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${roomId}/${timestamp}-${sanitizedName}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from("room-presentations")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }

  // Get public URL (signed URL for private bucket)
  const { data: urlData } = supabase.storage
    .from("room-presentations")
    .getPublicUrl(data.path);

  if (!urlData?.publicUrl) {
    throw new Error("Failed to get PDF URL");
  }

  return urlData.publicUrl;
}

/**
 * Delete PDF file from Supabase Storage
 * @param pdfUrl - Full URL of the PDF file
 */
export async function deletePdf(pdfUrl: string): Promise<void> {
  // Extract path from URL
  const url = new URL(pdfUrl);
  const pathParts = url.pathname.split("/storage/v1/object/public/room-presentations/");
  
  if (pathParts.length < 2) {
    throw new Error("Invalid PDF URL");
  }
  
  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from("room-presentations")
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete PDF: ${error.message}`);
  }
}

/**
 * Get PDF download URL (for private bucket access)
 * @param pdfUrl - Stored PDF URL
 * @param expiresIn - Expiry time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL for download
 */
export async function getPdfDownloadUrl(
  pdfUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  // Extract path from URL
  const url = new URL(pdfUrl);
  const pathParts = url.pathname.split("/storage/v1/object/public/room-presentations/");
  
  if (pathParts.length < 2) {
    return pdfUrl; // Return as-is if can't parse
  }
  
  const filePath = pathParts[1];

  const { data, error } = await supabase.storage
    .from("room-presentations")
    .createSignedUrl(filePath, expiresIn);

  if (error || !data?.signedUrl) {
    return pdfUrl; // Fallback to original URL
  }

  return data.signedUrl;
}

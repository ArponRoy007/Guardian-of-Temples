export type UploadFolder =
  | "incident-evidence"
  | "temple-admin-requests"
  | "temple-posts";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export interface UploadImageOptions {
  file: File;
  folder: UploadFolder;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Uploads an image file to Cloudinary via our signed Next.js API route (/api/cloudinary-upload).
 * Supports real-time upload progress tracking.
 */
export async function uploadImage({
  file,
  folder,
  onProgress,
}: UploadImageOptions): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();

    // Track upload progress if callback provided
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      let responseJson: any;
      try {
        responseJson = JSON.parse(xhr.responseText);
      } catch (e) {
        return reject(new Error("Server returned an invalid JSON response."));
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (!responseJson.secure_url || !responseJson.public_id) {
          return reject(new Error("Upload succeeded but missing secure URL or public ID."));
        }
        resolve({
          url: responseJson.secure_url,
          publicId: responseJson.public_id,
        });
      } else {
        const errorMsg =
          responseJson.error || `Upload failed with status code ${xhr.status}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred while uploading image."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Image upload request timed out."));
    };

    xhr.open("POST", "/api/cloudinary-upload", true);
    xhr.send(formData);
  });
}

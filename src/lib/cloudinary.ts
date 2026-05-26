// src/lib/cloudinary.ts

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

export interface CloudinaryUploadResult {
  publicId: string;
  url: string; // https URL
  secureUrl: string; // https URL (dùng cái này)
  width: number;
  height: number;
  duration?: number; // chỉ có với video
  format: string;
  resourceType: "image" | "video";
}

export async function uploadToCloudinary(file: File, onProgress?: (progress: number) => void): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "mood-story/uploads");

    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 95); // 95% khi upload xong, 100% sau parse
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        onProgress?.(100);
        resolve({
          publicId: data.public_id,
          url: data.url,
          secureUrl: data.secure_url,
          width: data.width,
          height: data.height,
          duration: data.duration,
          format: data.format,
          resourceType: data.resource_type,
        });
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", UPLOAD_URL);
    xhr.send(formData);
  });
}

// Helper: lấy thumbnail URL từ video Cloudinary
export function getVideoThumbnail(publicId: string, atSecond = 0): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_${atSecond},w_512,h_512,c_fill/${publicId}.jpg`;
}

// Helper: resize image để tiết kiệm token khi gửi OpenAI
export function getOptimizedUrl(secureUrl: string, width = 512): string {
  return secureUrl.replace("/upload/", `/upload/w_${width},c_limit,q_auto/`);
}

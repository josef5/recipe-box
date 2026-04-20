import { v2 as cloudinary } from "cloudinary";

type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCloudinaryEnv(): CloudinaryEnv | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured() {
  return getCloudinaryEnv() !== null;
}

export function createSignedUploadPayload({
  folder,
  timestamp = Math.floor(Date.now() / 1000),
}: {
  folder: string;
  timestamp?: number;
}) {
  const env = getCloudinaryEnv();

  if (!env) {
    throw new Error("Cloudinary is not configured.");
  }

  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    env.apiSecret,
  );

  return {
    cloudName: env.cloudName,
    apiKey: env.apiKey,
    folder,
    timestamp,
    signature,
  };
}

export async function destroyCloudinaryImage(publicId: string) {
  const trimmedPublicId = publicId.trim();

  if (!trimmedPublicId) {
    return;
  }

  const env = getCloudinaryEnv();

  if (!env) {
    return;
  }

  cloudinary.config({
    cloud_name: env.cloudName,
    api_key: env.apiKey,
    api_secret: env.apiSecret,
  });

  await cloudinary.uploader.destroy(trimmedPublicId, {
    resource_type: "image",
    invalidate: true,
  });
}

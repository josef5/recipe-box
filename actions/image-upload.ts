"use server";

import {
  createSignedUploadPayload,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { requireCurrentUser } from "@/lib/auth/session";

export async function getCloudinarySignature(): Promise<
  | {
      ok: true;
      data: {
        cloudName: string;
        apiKey: string;
        folder: string;
        timestamp: number;
        signature: string;
      };
    }
  | {
      ok: false;
      error: string;
    }
> {
  const user = await requireCurrentUser();

  if (!isCloudinaryConfigured()) {
    return {
      ok: false,
      error: "Cloudinary is not configured.",
    };
  }

  const data = createSignedUploadPayload({
    folder: `recipe-box/${user.id}`,
  });

  return { ok: true, data };
}

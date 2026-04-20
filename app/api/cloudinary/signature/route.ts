import {
  createSignedUploadPayload,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { requireCurrentUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

type SignatureResult =
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
    };

export async function POST(): Promise<NextResponse<SignatureResult>> {
  try {
    const user = await requireCurrentUser();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Cloudinary is not configured.",
        },
        { status: 500 },
      );
    }

    const data = createSignedUploadPayload({
      folder: `recipe-box/${user.id}`,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create upload signature.",
      },
      { status: 500 },
    );
  }
}

import { RecipeInput } from "@/lib/schemas/recipe";
import Image from "next/image";
import { useRef, useState } from "react";
import { useController, type Control, type Path } from "react-hook-form";
import { Button } from "./button";
import { FieldErrorMessage } from "./field-error-mesage";
import { Input } from "./input";
import { Label } from "./label";

export function ImageUpload({
  control,
  name = "imageUrl",
  publicIdName = "imagePublicId",
  label = "Image URL",
  accept = "image/*",
}: {
  control: Control<RecipeInput>;
  name?: Path<RecipeInput>;
  publicIdName?: Path<RecipeInput>;
  label?: string;
  accept?: string;
}) {
  const { field } = useController<RecipeInput, Path<RecipeInput>>({
    name,
    control,
  });
  const { field: publicIdField } = useController<
    RecipeInput,
    Path<RecipeInput>
  >({
    name: publicIdName,
    control,
  });
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function uploadSelectedImage() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const sigRes = await fetch("/api/cloudinary/signature", {
        method: "POST",
      });
      const sigJson = await sigRes.json();
      if (!sigRes.ok || !sigJson.ok)
        throw new Error(sigJson.error ?? "Unable to sign");

      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("folder", sigJson.data.folder);
      fd.append("timestamp", String(sigJson.data.timestamp));
      fd.append("signature", sigJson.data.signature);
      fd.append("api_key", sigJson.data.apiKey);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigJson.data.cloudName}/image/upload`,
        { method: "POST", body: fd },
      );
      const up = await uploadRes.json();
      if (!uploadRes.ok || !up.secure_url || !up.public_id) {
        throw new Error(up.error?.message ?? "Upload failed");
      }

      field.onChange(up.secure_url);
      publicIdField.onChange(up.public_id);
      setSelectedFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="imageUrl">{label}</Label>
      <Input
        id="imageUrl"
        value={field.value as string | undefined}
        onChange={(e) => field.onChange(e.target.value)}
      />
      <Input
        name={publicIdName}
        type="hidden"
        value={publicIdField.value as string | undefined}
      />
      <p className="text-xs">
        Upload to Cloudinary or paste any external image URL.
      </p>
      <div aria-live="polite" className="flex flex-wrap items-center gap-3">
        <Label htmlFor="recipe-image-file">Upload image file</Label>
        <Input
          id="recipe-image-file"
          ref={imageInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null);
            setUploadError(null);
          }}
          className="w-full"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={!selectedFile || isUploading}
          onClick={uploadSelectedImage}
          aria-busy={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload image"}
        </Button>
        {field.value ? (
          <Button
            type="button"
            variant="destructive-secondary"
            onClick={() => {
              field.onChange("");
              publicIdField.onChange("");
              setUploadError(null);
            }}
          >
            Remove image
          </Button>
        ) : null}
      </div>
      {uploadError ? (
        <FieldErrorMessage text={uploadError} id="image-upload-error" />
      ) : null}
      {field.value ? (
        <Image
          src={field.value as string}
          alt="Preview"
          width={1200}
          height={800}
          className="mt-2 max-h-64 w-full rounded-md border object-cover"
          unoptimized
        />
      ) : null}
      <FieldErrorMessage text={undefined} id="image-url-error" />
    </div>
  );
}

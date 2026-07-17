import { getCloudinarySignature } from "@/actions/image-upload";
import { RecipeInput } from "@/lib/schemas/recipe";
import { useRef, useState } from "react";
import { useController, type Control, type Path } from "react-hook-form";
import { Button } from "./button";
import { FieldErrorMessage } from "./field-error-mesage";
import { Input } from "./input";
import { Label } from "./label";
import { RecipeImage } from "./recipe-image";

type UploadData = {
  secure_url?: string;
  public_id?: string;
  error?: { message: string };
};

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
      const signature = await getCloudinarySignature();

      if (!signature.ok) throw new Error(signature.error ?? "Unable to sign");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", signature.data.folder);
      formData.append("timestamp", String(signature.data.timestamp));
      formData.append("signature", signature.data.signature);
      formData.append("api_key", signature.data.apiKey);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.data.cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      const uploadData = (await uploadResponse.json()) as UploadData;

      if (
        !uploadResponse.ok ||
        !uploadData.secure_url ||
        !uploadData.public_id
      ) {
        throw new Error(uploadData.error?.message ?? "Upload failed");
      }

      field.onChange(uploadData.secure_url);
      publicIdField.onChange(uploadData.public_id);
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
      <p className="mb-2 text-xs">
        Upload to Cloudinary or paste any external image URL.
      </p>
      <Label htmlFor="recipe-image-file">Select image file</Label>
      <input
        // File input for selecting an image file
        // Styled to look like a button and display the selected file name
        // Displays a file name when a file is selected
        id="recipe-image-file"
        ref={imageInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          setSelectedFile(e.target.files?.[0] ?? null);
          setUploadError(null);
        }}
        className="cursor-pointer text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:px-4 file:py-2"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!selectedFile || isUploading}
          showSpinner={isUploading}
          onClick={uploadSelectedImage}
          aria-busy={isUploading}
          className="flex-1"
        >
          Upload image
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
            className="flex-1"
          >
            Remove image
          </Button>
        ) : null}
      </div>
      <FieldErrorMessage
        text={uploadError ?? undefined}
        id="image-upload-error"
      />
      {field.value ? (
        <RecipeImage
          src={field.value as string}
          alt="Preview"
          width={1200}
          height={800}
          className="mt-2 max-h-64 w-full rounded-md object-cover"
          unoptimized
          loading="eager"
        />
      ) : null}
    </div>
  );
}

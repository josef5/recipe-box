"use client";

import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type RecipeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

/**
 * Renders recipe images and gracefully falls back to the local placeholder
 * when a remote image URL fails to load.
 */
export function RecipeImage({ src, alt, onError, ...props }: RecipeImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const resolvedSrc = hasLoadError || !src ? FALLBACK_RECIPE_IMAGE_SRC : src;

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        onError?.(event);
        if (!hasLoadError) {
          setHasLoadError(true);
        }
      }}
    />
  );
}

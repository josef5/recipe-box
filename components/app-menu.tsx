import Link from "next/link";
import React from "react";

export function AppMenu({
  variant,
  editHref,
}: {
  variant: "home" | "recipe";
  editHref?: string;
}) {
  if (variant === "home") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <Link href="/signin">Sign In</Link>
      </div>
    );
  } else if (variant === "recipe") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <div className="flex items-center space-x-4">
          <Link href="/">Back</Link>
          {editHref && <Link href={editHref}>Edit</Link>}
        </div>
      </div>
    );
  }

  return null;
}

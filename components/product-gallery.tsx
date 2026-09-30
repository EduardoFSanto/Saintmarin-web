"use client";

import { useState } from "react";

type ProductGalleryProps = {
  coverImage: string | null;
  images: Array<{
    id: string;
    imageUrl: string;
  }>;
  productName: string;
};

export function ProductGallery({
  coverImage,
  images,
  productName,
}: ProductGalleryProps) {
  const allImages = [
    ...(coverImage
      ? [{ id: "cover", imageUrl: coverImage }]
      : []),
    ...images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
    })),
  ];

  const [selectedId, setSelectedId] = useState(
    allImages[0]?.id ?? "",
  );

  const selected =
    allImages.find((image) => image.id === selectedId) ??
    allImages[0];

  if (!selected) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[#ece9e3]">
        <span className="text-[9px] uppercase tracking-[0.5em] text-black/20">
          Saint Marin
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#ece9e3]">
        <img
          src={selected.imageUrl}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {allImages.length > 1 && (
        <div className="mt-4">
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {allImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedId(image.id)}
                aria-label={
                  index === 0
                    ? "Ver foto principal"
                    : `Ver foto ${index + 1}`
                }
                className={`w-20 shrink-0 overflow-hidden border bg-[#ece9e3] transition md:w-24 ${
                  selected.id === image.id
                    ? "border-black"
                    : "border-black/10 hover:border-black/40"
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt=""
                  className="aspect-[4/5] w-full object-cover"
                />
              </button>
            ))}
          </div>

          <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-black/35">
            Deslize para ver mais fotos
          </p>
        </div>
      )}
    </div>
  );
}

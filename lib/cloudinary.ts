const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImageToCloudinary(
  file: File,
): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured",
    );
  }

  if (!UPLOAD_PRESET) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not configured",
    );
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to upload image to Cloudinary",
    );
  }

  const data = (await response.json()) as {
    secure_url?: string;
  };

  if (!data.secure_url) {
    throw new Error(
      "Cloudinary did not return an image URL",
    );
  }

  return data.secure_url;
}

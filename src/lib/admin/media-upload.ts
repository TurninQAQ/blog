export const MAX_ADMIN_IMAGE_BYTES = 10 * 1024 * 1024;

const acceptedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const managedMediaUrlPattern = /^\/media\/(c[a-z0-9]{24})\.webp$/;

export type UploadedAdminImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export class AdminImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminImageUploadError";
  }
}

export function validateAdminImageFile(file: File) {
  if (!acceptedImageTypes.has(file.type.toLowerCase())) {
    throw new AdminImageUploadError("请选择 JPEG、PNG 或 WebP 图片。");
  }

  if (file.size === 0) {
    throw new AdminImageUploadError("图片文件不能为空。");
  }

  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    throw new AdminImageUploadError("图片文件不能超过 10 MiB。");
  }
}

export async function uploadAdminImage(file: File) {
  validateAdminImageFile(file);

  const body = new FormData();
  body.append("file", file, file.name || "clipboard-image");

  let response: Response;

  try {
    response = await fetch("/api/admin/media", {
      method: "POST",
      credentials: "same-origin",
      body,
    });
  } catch {
    throw new AdminImageUploadError("图片上传失败，请检查网络后重试。");
  }

  const responseText = await response.text().catch(() => "");
  let payload:
    | (Partial<UploadedAdminImage> & {
        error?: string;
      })
    | null = null;

  try {
    const parsed = JSON.parse(responseText) as unknown;

    if (typeof parsed === "object" && parsed !== null) {
      payload = parsed as Partial<UploadedAdminImage> & { error?: string };
    }
  } catch {
    // The CSRF and authentication guards intentionally return plain text.
  }

  if (!response.ok) {
    const plainTextError = response.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("text/plain")
      ? responseText.trim().slice(0, 200)
      : "";

    throw new AdminImageUploadError(
      payload?.error || plainTextError || "图片上传失败，请重试。",
    );
  }

  if (
    !payload ||
    typeof payload.id !== "string" ||
    typeof payload.url !== "string" ||
    typeof payload.width !== "number" ||
    typeof payload.height !== "number"
  ) {
    throw new AdminImageUploadError("图片服务返回了无效结果。");
  }

  const managedUrl = managedMediaUrlPattern.exec(payload.url);

  if (
    !managedUrl ||
    managedUrl[1] !== payload.id ||
    !Number.isSafeInteger(payload.width) ||
    payload.width < 1 ||
    !Number.isSafeInteger(payload.height) ||
    payload.height < 1
  ) {
    throw new AdminImageUploadError("图片服务返回了无效结果。");
  }

  return {
    id: payload.id,
    url: payload.url,
    width: payload.width,
    height: payload.height,
  } satisfies UploadedAdminImage;
}

export function firstClipboardImage(clipboardData: DataTransfer) {
  return Array.from(clipboardData.files).find((file) =>
    file.type.toLowerCase().startsWith("image/"),
  );
}

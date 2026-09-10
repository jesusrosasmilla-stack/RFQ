import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;

/** Guarda una imagen subida en public/uploads/<subdir>/ y devuelve la URL pública. */
export async function saveUploadedImage(file: File, subdir: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no debe superar 8 MB.");
  }

  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}

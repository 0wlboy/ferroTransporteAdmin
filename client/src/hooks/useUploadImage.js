import { useState, useCallback } from "react";
import { supabase } from "../../utils/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un nombre de archivo único basado en timestamp y sufijo aleatorio.
 * @param {string} originalName - Nombre original del archivo (usado para preservar la extensión).
 */
function generateUniqueFileName(originalName) {
  const extension = originalName.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Decodifica una cadena en base64 y la convierte en un ArrayBuffer para la subida de archivos en React Native.
 * @param {string} base64 - Cadena en formato base64.
 */
function decodeBase64(base64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const base640 = lookup[base64.charCodeAt(i)];
    const base641 = lookup[base64.charCodeAt(i + 1)];
    const base642 = lookup[base64.charCodeAt(i + 2)];
    const base643 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (base640 << 2) | (base641 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((base641 & 15) << 4) | (base642 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((base642 & 3) << 6) | (base643 & 63);
    }
  }
  return arrayBuffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `useUploadImage` — Hook para subir imágenes a Supabase Storage.
 *
 * Gestiona el ciclo completo de subida: conversión de URI local o File → Blob →
 * upload a Storage → obtención de la URL pública.
 *
 * Características:
 * - Compatible con imágenes seleccionadas por `ImagePicker` o `ProfilePicker` (tanto File/Blob de navegador como PickedImage).
 * - Maneja estados de carga y error de forma reactiva.
 * - Genera nombres únicos para evitar colisiones en el bucket.
 * - Devuelve la URL pública directamente lista para guardar en la base de datos.
 *
 * Uso básico:
 * ```javascript
 * const { uploadImage, uploading, error, publicUrl } = useUploadImage();
 *
 * const handleSave = async () => {
 *   const url = await uploadImage(pickedImage, {
 *     bucket: 'usuarios',
 *     userAuthId: 'userId123',
 *   });
 *   if (url) {
 *     await saveUserProfile({ avatarUrl: url });
 *   }
 * };
 * ```
 */
export default function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);

  // ───────────────────────────────────────────────────────────────────────
  // RESET
  // ───────────────────────────────────────────────────────────────────────

  /** Limpia el error y la URL pública, dejando el hook listo para un nuevo intento. */
  const reset = useCallback(() => {
    setError(null);
    setPublicUrl(null);
  }, []);

  // ───────────────────────────────────────────────────────────────────────
  // UPLOAD
  // ───────────────────────────────────────────────────────────────────────

  const uploadImage = useCallback(
    async (image, options = {}) => {
      const {
        bucket = "fotosPerfil",
        uniqueFileName = false,
        userAuthId,
        upsert = true,
      } = options;

      setUploading(true);
      setError(null);
      setPublicUrl(null);

      try {
        if (!image) {
          throw new Error("No se ha proporcionado ninguna imagen para subir.");
        }

        // ── 1. Determinar el nombre final y tipo del archivo ──
        let rawName = "image.jpg";
        let mimeType = "image/jpeg";
        let uploadData;

        // Comprobar si es un archivo/blob estándar de navegador o un objeto con base64/uri
        if (image instanceof File || image instanceof Blob) {
          rawName = image.name || `image_${Date.now()}.jpg`;
          mimeType = image.type || "image/jpeg";
          uploadData = image;
        } else if (typeof image === "object") {
          rawName = image.fileName || `image_${Date.now()}.jpg`;
          mimeType = image.mimeType ?? image.type ?? "image/jpeg";

          if (image.base64) {
            console.log("[useUploadImage] Usando representación en base64 de la imagen...");
            uploadData = decodeBase64(image.base64);
          } else if (image.uri) {
            console.log("[useUploadImage] Base64 no disponible, usando puente XHR como fallback...");
            uploadData = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = function () {
                resolve(xhr.response);
              };
              xhr.onerror = function (e) {
                console.error("[useUploadImage] Error en XHR Puente:", e);
                reject(new TypeError("Network request failed"));
              };
              xhr.responseType = "blob";
              xhr.open("GET", image.uri, true);
              xhr.send(null);
            });
          } else {
            throw new Error("El objeto de imagen provisto no contiene base64 o uri válidos.");
          }
        } else {
          throw new Error("Formato de imagen inválido.");
        }

        const fileName = uniqueFileName
          ? generateUniqueFileName(rawName)
          : rawName;

        let folderPath = userAuthId;

        // Si no se proporciona userAuthId, intentamos obtenerlo de la sesión activa
        // para garantizar que cumple con la política RLS del bucket
        if (!folderPath) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            folderPath = session.user.id;
          }
        }

        // Construir la ruta completa dentro del bucket
        const storagePath = folderPath ? `${folderPath}/${fileName}` : fileName;

        // ── 2. Preparar el archivo (ArrayBuffer o Blob para React Native) ──
        console.log("=== REVISANDO RUTA DE SUBIDA ===");
        console.log("Bucket:", bucket);
        console.log("Ruta construida (storagePath):", storagePath);

        // ── 3. Subir al bucket de Supabase Storage ──
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, uploadData, {
            contentType: mimeType,
            upsert,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // ── 4. Obtener la URL pública del archivo subido ──
        const { data } = supabase.storage
          .from(bucket)
          .getPublicUrl(storagePath);

        if (!data?.publicUrl) {
          throw new Error("No se pudo obtener la URL pública de la imagen.");
        }

        setPublicUrl(data.publicUrl);
        return data.publicUrl;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error desconocido al subir la imagen.";
        console.error("[useUploadImage] Error al subir imagen:", message);
        setError(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { uploadImage, uploading, error, publicUrl, reset };
}

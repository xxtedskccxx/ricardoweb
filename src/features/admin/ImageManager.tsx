"use client";

import { useCallback, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import {
  requestUploadSignature,
  persistUploadedImage,
  reorderProductImages,
  removeProductImage,
  updateImageAlt,
} from "@/server/actions/image";
import { detailImageSrc } from "@/lib/cloudinary/loader";
import { MAX_IMAGE_BYTES, LOW_RESOLUTION_WARNING_WIDTH } from "@/schemas/image";

export interface ManagedImage {
  id: string;
  publicId: string;
  width: number;
  height: number;
  alt: string | null;
  position: number;
}

interface UploadItem {
  key: string;
  file: File;
  progress: number;
  status: "uploading" | "verifying" | "done" | "error";
  error?: string;
}

interface ImageManagerProps {
  productId: string;
  initialImages: ManagedImage[];
}

function uploadToCloudinary(
  file: File,
  signature: Awaited<ReturnType<typeof requestUploadSignature>>,
  onProgress: (percent: number) => void,
): Promise<{ public_id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
        return;
      }

      // Surface Cloudinary's real error instead of a generic message —
      // the response body is `{"error":{"message":"...","http_code":N}}`.
      let providerMessage: string | null = null;
      try {
        const body = JSON.parse(xhr.responseText) as {
          error?: { message?: string };
        };
        providerMessage = body?.error?.message ?? null;
      } catch {
        // Non-JSON body (e.g. an HTML error page from a proxy) — fall through.
      }

      if (process.env.NODE_ENV !== "production") {
        console.error("[cloudinary upload]", {
          status: xhr.status,
          providerMessage,
          responseText: xhr.responseText,
        });
      }

      reject(
        new Error(
          providerMessage
            ? `Cloudinary rechazó la imagen: ${providerMessage}`
            : `Error al subir la imagen a Cloudinary (HTTP ${xhr.status}).`,
        ),
      );
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Error de red al subir la imagen.")),
    );

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    );
    xhr.send(formData);
  });
}

export function ImageManager({ productId, initialImages }: ImageManagerProps) {
  const [images, setImages] = useState<ManagedImage[]>(
    initialImages.slice().sort((a, b) => a.position - b.position),
  );
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const uploadOne = useCallback(
    async (file: File, key: string) => {
      try {
        const signature = await requestUploadSignature(productId);
        const uploaded = await uploadToCloudinary(file, signature, (pct) =>
          setUploads((prev) =>
            prev.map((u) => (u.key === key ? { ...u, progress: pct } : u)),
          ),
        );

        setUploads((prev) =>
          prev.map((u) =>
            u.key === key ? { ...u, status: "verifying", progress: 100 } : u,
          ),
        );

        const result = await persistUploadedImage({
          productId,
          publicId: uploaded.public_id,
        });

        if (!result.success || !result.data) {
          setUploads((prev) =>
            prev.map((u) =>
              u.key === key
                ? { ...u, status: "error", error: result.error }
                : u,
            ),
          );
          return;
        }

        setImages((prev) => [...prev, result.data!]);
        setUploads((prev) => prev.filter((u) => u.key !== key));
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) =>
            u.key === key
              ? {
                  ...u,
                  status: "error",
                  error: err instanceof Error ? err.message : "Error inesperado.",
                }
              : u,
          ),
        );
      }
    },
    [productId],
  );

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    const newUploads: UploadItem[] = files.map((file) => ({
      key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "uploading" as const,
      error:
        file.size > MAX_IMAGE_BYTES
          ? "Supera el tamaño máximo de 15 MB."
          : undefined,
    }));

    setUploads((prev) => [
      ...prev,
      ...newUploads.map((u) => (u.error ? { ...u, status: "error" as const } : u)),
    ]);

    for (const item of newUploads) {
      if (!item.error) void uploadOne(item.file, item.key);
    }
  }

  function retryUpload(item: UploadItem) {
    setUploads((prev) =>
      prev.map((u) =>
        u.key === item.key
          ? { ...u, status: "uploading", progress: 0, error: undefined }
          : u,
      ),
    );
    void uploadOne(item.file, item.key);
  }

  async function persistOrder(next: ManagedImage[]) {
    setReorderError(null);
    const previous = images;
    setImages(next);
    const result = await reorderProductImages({
      productId,
      orderedImageIds: next.map((img) => img.id),
    });
    if (!result.success) {
      setImages(previous);
      setReorderError(result.error ?? "No se pudo reordenar.");
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    void persistOrder(arrayMove(images, oldIndex, newIndex));
  }

  function makeCover(imageId: string) {
    const index = images.findIndex((img) => img.id === imageId);
    if (index <= 0) return;
    const next = arrayMove(images, index, 0);
    void persistOrder(next);
  }

  async function handleRemove(imageId: string) {
    const previous = images;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    const result = await removeProductImage(imageId, productId);
    if (!result.success) {
      setImages(previous);
      setReorderError(result.error ?? "No se pudo eliminar la imagen.");
    }
  }

  async function handleAltChange(imageId: string, alt: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, alt } : img)),
    );
    await updateImageAlt({ imageId, alt });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]"
        >
          + Subir imágenes
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <span className="flex-1 truncate">{item.file.name}</span>
              {item.status === "error" ? (
                <>
                  <span className="text-[var(--color-danger)]">
                    {item.error}
                  </span>
                  <button
                    type="button"
                    onClick={() => retryUpload(item)}
                    className="font-medium text-[var(--color-olive)]"
                  >
                    Reintentar
                  </button>
                </>
              ) : (
                <span className="text-[var(--color-ink-muted)]">
                  {item.status === "verifying" ? "Verificando…" : `${item.progress}%`}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {reorderError && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {reorderError}
        </p>
      )}

      {images.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Aún no hay imágenes. La portada será la primera que subas.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  isCover={index === 0}
                  onMakeCover={() => makeCover(image.id)}
                  onRemove={() => handleRemove(image.id)}
                  onAltChange={(alt) => handleAltChange(image.id, alt)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableImageCard({
  image,
  isCover,
  onMakeCover,
  onRemove,
  onAltChange,
}: {
  image: ManagedImage;
  isCover: boolean;
  onMakeCover: () => void;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lowRes = image.width < LOW_RESOLUTION_WARNING_WIDTH;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-bone)]">
        <Image
          src={detailImageSrc(image.publicId)}
          alt={image.alt ?? ""}
          fill
          sizes="200px"
          className="object-cover"
        />
        {isCover && (
          <span className="absolute left-2 top-2 rounded-[var(--radius-pill)] bg-[var(--color-olive)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-ivory)]">
            Portada
          </span>
        )}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Arrastrar para reordenar"
          className="absolute right-2 top-2 flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-[var(--color-surface)]/90 text-[var(--color-ink)] active:cursor-grabbing"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <circle cx="9" cy="6" r="1.4" />
            <circle cx="15" cy="6" r="1.4" />
            <circle cx="9" cy="12" r="1.4" />
            <circle cx="15" cy="12" r="1.4" />
            <circle cx="9" cy="18" r="1.4" />
            <circle cx="15" cy="18" r="1.4" />
          </svg>
        </button>
      </div>

      {lowRes && (
        <p className="text-[11px] text-[var(--color-reserved)]">
          Resolución baja ({image.width}px)
        </p>
      )}

      <input
        type="text"
        defaultValue={image.alt ?? ""}
        onBlur={(e) => onAltChange(e.target.value)}
        placeholder="Texto alternativo"
        className="h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-xs"
      />

      <div className="flex items-center justify-between gap-1">
        {!isCover && (
          <button
            type="button"
            onClick={onMakeCover}
            className="text-xs font-medium text-[var(--color-olive)]"
          >
            Usar como portada
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto text-xs font-medium text-[var(--color-danger)]"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

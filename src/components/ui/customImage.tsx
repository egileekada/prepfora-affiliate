"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { ModalLayout } from "../layouts";
import { cn } from "@/lib/utils";

export interface StaticImageData {
    src: string;
    height?: number;
    width?: number;
    blurDataURL?: string;
}

export type ImgSrc = string | StaticImageData;

export type Layout = "fill" | "height" | "width" | "intrinsic";

export interface CustomImageProps
    extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
    src: ImgSrc;
    alt: string;
    fallbackSrc?: ImgSrc;

    /**
     * fill       -> fills parent (parent must be relative)
     * height     -> fills height, width auto
     * width      -> fills width, height auto
     * intrinsic  -> normal image
     */
    layout?: Layout;

    /**
     * Only used when layout="fill"
     */
    objectFit?: "cover" | "contain";

    /**
     * Creates an aspect ratio box
     * Example: 16/9
     */
    aspectRatio?: number;

    overlayer?: boolean;
    disablePreview?: boolean;
    className?: string;
    imageClassName?: string;
    priority?: boolean;
    borderRadius?: string;
}

function isStaticImage(src: ImgSrc): src is StaticImageData {
    return typeof src === "object" && src !== null;
}

function getSrcUrl(src: ImgSrc): string {
    return isStaticImage(src) ? src.src : src;
}

export default function CustomImage({
    src,
    alt,
    fallbackSrc = "/images/fallback.png",

    layout = "intrinsic",
    objectFit = "cover",
    aspectRatio,

    overlayer = false,
    disablePreview = false,
    imageClassName = "",

    priority = false,
    borderRadius,

    ...rest
}: CustomImageProps) {
    const [imgSrc, setImgSrc] = useState<ImgSrc>(src);
    const [previewSrc, setPreviewSrc] = useState<ImgSrc | null>(null);

    const isStatic = isStaticImage(imgSrc);

    const handleError = () => {
        if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
        }
    };

    const openPreview = () => {
        if (!disablePreview) {
            setPreviewSrc(imgSrc);
        }
    };

    const closePreview = () => setPreviewSrc(null);

    const fitClass =
        objectFit === "contain" ? "object-contain" : "object-cover";

    const {
        width,
        height,
        className,
        ...imageRest
    } = rest;

    const currentSrcUrl = getSrcUrl(imgSrc);

    const sharedProps = {
        src: currentSrcUrl,
        alt,
        onError: handleError,
        loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
        ...imageRest,
    };

    const renderOverlay = () =>
        overlayer && (
            <div className="absolute inset-0 rounded-lg bg-black/40" />
        );

    const renderModal = () => (
        <ModalLayout
            size="lg"
            title="Preview Image"
            open={!!previewSrc}
            onOpenChange={closePreview}
        >
            <div className="relative flex h-125 w-full items-center justify-center rounded-2xl bg-gray-200">
                {previewSrc && (
                    <img
                        src={getSrcUrl(previewSrc)}
                        alt={alt}
                        className="h-full w-full object-contain p-4"
                    />
                )}
            </div>
        </ModalLayout>
    );

    // ==========================================
    // Aspect Ratio
    // ==========================================

    if (aspectRatio) {
        return (
            <>
                <div
                    onClick={openPreview}
                    className={cn("relative w-full", className)}
                    style={{
                        paddingTop: `${(1 / aspectRatio) * 100}%`,
                    }}
                >
                    <img
                        {...sharedProps}
                        style={{ borderRadius, ...rest.style }}
                        className={cn("absolute inset-0 h-full w-full", fitClass, imageClassName)}
                    />

                    {renderOverlay()}
                </div>

                {renderModal()}
            </>
        );
    }

    // ==========================================
    // Fill Parent
    // ==========================================

    if (layout === "fill") {
        return (
            <>
                <div
                    onClick={openPreview}
                    className={cn(
                        "relative h-full w-full cursor-pointer",
                        className
                    )}
                >
                    <img
                        {...sharedProps}
                        style={{ borderRadius, ...rest.style }}
                        className={cn("absolute inset-0 h-full w-full", fitClass, imageClassName)}
                    />

                    {renderOverlay()}
                </div>

                {renderModal()}
            </>
        );
    }

    // ==========================================
    // Fill Height
    // ==========================================

    if (layout === "height") {
        return (
            <>
                <div
                    onClick={openPreview}
                    className={cn(
                        "relative h-full w-fit cursor-pointer",
                        className
                    )}
                >
                    <img
                        {...sharedProps}
                        width={isStatic ? imgSrc.width : width ? Number(width) : undefined}
                        height={isStatic ? imgSrc.height : height ? Number(height) : undefined}
                        style={{ borderRadius, ...rest.style }}
                        className={cn(
                            "h-full w-auto max-w-none",
                            imageClassName
                        )}
                    />

                    {renderOverlay()}
                </div>

                {renderModal()}
            </>
        );
    }

    // ==========================================
    // Fill Width
    // ==========================================

    if (layout === "width") {
        return (
            <>
                <div
                    onClick={openPreview}
                    className={cn("relative w-full cursor-pointer", className)}
                >
                    <img
                        {...sharedProps}
                        width={isStatic ? imgSrc.width : width ? Number(width) : undefined}
                        height={isStatic ? imgSrc.height : height ? Number(height) : undefined}
                        style={{ borderRadius, ...rest.style }}
                        className={cn("h-auto w-full", imageClassName)}
                    />

                    {renderOverlay()}
                </div>

                {renderModal()}
            </>
        );
    }

    // ==========================================
    // Intrinsic
    // ==========================================

    return (
        <>
            <div
                onClick={openPreview}
                className={cn("relative inline-block cursor-pointer", className)}
            >
                <img
                    {...sharedProps}
                    width={isStatic ? imgSrc.width : width}
                    height={isStatic ? imgSrc.height : height}
                    style={{ borderRadius, ...rest.style }}
                    className={cn(imageClassName)}
                />

                {renderOverlay()}
            </div>

            {renderModal()}
        </>
    );
}
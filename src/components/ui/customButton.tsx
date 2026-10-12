"use client";

import { Button } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import type { CustomVariants } from "@/types/ui";

type HeroVariants = NonNullable<ComponentProps<typeof Button>["variant"]>;

interface AppButtonProps
    extends Omit<
        ComponentProps<typeof Button>,
        | "children"
        | "onPress"
        | "type"
        | "variant"
        | "size"
        | "className"
        | "startContent"
        | "endContent"
    > {
    children: ReactNode;
    onPress?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: CustomVariants;
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    fullWidth?: boolean;
    startContent?: ReactNode;
    endContent?: ReactNode;
    role?: string;
    "aria-label"?: string;
    "aria-selected"?: boolean;
}

export function AppButton({
    children,
    onPress,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className,
    fullWidth,
    startContent,
    endContent,
    ...rest
}: AppButtonProps) {
    // ✅ Real HeroUI variants
    const heroVariants: HeroVariants[] = [
        "ghost",
        "outline",
        "danger",
        "danger-soft",
        "tertiary",
    ];

    const isHeroVariant = heroVariants.includes(variant as HeroVariants);
    const isCustomPrimary = variant === "primary";

    // ✅ Custom styles
    const customClasses = clsx({
        "bg-primary-300 text-white transition-all duration-300 hover:bg-primary-250 hover:text-white":
            variant === "primary",
        "border border-primary-300 bg-white text-primary-300 transition-all duration-300 ease-in-out hover:bg-grey-02 hover:border-primary-300 hover:text-primary-300 hover:bg-primary-100":
            variant === "primary-outline",
        "bg-secondary-350 text-neutral-500 transition-all duration-300 ease-in-out hover:bg-secondary-350  ":
            variant === "secondary-btn",
        "border border-secondary-350 bg-white text-secondary-500 transition-all duration-300 ease-in-out hover:bg-secondary-50 ":
            variant === "secondary-outline",
        " bg-error-300 text-white transition-all duration-300 ease-in-out hover:bg-error-250  ":
            variant === "error",
        " bg-primary-150 text-neutral-500 transition-all duration-300 ease-in-out hover:bg-primary-100 ":
            variant === "disabled",
    });

    return (
        <Button
            type={type}
            onPress={onPress}
            isDisabled={disabled || loading}
            variant={isHeroVariant ? (variant as HeroVariants) : "ghost"} // ✅ fallback
            // size={size}
            style={{
                height:
                    size === "lg" ? "60px" : size === "md" ? "52px" : "40px",
            }}
            {...rest}
            className={clsx(
                (isCustomPrimary || !isHeroVariant || variant === "outline") &&
                customClasses, // apply for custom variants
                fullWidth ? " w-full " : " w-fit ",
                size === "lg"
                    ? " h-10 lg:h-15 "
                    : size === "md"
                        ? " h-10 lg:h-13 "
                        : " h-10 ",
                " rounded-xl font-semibold text-sm ", // base styles
                className,
            )}
        >
            {!loading && (
                <>
                    {startContent}
                    {children}
                    {endContent}
                </>
            )}
            {loading && (
                <p className=" text-sm font-semibold " >Loading...</p>
            )}
        </Button>
    );
}

import type { Button } from "@heroui/react";
import type { ComponentProps } from "react";

type HeroVariants = NonNullable<ComponentProps<typeof Button>["variant"]>;

export type CustomVariants =
    | HeroVariants
    | "primary"
    | "primary-outline"
    | "secondary-btn"
    | "secondary-outline"
    | "error"
    | "disabled";

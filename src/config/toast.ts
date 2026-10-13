import { toast } from "@heroui/react";

export const showSuccess = (message: string) => {
    toast.success("Success", {
        description: message,
    });
}; 

export const showError = (message: string) => {
    toast.danger("Error", {
        description: message,
    });
};

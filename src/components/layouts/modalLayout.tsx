import type { ReactNode } from "react";
import { Modal } from "@heroui/react";

interface AppModalProps {
    trigger?: ReactNode;
    title?: string;
    description?: ReactNode;
    icon?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    containerClass?: string;
    size?: "cover" | "full" | "lg" | "md" | "sm" | "xs";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showClose?: boolean;
    nospace?: boolean;
}

export function AppModal({
    trigger,
    title,
    description,
    icon,
    children,
    footer,
    containerClass,
    size = "sm",
    open,
    onOpenChange,
    showClose = true,
    nospace
}: AppModalProps) {
    return (
        <Modal isOpen={open} onOpenChange={onOpenChange}>
            {trigger ? (
                <Modal.Trigger>{trigger}</Modal.Trigger>
            ) : (
                <Modal.Trigger
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                />
            )}

            <Modal.Backdrop>
                <Modal.Container size={size} className={containerClass}>
                    <Modal.Dialog className={`bg-white text-black! rounded-2xl ${nospace ? " px-0! " : ""}`}>
                        {showClose && <Modal.CloseTrigger />}

                        {/* Header */}
                        {(title || icon) && (
                            <Modal.Header className="px-4">
                                {icon && (
                                    <Modal.Icon className="bg-white text-black">
                                        {icon}
                                    </Modal.Icon>
                                )}
                                {title && (
                                    <Modal.Heading>{title}</Modal.Heading>
                                )}
                            </Modal.Header>
                        )}

                        {/* Body */}
                        <Modal.Body className="bg-white text-black">
                            {description && <p>{description}</p>}
                            {children}
                        </Modal.Body>

                        {/* Footer */}
                        {footer && <Modal.Footer>{footer}</Modal.Footer>}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}

export default AppModal;

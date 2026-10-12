"use client";

import { Checkbox, CheckboxGroup, Description, Label } from "@heroui/react";
import { useField, useFormikContext, getIn } from "formik";
import { Danger } from "iconsax-reactjs";

interface CheckboxOption {
    label?: string;
    value: string;
    description?: string;
    disabled?: boolean;
}

interface FormikCheckboxGroupProps {
    name?: string;
    label?: string;
    description?: string;
    options: CheckboxOption[];

    // controlled mode
    value?: string[];
    onChange?: (value: string[]) => void;

    disabled?: boolean;
    className?: string;
    itemClassName?: string;
}

interface CheckboxGroupViewProps
    extends Omit<FormikCheckboxGroupProps, "onChange" | "value"> {
    inputValue: string[];
    handleChange: (values: string[]) => void;
    hasError: boolean;
    error?: string;
}

function CheckboxGroupView({
    name,
    label,
    description,
    options,
    disabled = false,
    className,
    itemClassName,
    inputValue,
    handleChange,
    hasError,
    error,
}: CheckboxGroupViewProps) {
    return (
        <div className={`flex flex-col gap-2 ${className || ""}`}>
            <CheckboxGroup
                name={name}
                value={inputValue}
                onChange={handleChange}
                isDisabled={disabled}
            >
                {label && (
                    <Label className="text-sm font-medium text-grey-04">
                        {label}
                    </Label>
                )}

                {description && (
                    <Description className="text-xs text-grey-03">
                        {description}
                    </Description>
                )}

                <div className="flex flex-col gap-2">
                    {options.map((item) => (
                        <Checkbox
                            key={item.value}
                            value={item.value}
                            isDisabled={item.disabled}
                            className={`items-center gap-2 ${itemClassName || ""}`}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>

                            <Checkbox.Content>
                                {item.label && (
                                    <Label className="text-sm font-medium">
                                        {item.label}
                                    </Label>
                                )}

                                {item.description && (
                                    <Description className="text-xs mt-1 text-grey-04">
                                        {item.description}
                                    </Description>
                                )}
                            </Checkbox.Content>
                        </Checkbox>
                    ))}
                </div>
            </CheckboxGroup>

            {/* ERROR */}
            {hasError && (
                <div className="flex gap-1 items-center text-red-500">
                    <Danger size={18} color="#fb2c36" />
                    <p className="text-xs capitalize">{error}</p>
                </div>
            )}
        </div>
    );
}

function FormikCheckboxGroupConnected({
    name,
    ...props
}: FormikCheckboxGroupProps & { name: string }) {
    const [field] = useField<string[]>(name);
    const formik = useFormikContext<Record<string, unknown>>();

    const inputValue = field.value || [];
    const error = getIn(formik.errors, name);
    const touched = getIn(formik.touched, name);
    const hasError = Boolean(error && touched);

    const handleChange = (values: string[]) => {
        formik.setFieldValue(name, values);
        formik.setFieldTouched(name, true);
    };

    return (
        <CheckboxGroupView
            {...props}
            name={name}
            inputValue={inputValue}
            handleChange={handleChange}
            hasError={hasError}
            error={error ? String(error) : undefined}
        />
    );
}

function StandaloneCheckboxGroup(props: FormikCheckboxGroupProps) {
    const inputValue = props.value || [];

    const handleChange = (values: string[]) => {
        props.onChange?.(values);
    };

    return (
        <CheckboxGroupView
            {...props}
            inputValue={inputValue}
            handleChange={handleChange}
            hasError={false}
        />
    );
}

export default function FormikCheckboxGroup(props: FormikCheckboxGroupProps) {
    if (props.name) {
        return <FormikCheckboxGroupConnected {...props} name={props.name} />;
    }
    return <StandaloneCheckboxGroup {...props} />;
}

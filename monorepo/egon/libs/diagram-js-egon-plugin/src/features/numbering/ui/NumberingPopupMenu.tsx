import { html, useState } from "diagram-js/lib/ui";

interface PopupProps {
    x: number;
    y: number;
    label?: string;
    index?: number;
    isMultiple?: boolean;
    onUpdate: (label: string, index: number | undefined, isMultiple: boolean) => void;
    onCancel: () => void;
}

export default function NumberingPopupMenu(props: PopupProps) {
    const x = props.x;
    const y = props.y;
    const onUpdate: (
        label: string,
        index: number | undefined,
        isMultiple: boolean,
    ) => void = props.onUpdate;
    const onCancel: () => void = props.onCancel;

    const [isMultiple, setIsMultiple] = useState<boolean>(props.isMultiple || false);
    const [label, setLabel] = useState<string>(props.label || "");
    const [index, setIndex] = useState<number>(props.index || 0);

    const handleUpdate = () => {
        onUpdate(label, index, isMultiple);
    };

    const handleMultipleChange = (event: any) => {
        setIsMultiple(event.target.checked);
    };

    const handleNumberChange = (event: any) => {
        const value = event.target.value;
        setIndex(value === "" ? 0 : Number(value));
    };

    const handleLabelChange = (event: any) => {
        setLabel(event.target.value);
    };

    // Auto-focus the label input when it's created
    const labelInputRef = (element: HTMLInputElement | null) => {
        if (element) {
            setTimeout(() => element.focus(), 0);
        }
    };

    return html`
        <div
            style="z-index: 9999; 
            position: absolute; 
            top: ${y}px; 
            left: ${x}px; 
            background-color: white; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
            padding: 12px; 
            width: fit-content;
            display: flex;
            flex-direction: column;
            gap: 8px;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;"
        >
            <h3 style="margin: 0 0 8px 0;">Edit Activity</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label for="multiple" style="min-width: 80px;">Multiple:</label>
                    <input
                        name="multiple"
                        type="checkbox"
                        onInput=${handleMultipleChange}
                    />
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label for="index" style="min-width: 80px;">Number:</label>
                    <input
                        name="index"
                        type="number"
                        value=${index}
                        onInput=${handleNumberChange}
                        style="flex: 1; 
                        border: 1px solid #ccc; 
                        border-radius: 4px; 
                        padding: 6px;
                        transition: border-color 0.2s ease;"
                        onFocus=${(e: FocusEvent) => {
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = "#00e379";
                            target.style.outline = "none";
                        }}
                        onBlur=${(e: FocusEvent) => {
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = "#ccc";
                        }}
                    />
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label for="label" style="min-width: 80px;">Label:</label>
                    <input
                        ref=${labelInputRef}
                        name="label"
                        type="text"
                        value=${label}
                        onInput=${handleLabelChange}
                        style="flex: 1; 
                        border: 1px solid #ccc; 
                        border-radius: 4px; 
                        padding: 6px;
                        transition: border-color 0.2s ease;"
                        onFocus=${(e: FocusEvent) => {
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = "#00e379";
                            target.style.outline = "none";
                        }}
                        onBlur=${(e: FocusEvent) => {
                            const target = e.target as HTMLInputElement;
                            target.style.borderColor = "#ccc";
                        }}
                    />
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <${Button} text="Update" onClick=${handleUpdate} />
                <${Button} text="Cancel" onClick=${onCancel} />
            </div>
        </div>
    `;
}

function Button(props: any) {
    const text = props.text;
    const onClick = props.onClick;

    return html`
        <button
            style="cursor: pointer; 
            padding: 8px 16px; 
            font-size: 14px; 
            border: 1px solid #ccc; 
            border-radius: 4px; 
            background-color: #f0f0f0; 
            flex: 1;
            min-height: 36px;
            transition: all 0.2s ease;"
            onClick=${onClick}
            onMouseEnter=${(e: MouseEvent) => {
                const target = e.target as HTMLButtonElement;
                target.style.borderColor = "#00e379";
                target.style.color = "#00e379";
            }}
            onMouseLeave=${(e: MouseEvent) => {
                const target = e.target as HTMLButtonElement;
                target.style.borderColor = "#ccc";
                target.style.color = "inherit";
            }}
        >
            ${text}
        </button>
    `;
}

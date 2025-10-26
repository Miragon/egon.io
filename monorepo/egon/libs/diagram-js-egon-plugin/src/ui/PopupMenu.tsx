import { html, useState } from "diagram-js/lib/ui";
import Button from "./Button";

interface PopupProps {
    x: number;
    y: number;
    label?: string;
    index?: number;
    isMultiple?: boolean;
    displayNumber?: boolean;
    onUpdate: (label: string, index: number | undefined, isMultiple: boolean) => void;
    onCancel: () => void;
}

export default function PopupMenu(props: PopupProps) {
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
                ${props.displayNumber
                    ? html`
                          <div style="display: flex; align-items: center; gap: 8px;">
                              <label for="multiple" style="min-width: 80px;"
                                  >Multiple:</label
                              >
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
                      `
                    : ""}
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

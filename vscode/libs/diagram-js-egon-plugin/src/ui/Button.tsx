import { html } from "diagram-js/lib/ui";

export default function Button(props: any) {
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

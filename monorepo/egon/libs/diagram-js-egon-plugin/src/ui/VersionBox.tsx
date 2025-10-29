import { html } from "diagram-js/lib/ui";
import logo from "../assets/logo/egon-io-logo.png";

interface VersionProps {
    version: string;
}

export default function VersionBox(props: VersionProps) {
    return html`
        <div
            style="position: absolute;
            bottom: 16px;
            right: 16px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            "
        >
            <img src=${logo} alt="Egon.io Logo" style="height: 32px; width: auto;" />
            <span style="font-size: 14px; font-weight: 500; color: #333;">
                Version ${props.version}
            </span>
        </div>
    `;
}

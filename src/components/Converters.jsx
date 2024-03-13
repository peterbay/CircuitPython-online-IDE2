import BaseConverter from "./BaseConverter";
import CaseConverter from "./CaseConverter";

export default function Converters() {
    return (
        <div className="converters">
            <BaseConverter />
            <br />
            <CaseConverter />
        </div>
    );
}

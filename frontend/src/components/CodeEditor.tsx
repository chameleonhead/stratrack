import AceEditor from "react-ace";
import { cn } from "../utils";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

export type PythonEditorProps = {
  language?: "python" | "mql4";
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
};

export default function CodeEditor({
  language = "python",
  value,
  onChange,
  readOnly = false,
  className,
}: PythonEditorProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <AceEditor
        mode={language === "mql4" ? "c_cpp" : "python"}
        theme="github"
        fontSize={14}
        width="100%"
        height="300px"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          useWorker: false,
          showLineNumbers: true,
          tabSize: 4,
        }}
      />
    </div>
  );
}

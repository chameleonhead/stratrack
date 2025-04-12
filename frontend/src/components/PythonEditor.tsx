import AceEditor from "react-ace";
import { cn } from "../utils";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";

export type PythonEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
};

export default function PythonEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: PythonEditorProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <AceEditor
        mode="python"
        theme="github"
        name="python-editor"
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

import { Undo2 } from "lucide-react";

export function UndoToast({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="undo-toast" role="status">
      <span>本を削除しました</span>
      <button type="button" onClick={onUndo}>
        <Undo2 size={16} /> 元に戻す
      </button>
    </div>
  );
}

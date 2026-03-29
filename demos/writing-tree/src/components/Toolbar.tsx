import React from 'react';

interface ToolbarProps {
  onExportMarkdown: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onReset: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExportMarkdown,
  onExpandAll,
  onCollapseAll,
  onReset
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button onClick={onExpandAll} className="toolbar-btn">
          全部展开
        </button>
        <button onClick={onCollapseAll} className="toolbar-btn">
          全部收起
        </button>
      </div>
      
      <div className="toolbar-right">
        <button onClick={onExportMarkdown} className="toolbar-btn primary">
          导出 Markdown
        </button>
        <button onClick={onReset} className="toolbar-btn danger">
          重新开始
        </button>
      </div>
    </div>
  );
};

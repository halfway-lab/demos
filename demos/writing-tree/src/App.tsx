import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TopicInput } from './components/TopicInput';
import { Toolbar } from './components/Toolbar';
import { OutlineNodeItem } from './components/OutlineNodeItem';
import { useOutline } from './hooks/useOutline';
import { generateOutline } from './utils/mockAI';
import { exportToMarkdown, downloadMarkdown } from './utils/export';
import { OutlineNode } from './types';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const { root, setRoot, updateNode, toggleExpanded, addChild, deleteNode, moveNode, findNode } = useOutline();

  const handleGenerate = useCallback(async (topic: string) => {
    setIsLoading(true);
    try {
      const outline = await generateOutline(topic);
      setRoot(outline);
    } catch (error) {
      console.error('生成大纲失败:', error);
      alert('生成大纲失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [setRoot]);

  const handleExport = useCallback(() => {
    if (root) {
      const markdown = exportToMarkdown(root);
      downloadMarkdown(markdown, `${root.title || '大纲'}.md`);
    }
  }, [root]);

  const handleExpandAll = useCallback(() => {
    if (!root) return;
    
    const expandAll = (node: OutlineNode): OutlineNode => ({
      ...node,
      isExpanded: true,
      children: node.children.map(expandAll)
    });
    
    setRoot(expandAll(root));
  }, [root, setRoot]);

  const handleCollapseAll = useCallback(() => {
    if (!root) return;
    
    const collapseAll = (node: OutlineNode): OutlineNode => ({
      ...node,
      isExpanded: false,
      children: node.children.map(collapseAll)
    });
    
    setRoot(collapseAll(root));
  }, [root, setRoot]);

  const handleReset = useCallback(() => {
    if (confirm('确定要重新开始吗？当前的大纲将会丢失。')) {
      setRoot(null);
    }
  }, [setRoot]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <h1>🌳 写作树</h1>
          <p className="tagline">HWP 写作辅助工具</p>
        </header>

        <main className="app-main">
          {!root ? (
            <TopicInput onSubmit={handleGenerate} isLoading={isLoading} />
          ) : (
            <>
              <Toolbar
                onExportMarkdown={handleExport}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
                onReset={handleReset}
              />
              
              <div className="outline-container">
                <h2 className="outline-title">{root.title}</h2>
                <div className="outline-tree">
                  {root.children.map((child) => (
                    <OutlineNodeItem
                      key={child.id}
                      node={child}
                      onToggle={toggleExpanded}
                      onUpdate={updateNode}
                      onAddChild={addChild}
                      onDelete={deleteNode}
                      onMove={moveNode}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="app-footer">
          <p>写作树 Demo - 帮助您构建清晰的文章结构</p>
        </footer>
      </div>
    </DndProvider>
  );
}

export default App;

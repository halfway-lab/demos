import React, { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { OutlineNode, DragItem } from '../types';

interface OutlineNodeItemProps {
  node: OutlineNode;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OutlineNode>) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onMove: (draggedId: string, targetId: string, position: 'before' | 'after' | 'into') => void;
}

const ItemTypes = {
  NODE: 'node'
};

export const OutlineNodeItem: React.FC<OutlineNodeItemProps> = ({
  node,
  onToggle,
  onUpdate,
  onAddChild,
  onDelete,
  onMove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editContent, setEditContent] = useState(node.content || '');
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE,
    item: { id: node.id, type: ItemTypes.NODE },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.NODE,
    canDrop: (item: DragItem) => item.id !== node.id,
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        onMove(item.id, node.id, 'into');
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  });

  const [{ isOverBefore }, dropBefore] = useDrop({
    accept: ItemTypes.NODE,
    canDrop: (item: DragItem) => item.id !== node.id,
    drop: (item: DragItem) => {
      onMove(item.id, node.id, 'before');
    },
    collect: (monitor) => ({
      isOverBefore: monitor.isOver()
    })
  });

  const [{ isOverAfter }, dropAfter] = useDrop({
    accept: ItemTypes.NODE,
    canDrop: (item: DragItem) => item.id !== node.id,
    drop: (item: DragItem) => {
      onMove(item.id, node.id, 'after');
    },
    collect: (monitor) => ({
      isOverAfter: monitor.isOver()
    })
  });

  drag(drop(ref));

  const handleSave = () => {
    onUpdate(node.id, { title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(node.title);
    setEditContent(node.content || '');
    setIsEditing(false);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="outline-node-wrapper">
      <div
        ref={dropBefore}
        className={`drop-indicator before ${isOverBefore ? 'active' : ''}`}
      />
      
      <div
        ref={ref}
        className={`outline-node ${isDragging ? 'dragging' : ''} ${isOver && canDrop ? 'drop-target' : ''}`}
        style={{ marginLeft: node.level * 24 }}
      >
        <div className="node-header">
          <button
            className={`expand-btn ${hasChildren ? 'has-children' : ''}`}
            onClick={() => hasChildren && onToggle(node.id)}
            disabled={!hasChildren}
          >
            {hasChildren ? (node.isExpanded ? '▼' : '▶') : '•'}
          </button>
          
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="章节标题"
                className="edit-input"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="章节内容（可选）"
                className="edit-textarea"
                rows={2}
              />
              <div className="edit-actions">
                <button onClick={handleSave} className="btn-save">保存</button>
                <button onClick={handleCancel} className="btn-cancel">取消</button>
              </div>
            </div>
          ) : (
            <div className="node-content" onClick={() => setIsEditing(true)}>
              <span className="node-title">{node.title}</span>
              {node.content && (
                <span className="node-preview">{node.content}</span>
              )}
            </div>
          )}
          
          {!isEditing && (
            <div className="node-actions">
              <button
                onClick={() => onAddChild(node.id)}
                className="btn-add"
                title="添加子章节"
              >
                +
              </button>
              {node.level > 0 && (
                <button
                  onClick={() => onDelete(node.id)}
                  className="btn-delete"
                  title="删除"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
        
        {hasChildren && node.isExpanded && (
          <div className="node-children">
            {node.children.map((child) => (
              <OutlineNodeItem
                key={child.id}
                node={child}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
          </div>
        )}
      </div>
      
      <div
        ref={dropAfter}
        className={`drop-indicator after ${isOverAfter ? 'active' : ''}`}
      />
    </div>
  );
};

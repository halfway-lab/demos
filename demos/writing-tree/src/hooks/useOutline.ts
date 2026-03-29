import { useState, useCallback } from 'react';
import { OutlineNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useOutline(initialRoot: OutlineNode | null = null) {
  const [root, setRoot] = useState<OutlineNode | null>(initialRoot);

  const findNode = useCallback((node: OutlineNode, id: string): OutlineNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const findParent = useCallback((node: OutlineNode, id: string): OutlineNode | null => {
    for (const child of node.children) {
      if (child.id === id) return node;
      const found = findParent(child, id);
      if (found) return found;
    }
    return null;
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<OutlineNode>) => {
    setRoot(prev => {
      if (!prev) return null;
      
      const updateInTree = (node: OutlineNode): OutlineNode => {
        if (node.id === id) {
          return { ...node, ...updates };
        }
        return {
          ...node,
          children: node.children.map(updateInTree)
        };
      };
      
      return updateInTree(prev);
    });
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setRoot(prev => {
      if (!prev) return null;
      
      const toggleInTree = (node: OutlineNode): OutlineNode => {
        if (node.id === id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        return {
          ...node,
          children: node.children.map(toggleInTree)
        };
      };
      
      return toggleInTree(prev);
    });
  }, []);

  const addChild = useCallback((parentId: string, title: string = '新章节') => {
    setRoot(prev => {
      if (!prev) return null;
      
      const parent = findNode(prev, parentId);
      if (!parent) return prev;
      
      const newNode: OutlineNode = {
        id: uuidv4(),
        title,
        isExpanded: false,
        level: parent.level + 1,
        children: []
      };
      
      const addInTree = (node: OutlineNode): OutlineNode => {
        if (node.id === parentId) {
          return {
            ...node,
            isExpanded: true,
            children: [...node.children, newNode]
          };
        }
        return {
          ...node,
          children: node.children.map(addInTree)
        };
      };
      
      return addInTree(prev);
    });
  }, [findNode]);

  const deleteNode = useCallback((id: string) => {
    setRoot(prev => {
      if (!prev || prev.id === id) return prev;
      
      const deleteInTree = (node: OutlineNode): OutlineNode => {
        return {
          ...node,
          children: node.children.filter(child => child.id !== id).map(deleteInTree)
        };
      };
      
      return deleteInTree(prev);
    });
  }, []);

  const moveNode = useCallback((draggedId: string, targetId: string, position: 'before' | 'after' | 'into') => {
    setRoot(prev => {
      if (!prev || draggedId === targetId) return prev;
      
      const draggedParent = findParent(prev, draggedId);
      const targetParent = findParent(prev, targetId);
      
      if (!draggedParent || !targetParent) return prev;
      
      const draggedNode = findNode(prev, draggedId);
      const targetNode = findNode(prev, targetId);
      
      if (!draggedNode || !targetNode) return prev;
      
      // Remove from old position
      const removeFromTree = (node: OutlineNode): OutlineNode => {
        return {
          ...node,
          children: node.children.filter(child => child.id !== draggedId).map(removeFromTree)
        };
      };
      
      let newTree = removeFromTree(prev);
      
      // Add to new position
      const addToTree = (node: OutlineNode): OutlineNode => {
        if (node.id === targetId) {
          if (position === 'into') {
            return {
              ...node,
              isExpanded: true,
              children: [...node.children, { ...draggedNode, level: node.level + 1 }]
            };
          }
          return node;
        }
        
        if (node.id === targetParent.id) {
          const targetIndex = node.children.findIndex(child => child.id === targetId);
          const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
          const newChildren = [...node.children];
          newChildren.splice(insertIndex, 0, { ...draggedNode, level: node.level + 1 });
          return {
            ...node,
            children: newChildren
          };
        }
        
        return {
          ...node,
          children: node.children.map(addToTree)
        };
      };
      
      if (position === 'into') {
        return addToTree(newTree);
      } else {
        return addToTree(newTree);
      }
    });
  }, [findNode, findParent]);

  const setRootNode = useCallback((node: OutlineNode | null) => {
    setRoot(node);
  }, []);

  return {
    root,
    setRoot: setRootNode,
    updateNode,
    toggleExpanded,
    addChild,
    deleteNode,
    moveNode,
    findNode
  };
}

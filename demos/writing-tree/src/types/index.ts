export interface OutlineNode {
  id: string;
  title: string;
  content?: string;
  children: OutlineNode[];
  isExpanded: boolean;
  level: number;
}

export interface DragItem {
  id: string;
  index: number;
  parentId: string | null;
}

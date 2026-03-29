import { OutlineNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function generateMockOutline(topic: string): OutlineNode {
  const topics: Record<string, OutlineNode> = {
    'default': {
      id: uuidv4(),
      title: topic,
      isExpanded: true,
      level: 0,
      children: [
        {
          id: uuidv4(),
          title: '引言',
          content: '介绍主题背景和写作目的',
          isExpanded: true,
          level: 1,
          children: [
            { id: uuidv4(), title: '研究背景', content: '阐述研究的背景和意义', isExpanded: false, level: 2, children: [] },
            { id: uuidv4(), title: '问题陈述', content: '明确研究要解决的问题', isExpanded: false, level: 2, children: [] },
          ]
        },
        {
          id: uuidv4(),
          title: '主体内容',
          content: '核心论述部分',
          isExpanded: true,
          level: 1,
          children: [
            { id: uuidv4(), title: '理论基础', content: '相关理论和概念框架', isExpanded: false, level: 2, children: [] },
            { id: uuidv4(), title: '案例分析', content: '具体案例和实证分析', isExpanded: false, level: 2, children: [] },
            { id: uuidv4(), title: '对比讨论', content: '与其他研究或观点的对比', isExpanded: false, level: 2, children: [] },
          ]
        },
        {
          id: uuidv4(),
          title: '结论',
          content: '总结全文要点',
          isExpanded: true,
          level: 1,
          children: [
            { id: uuidv4(), title: '主要发现', content: '概括核心发现和结论', isExpanded: false, level: 2, children: [] },
            { id: uuidv4(), title: '未来展望', content: '提出未来研究方向', isExpanded: false, level: 2, children: [] },
          ]
        },
      ]
    }
  };

  return topics['default'];
}

export function generateOutline(topic: string): Promise<OutlineNode> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockOutline(topic));
    }, 1000);
  });
}

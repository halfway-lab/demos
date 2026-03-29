import React, { useState } from 'react';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="topic-input-container">
      <h2>开始写作</h2>
      <p className="subtitle">输入文章主题，AI 将为您生成章节大纲</p>
      
      <form onSubmit={handleSubmit} className="topic-form">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：人工智能对未来教育的影响"
          className="topic-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={!topic.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              生成中...
            </>
          ) : (
            '生成大纲'
          )}
        </button>
      </form>
      
      <div className="quick-topics">
        <span className="quick-label">快速选择：</span>
        {['数字化转型', '可持续发展', '创新创业', '远程工作'].map((t) => (
          <button
            key={t}
            className="quick-topic-btn"
            onClick={() => setTopic(t)}
            disabled={isLoading}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

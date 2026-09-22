import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function SkillNode({
  skill,
  state, // 'locked' | 'available' | 'active'
  rank,
  isSelected,
  onClick,
  onRightClick,
  onMouseEnter,
  onMouseLeave
}) {
  // Dynamically resolve Lucide icon based on name
  const IconComponent = LucideIcons[skill.Icon] || LucideIcons.HelpCircle;
  const isMaxed = rank === skill.MaxRank;

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onRightClick) {
      onRightClick(skill.ID);
    }
  };

  return (
    <div
      className={`skill-node-wrapper ${isSelected ? 'selected-wrapper' : ''}`}
      style={{
        left: `${skill.x}px`,
        top: `${skill.y}px`,
        zIndex: isSelected ? 10 : 2
      }}
      onMouseEnter={() => onMouseEnter(skill)}
      onMouseLeave={onMouseLeave}
    >
      {skill.ExclusiveWith && (
        <div className="skill-exclusive-badge" title="이 스킬은 다른 스킬과 상호 배타적입니다.">
          EXC
        </div>
      )}

      <div
        className={`skill-node ${state} ${isMaxed ? 'maxed' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => onClick(skill.ID)}
        onContextMenu={handleContextMenu}
        title={isSelected ? "[좌클릭] 레벨 업 / [우클릭] 레벨 감소" : "[좌클릭] 스킬 선택 (선택 후 재좌클릭 시 레벨 업) / [우클릭] 레벨 감소"}
      >
        <div className="skill-node-inner">
          <IconComponent className="skill-node-icon" size={24} strokeWidth={2} />
        </div>
      </div>

      <div className="skill-rank-badge">
        {rank} / {skill.MaxRank}
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Plus, Minus } from 'lucide-react';

// Helper to evaluate and format skill descriptions containing math expressions like {rank * 10}
export const formatDescription = (desc, rankValue) => {
  if (!desc) return '';
  return desc.replace(/\{([^}]+)\}/g, (match, expression) => {
    try {
      // Replace the token 'rank' with the actual rank value
      const sanitized = expression.replace(/\brank\b/g, rankValue);
      // Evaluate expression
      const evalResult = new Function(`return ${sanitized}`)();
      // Format number to 2 decimal places maximum, and remove trailing zeros
      return typeof evalResult === 'number' ? Number(evalResult.toFixed(2)) : evalResult;
    } catch (e) {
      console.error("Error evaluating expression: ", expression, e);
      return match;
    }
  });
};

export default function SkillDetails({
  skill,
  rank,
  state,
  learnedSkills,
  allSkills,
  onLearn,
  onUnlearn
}) {
  if (!skill) {
    return (
      <div className="skill-details-panel">
        <div className="skill-details-empty">
          <Shield className="empty-panel-icon" />
          <h3>스킬 상세 정보</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            스킬 노드에 마우스를 올리거나 클릭하여 상세 효과를 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  const isMaxed = rank === skill.MaxRank;
  const isLocked = state === 'locked';
  
  // Find name of prerequisites and check required ranks
  const defaultMinRank = parseInt(skill.PrereqMinRank || 1);
  const prereqList = skill.Prerequisites 
    ? skill.Prerequisites.split(',').map(p => {
        const trimmed = p.trim();
        if (!trimmed) return null;
        const parts = trimmed.split(':');
        const parentId = parts[0].trim();
        const requiredRank = parts[1] ? parseInt(parts[1].trim()) : defaultMinRank;
        const pSkill = allSkills.find(s => s.ID === parentId);
        const currentRank = learnedSkills[parentId] || 0;
        const isMet = currentRank >= requiredRank;
        return {
          id: parentId,
          name: pSkill ? pSkill.Name : parentId,
          requiredRank,
          currentRank,
          isMet
        };
      }).filter(Boolean)
    : [];

  // Find tier point requirements
  const reqTierPoints = parseInt(skill.RequiredTierPoints || 0);
  const heroSkills = allSkills.filter(s => s.Hero === skill.Hero);
  let spentPointsInLowerTiers = 0;
  heroSkills.forEach(s => {
    if (s.Tier < skill.Tier && learnedSkills[s.ID]) {
      spentPointsInLowerTiers += learnedSkills[s.ID];
    }
  });
  const isTierPointsMet = spentPointsInLowerTiers >= reqTierPoints;

  // Find name of exclusive skills
  const exclusiveIds = skill.ExclusiveWith
    ? skill.ExclusiveWith.split(',').map(e => e.trim()).filter(Boolean)
    : [];
    
  const exclusivesInfo = exclusiveIds.map(eId => {
    const eSkill = allSkills.find(s => s.ID === eId);
    const isActive = (learnedSkills[eId] || 0) > 0;
    return {
      id: eId,
      name: eSkill ? eSkill.Name : eId,
      isActive
    };
  });

  const activeExclusives = exclusivesInfo.filter(e => e.isActive);

  return (
    <div className="skill-details-panel">
      <div className="skill-details-header">
        <div className="details-hero-tag">{skill.Hero}</div>
        <h3 className="details-skill-name">{skill.Name}</h3>
        <div className="details-rank-info">
          <span>등급: {rank} / {skill.MaxRank}</span>
          <span style={{ color: isMaxed ? '#fff' : undefined }}>
            {isMaxed ? '최대 레벨 마스터' : isLocked ? '잠김' : '습득 가능'}
          </span>
        </div>
      </div>

      <div className="skill-details-body">
        {/* Description section */}
        <div className="details-description-box">
          {rank > 0 ? (
            <div className="details-desc-current">
              <div className="desc-label">현재 효과 (Lv.{rank})</div>
              <p>{formatDescription(skill.Description, rank)}</p>
            </div>
          ) : (
            <div className="details-desc-current" style={{ opacity: 0.7 }}>
              <div className="desc-label" style={{ color: 'var(--color-text-secondary)' }}>기본 효과 (Lv.1 예시)</div>
              <p>{formatDescription(skill.Description, 1)}</p>
            </div>
          )}

          {rank < skill.MaxRank && (
            <div className="details-desc-next">
              <div className="desc-label">다음 레벨 효과 (Lv.{rank + 1})</div>
              <p>{formatDescription(skill.Description, rank + 1)}</p>
            </div>
          )}
        </div>

        {/* Prerequisites section */}
        {prereqList.length > 0 && (
          <div className="details-requirements-box">
            <h4 className="req-title">
              선행 조건 {prereqList.length > 1 && (skill.PrereqCondition === 'OR' ? '(다음 중 1개 이상 만족 필요)' : '(다음 모두 만족 필요)')}
            </h4>
            {prereqList.map(req => (
              <div key={req.id} className={`req-item ${req.isMet ? 'met' : 'not-met'}`}>
                {req.isMet ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>
                  {req.name} {req.requiredRank > 1 ? `(${req.requiredRank}레벨 이상)` : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tier Points Requirement section */}
        {reqTierPoints > 0 && (!skill.Prerequisites) && (
          <div className="details-requirements-box">
            <h4 className="req-title">이전 티어 투자 요구</h4>
            <div className={`req-item ${isTierPointsMet ? 'met' : 'not-met'}`}>
              {isTierPointsMet ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span>
                이전 티어에 총 {reqTierPoints} SP 이상 투자 필요 (현재: {spentPointsInLowerTiers} SP)
              </span>
            </div>
          </div>
        )}

        {/* Exclusivity section */}
        {exclusivesInfo.length > 0 && (
          <div className="details-requirements-box">
            <h4 className="req-title" style={{ color: '#f87171' }}>상호 배타적 스킬</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              다음 스킬이 활성화되면 이 스킬은 자동으로 해제되거나 비활성화됩니다.
            </p>
            {exclusivesInfo.map(exc => (
              <div key={exc.id} className="req-item" style={{ color: exc.isActive ? '#ef4444' : 'var(--color-text-secondary)' }}>
                {exc.isActive ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                <span>{exc.name} {exc.isActive ? '(현재 활성화됨)' : ''}</span>
              </div>
            ))}
          </div>
        )}

        {activeExclusives.length > 0 && (
          <div className="exclusive-item">
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            경고: 이 스킬을 습득하면 배타적인 관계인 <strong>{activeExclusives.map(e => e.name).join(', ')}</strong> 및 하위 스킬들이 자동으로 초기화됩니다.
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="skill-details-actions">
        <button
          className="skill-action-btn learn"
          disabled={isMaxed || isLocked}
          onClick={() => onLearn(skill.ID)}
        >
          <Plus size={16} />
          <span>레벨 업</span>
        </button>

        <button
          className="skill-action-btn unlearn"
          disabled={rank === 0}
          onClick={() => onUnlearn(skill.ID)}
        >
          <Minus size={16} />
          <span>레벨 다운</span>
        </button>
      </div>
    </div>
  );
}

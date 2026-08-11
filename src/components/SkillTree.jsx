import React, { useState, useEffect, useRef, useMemo } from 'react';
import SkillNode from './SkillNode';

export default function SkillTree({
  skills, // Filtered for the current hero
  learnedSkills,
  selectedSkill,
  onSelectSkill,
  onLearnSkill,
  onUnlearnSkill,
  onHoverSkill,
  onLeaveSkill
}) {
  const viewportRef = useRef(null);
  
  // Drag to pan state
  const [pan, setPan] = useState({ x: -250, y: 30 }); // Starts slightly offset to center on typical screens
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Center the canvas on viewport load
  useEffect(() => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const canvasWidth = 2000;
      const canvasHeight = 1200;
      
      // Center horizontally, top padding vertically
      const initialX = (rect.width - canvasWidth) / 2;
      const initialY = 40; // 40px top offset
      setPan({ x: initialX, y: initialY });
    }
  }, [skills[0]?.Hero]); // Re-center when hero changes

  // Drag-to-pan handlers
  const handleMouseDown = (e) => {
    // Only allow left click drag
    if (e.button !== 0) return;
    
    // Prevent dragging if clicking a button or interactable node
    if (e.target.closest('.skill-node') || e.target.closest('button')) {
      return;
    }

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      // Restrict boundaries so the user doesn't lose the canvas
      const newX = panStart.current.x + dx;
      const newY = panStart.current.y + dy;
      
      setPan({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Canvas Dimensions
  const canvasWidth = 2000;
  const canvasHeight = 1200;
  
  // Calculate node positions dynamically based on Tier and Tier-count
  const skillsWithPositions = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    
    // 1. Group skills by Tier
    const tiers = {};
    skills.forEach(skill => {
      const t = skill.Tier || 1;
      if (!tiers[t]) tiers[t] = [];
      tiers[t].push({ ...skill });
    });
    
    const verticalSpacing = 200; // Distance between tiers
    const topPadding = 120;
    const centerPoint = canvasWidth / 2; // 1000px
    
    // 2. Position skills in each tier symmetrically
    const positionedSkills = [];
    
    Object.keys(tiers).forEach(tStr => {
      const t = parseInt(tStr);
      const tierSkills = tiers[t];
      
      // Sort by ID to ensure stable layout
      tierSkills.sort((a, b) => a.ID.localeCompare(b.ID));
      
      const N = tierSkills.length;
      const y = topPadding + (t - 1) * verticalSpacing;
      
      // Horizontal separation distance between nodes in the same tier
      const horizontalSpacing = Math.min(260, 1400 / Math.max(1, N - 1 || 1));
      
      tierSkills.forEach((skill, index) => {
        let x = centerPoint;
        if (N > 1) {
          // Centered around 1000px
          x = centerPoint + (index - (N - 1) / 2) * horizontalSpacing;
        }
        
        skill.x = x;
        skill.y = y;
        positionedSkills.push(skill);
      });
    });
    
    return positionedSkills;
  }, [skills]);

  // Determine state of a node: 'locked' | 'available' | 'active'
  const getNodeState = (skill) => {
    const rank = learnedSkills[skill.ID] || 0;
    if (rank > 0) return 'active';
    
    // Check prerequisites
    if (skill.Prerequisites) {
      const prereqs = skill.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
      const allPrereqsMet = prereqs.every(pId => (learnedSkills[pId] || 0) > 0);
      if (!allPrereqsMet) return 'locked';
    }
    
    // Check mutual exclusivity: if any mutually exclusive skill has rank > 0, this node is locked
    if (skill.ExclusiveWith) {
      const exclusives = skill.ExclusiveWith.split(',').map(e => e.trim()).filter(Boolean);
      const anyExclusiveLearned = exclusives.some(eId => (learnedSkills[eId] || 0) > 0);
      if (anyExclusiveLearned) return 'locked';
    }
    
    return 'available';
  };

  // Build connections (lines between parent and child)
  const connections = useMemo(() => {
    const list = [];
    skillsWithPositions.forEach(child => {
      if (!child.Prerequisites) return;
      
      const prereqs = child.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
      prereqs.forEach(parentId => {
        const parent = skillsWithPositions.find(s => s.ID === parentId);
        if (!parent) return;
        
        // Connection state logic:
        // - active: both parent and child are learned
        // - available: parent is learned, child is available (prereqs met)
        // - locked: parent is not learned
        const isParentActive = (learnedSkills[parent.ID] || 0) > 0;
        const isChildActive = (learnedSkills[child.ID] || 0) > 0;
        
        let connState = 'locked';
        if (isParentActive && isChildActive) {
          connState = 'active';
        } else if (isParentActive) {
          connState = 'available';
        }
        
        list.push({
          id: `${parent.ID}-${child.ID}`,
          x1: parent.x,
          y1: parent.y,
          x2: child.x,
          y2: child.y,
          state: connState
        });
      });
    });
    
    return list;
  }, [skillsWithPositions, learnedSkills]);

  // Unique Tiers to draw horizontal guide lines in the background
  const tiersList = useMemo(() => {
    const set = new Set();
    skills.forEach(s => set.add(s.Tier));
    return Array.from(set).sort((a, b) => a - b);
  }, [skills]);

  return (
    <div
      ref={viewportRef}
      className={`skill-tree-viewport ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div
        className="skill-tree-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {/* Tier Grid Lines in background */}
        {tiersList.map(tier => {
          const y = 120 + (tier - 1) * 200;
          return (
            <div
              key={tier}
              className="tier-label-line"
              style={{ top: `${y}px` }}
            >
              <div className="tier-label-text">TIER {tier}</div>
            </div>
          );
        })}

        {/* SVG Connections Layer */}
        <svg className="svg-connections-layer">
          <defs>
            <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {connections.map(conn => (
            <path
              key={conn.id}
              d={`M ${conn.x1} ${conn.y1} L ${conn.x2} ${conn.y2}`}
              className={`connector-line ${conn.state}`}
              style={{
                filter: conn.state === 'active' ? 'url(#active-glow)' : undefined
              }}
            />
          ))}
        </svg>

        {/* Skill Nodes Layer */}
        <div className="skill-nodes-layer">
          {skillsWithPositions.map(skill => {
            const nodeState = getNodeState(skill);
            const rank = learnedSkills[skill.ID] || 0;
            const isSelected = selectedSkill?.ID === skill.ID;
            
            return (
              <SkillNode
                key={skill.ID}
                skill={skill}
                state={nodeState}
                rank={rank}
                isSelected={isSelected}
                onClick={onSelectSkill}
                onRightClick={onUnlearnSkill}
                onMouseEnter={onHoverSkill}
                onMouseLeave={onLeaveSkill}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

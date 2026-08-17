import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import SkillNode from './SkillNode';

export default function SkillTree({
  skills, // Filtered for the current hero
  learnedSkills,
  selectedSkill,
  onSelectSkill,
  onLearnSkill,
  onUnlearnSkill,
  onHoverSkill,
  onLeaveSkill,
  isSkillUnlockable
}) {
  const viewportRef = useRef(null);
  
  // Drag to pan state
  const [pan, setPan] = useState({ x: -250, y: 30 }); // Starts slightly offset to center on typical screens
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Zoom state
  const [zoom, setZoom] = useState(1.0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

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

    const handleMouseUp = (e) => {
      if (isDragging) {
        setIsDragging(false);
        
        // Calculate drag distance
        const dx = Math.abs(e.clientX - dragStart.current.x);
        const dy = Math.abs(e.clientY - dragStart.current.y);
        
        // If the movement is very small, count it as a click on empty space
        if (dx < 5 && dy < 5) {
          // Check if the click target is a skill node or something else
          if (!e.target.closest('.skill-node-wrapper') && !e.target.closest('button') && !e.target.closest('.skill-zoom-controls')) {
            if (onSelectSkill) {
              onSelectSkill(null);
            }
          }
        }
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
  }, [isDragging, onSelectSkill]);

  // Canvas Dimensions
  const canvasWidth = 2000;
  const canvasHeight = 1200;
  
  // Calculate node positions dynamically based on Tier, parent grouping, and relaxation
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
    const minDistance = 160; // Minimum horizontal spacing to prevent overlaps
    const siblingSpacing = 140; // Horizontal spacing between sibling nodes

    const positionedSkills = [];
    const positionedMap = {}; // Maps skill ID to final positioned node { x, y }

    // Sort Tiers numerically
    const tierNumbers = Object.keys(tiers).map(Number).sort((a, b) => a - b);

    tierNumbers.forEach(t => {
      const tierSkills = tiers[t];
      const y = topPadding + (t - 1) * verticalSpacing;

      if (t === 1) {
        // Tier 1 roots: position symmetrically across the center
        tierSkills.sort((a, b) => a.ID.localeCompare(b.ID));
        const N = tierSkills.length;
        const rootSpacing = Math.max(minDistance, 280);
        tierSkills.forEach((skill, index) => {
          let x = centerPoint;
          if (N > 1) {
            x = centerPoint + (index - (N - 1) / 2) * rootSpacing;
          }
          skill.x = x;
          skill.y = y;
          positionedSkills.push(skill);
          positionedMap[skill.ID] = { x, y };
        });
      } else {
        // Tiers > 1: Cluster children under parent nodes
        const groups = {}; // Groups nodes by their tentative/parent target X
        const parentlessNodes = [];

        tierSkills.forEach(s => {
          const prereqs = s.Prerequisites
            ? s.Prerequisites.split(',').map(p => p.trim().split(':')[0].trim()).filter(Boolean)
            : [];
          
          // Find X coordinates of already positioned parents
          const parentXCoords = prereqs.map(id => positionedMap[id]?.x).filter(xVal => xVal !== undefined);

          if (parentXCoords.length > 0) {
            // Target X is the average X of parent nodes
            const targetX = parentXCoords.reduce((sum, xVal) => sum + xVal, 0) / parentXCoords.length;
            if (!groups[targetX]) {
              groups[targetX] = [];
            }
            groups[targetX].push(s);
          } else {
            parentlessNodes.push(s);
          }
        });

        // Group parentless nodes around centerPoint
        if (parentlessNodes.length > 0) {
          if (!groups[centerPoint]) {
            groups[centerPoint] = [];
          }
          groups[centerPoint].push(...parentlessNodes);
        }

        // Spread siblings within each group
        const tentativeSkills = [];
        Object.keys(groups).forEach(targetXStr => {
          const targetX = parseFloat(targetXStr);
          const groupNodes = groups[targetXStr];
          groupNodes.sort((a, b) => a.ID.localeCompare(b.ID));

          groupNodes.forEach((s, index) => {
            let x = targetX;
            if (groupNodes.length > 1) {
              x = targetX + (index - (groupNodes.length - 1) / 2) * siblingSpacing;
            }
            s.x = x;
            s.y = y;
            tentativeSkills.push(s);
          });
        });

        // Sort by current tentative X to prepare for layout relaxation
        tentativeSkills.sort((a, b) => a.x - b.x);

        // Keep original positions to compute shifts
        const originalXMap = {};
        tentativeSkills.forEach(s => {
          originalXMap[s.ID] = s.x;
        });

        // Relaxation Pass 1: Left-to-Right sweep
        for (let i = 0; i < tentativeSkills.length - 1; i++) {
          if (tentativeSkills[i+1].x - tentativeSkills[i].x < minDistance) {
            tentativeSkills[i+1].x = tentativeSkills[i].x + minDistance;
          }
        }

        // Relaxation Pass 2: Right-to-Left sweep
        for (let i = tentativeSkills.length - 1; i > 0; i--) {
          if (tentativeSkills[i].x - tentativeSkills[i-1].x < minDistance) {
            tentativeSkills[i-1].x = tentativeSkills[i].x - minDistance;
          }
        }

        // Relaxation Pass 3: Center of Gravity restoration
        if (tentativeSkills.length > 0) {
          let totalShift = 0;
          tentativeSkills.forEach(s => {
            totalShift += (s.x - originalXMap[s.ID]);
          });
          const avgShift = totalShift / tentativeSkills.length;

          tentativeSkills.forEach(s => {
            s.x -= avgShift;
            positionedSkills.push(s);
            positionedMap[s.ID] = { x: s.x, y: s.y };
          });
        }
      }
    });

    return positionedSkills;
  }, [skills]);

  // Determine state of a node: 'locked' | 'available' | 'active'
  const getNodeState = (skill) => {
    const rank = learnedSkills[skill.ID] || 0;
    if (rank > 0) return 'active';
    
    if (isSkillUnlockable) {
      const { unlockable } = isSkillUnlockable(skill, learnedSkills, skills);
      return unlockable ? 'available' : 'locked';
    }
    
    return 'available';
  };

  // Build connections (lines between parent and child)
  const connections = useMemo(() => {
    const list = [];
    skillsWithPositions.forEach(child => {
      if (!child.Prerequisites) return;
      
      const prereqs = child.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
      prereqs.forEach(pRaw => {
        const parentId = pRaw.split(':')[0].trim();
        const parent = skillsWithPositions.find(s => s.ID === parentId);
        if (!parent) return;
        
        const defaultMinRank = parseInt(child.PrereqMinRank || 1);
        const parts = pRaw.split(':');
        const requiredRank = parts[1] ? parseInt(parts[1].trim()) : defaultMinRank;
        
        // Parent must be learned up to the required rank for this connection to be active/available
        const isParentActive = (learnedSkills[parent.ID] || 0) >= requiredRank;
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
      {/* Floating Zoom Controls */}
      <div className="skill-zoom-controls">
        <button className="zoom-btn" onClick={handleZoomOut} title="축소">
          <ZoomOut size={16} />
        </button>
        <div className="zoom-indicator">{Math.round(zoom * 100)}%</div>
        <button className="zoom-btn" onClick={handleZoomIn} title="확대">
          <ZoomIn size={16} />
        </button>
        <button className="zoom-btn" onClick={handleZoomReset} title="초기화">
          <Maximize2 size={14} />
        </button>
      </div>

      <div
        className="skill-tree-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
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

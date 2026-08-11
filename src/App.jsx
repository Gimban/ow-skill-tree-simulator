import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { sampleData } from './sampleData';

import Header from './components/Header';
import HeroLobby from './components/HeroLobby';
import HeroSelector from './components/HeroSelector';
import SkillTree from './components/SkillTree';
import SkillDetails from './components/SkillDetails';

export default function App() {
  // Application State
  const [skills, setSkills] = useState(sampleData);
  const [selectedHero, setSelectedHero] = useState(null);
  const [learnedSkills, setLearnedSkills] = useState({});
  const [csvUrl, setCsvUrl] = useState('');
  
  // UI States
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [hoveredSkillId, setHoveredSkillId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract unique heroes list from active skills data
  const heroes = useMemo(() => {
    const list = [];
    skills.forEach(s => {
      if (s.Hero && !list.includes(s.Hero)) {
        list.push(s.Hero);
      }
    });
    return list;
  }, [skills]);

  // Filter skills for the currently selected hero
  const activeHeroSkills = useMemo(() => {
    if (!selectedHero) return [];
    return skills.filter(s => s.Hero === selectedHero);
  }, [skills, selectedHero]);

  // Resolve skill details currently hovered or selected
  const activeDetailSkill = useMemo(() => {
    const targetId = hoveredSkillId || selectedSkillId;
    if (!targetId) return null;
    return skills.find(s => s.ID === targetId);
  }, [skills, hoveredSkillId, selectedSkillId]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // URL Hash state parsing & restoring on mount / hashchange
  useEffect(() => {
    const parseUrlState = () => {
      const hash = window.location.hash;
      if (!hash) return;
      
      const params = new URLSearchParams(hash.substring(1));
      const hero = params.get('hero');
      const buildStr = params.get('build');
      
      if (hero) {
        setSelectedHero(hero);
      }
      if (buildStr) {
        const buildObj = {};
        buildStr.split(',').forEach(item => {
          const [id, rank] = item.split(':');
          if (id && rank) {
            buildObj[id] = parseInt(rank);
          }
        });
        setLearnedSkills(buildObj);
      }
    };

    parseUrlState();

    window.addEventListener('hashchange', parseUrlState);
    return () => window.removeEventListener('hashchange', parseUrlState);
  }, []);

  // Sync state to URL hash on change
  const syncStateToHash = (hero, learned) => {
    if (!hero) {
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    
    // Filter active hero's learned skills
    const heroSkills = skills.filter(s => s.Hero === hero);
    const buildParts = [];
    
    heroSkills.forEach(s => {
      const rank = learned[s.ID];
      if (rank > 0) {
        buildParts.push(`${s.ID}:${rank}`);
      }
    });

    const hashString = `hero=${encodeURIComponent(hero)}&build=${buildParts.join(',')}`;
    window.history.replaceState(null, '', `#${hashString}`);
  };

  // Convert Google Sheet Share link to Direct CSV Link automatically
  const getDirectCsvUrl = (url) => {
    if (!url) return '';
    
    // Check if it matches Google Sheets format
    const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetMatch && sheetMatch[1]) {
      // Find sheet gid if specified in parameter
      const gidMatch = url.match(/gid=([0-9]+)/);
      const gidStr = gidMatch ? `&gid=${gidMatch[1]}` : '';
      return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv${gidStr}`;
    }
    return url;
  };

  // Fetch and parse CSV from URL
  const handleLoadCsv = (overrideUrl) => {
    const targetUrl = overrideUrl || csvUrl;
    if (!targetUrl) {
      setError("구글 시트 URL을 입력해 주세요.");
      return;
    }

    const directUrl = getDirectCsvUrl(targetUrl);
    setIsLoading(true);
    setError(null);

    Papa.parse(directUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        const data = results.data;

        // Check essential columns
        if (data.length === 0 || !data[0].Hero || !data[0].ID || !data[0].Name || !data[0].Tier || !data[0].MaxRank) {
          setError("구글 시트 구조가 올바르지 않습니다. 필수 컬럼(Hero, ID, Name, Tier, MaxRank)이 누락되었습니다.");
          return;
        }

        // Map data types and clean
        const parsed = data.map(item => ({
          ...item,
          Tier: parseInt(item.Tier || 1),
          MaxRank: parseInt(item.MaxRank || 1),
          Prerequisites: item.Prerequisites || "",
          ExclusiveWith: item.ExclusiveWith || "",
          Icon: item.Icon || "HelpCircle"
        }));

        setSkills(parsed);
        setToastMessage("데이터를 성공적으로 불러왔습니다!");
        setSelectedHero(null);
        setLearnedSkills({});
        setSelectedSkillId(null);
        setHoveredSkillId(null);
        syncStateToHash(null, {});
      },
      error: (err) => {
        setIsLoading(false);
        setError(`데이터 파싱에 실패했습니다: ${err.message}. 구글 시트 공유 범위가 '링크가 있는 모든 사용자에게 뷰어 권한 공개'인지 확인하세요.`);
      }
    });
  };

  // Select active hero
  const handleSelectHero = (heroName) => {
    setSelectedHero(heroName);
    setSelectedSkillId(null);
    setHoveredSkillId(null);
    syncStateToHash(heroName, learnedSkills);
  };

  // Back to Lobby
  const handleBackToLobby = () => {
    setSelectedHero(null);
    setSelectedSkillId(null);
    setHoveredSkillId(null);
    syncStateToHash(null, {});
  };

  // Reset skills of current hero
  const handleReset = () => {
    if (!selectedHero) return;
    
    const newLearned = { ...learnedSkills };
    activeHeroSkills.forEach(s => {
      delete newLearned[s.ID];
    });
    
    setLearnedSkills(newLearned);
    setToastMessage(`${selectedHero}의 스킬 배치가 초기화되었습니다.`);
    syncStateToHash(selectedHero, newLearned);
  };

  // Copy shareable link to clipboard
  const handleCopyShareLink = () => {
    // Current URL already synced to hash
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setToastMessage("빌드 공유 링크가 클립보드에 복사되었습니다!");
    }).catch(err => {
      setError("공유 링크 복사에 실패했습니다.");
    });
  };

  // Helper for cascading unlearn:
  // When a parent is unlearned (rank=0), we must recursively unlearn all children that depend on it.
  const unlearnSkillCascade = (skillId, currentLearned) => {
    const updated = { ...currentLearned };
    const queue = [skillId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      delete updated[currentId];
      
      // Find direct children
      skills.forEach(s => {
        if (s.Prerequisites) {
          const prereqs = s.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
          if (prereqs.includes(currentId) && updated[s.ID] !== undefined) {
            queue.push(s.ID);
          }
        }
      });
    }
    
    return updated;
  };

  // Learn a skill (left click)
  const handleLearnSkill = (skillId) => {
    const skill = skills.find(s => s.ID === skillId);
    if (!skill) return;

    // Check prerequisites
    if (skill.Prerequisites) {
      const prereqs = skill.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
      const unmetPrereqs = prereqs.filter(pId => !learnedSkills[pId] || learnedSkills[pId] === 0);
      if (unmetPrereqs.length > 0) {
        setToastMessage("선행 조건을 달성하지 못했습니다.");
        return;
      }
    }

    let newLearned = { ...learnedSkills };

    // Check mutual exclusivity.
    // If we learn this, we must unlearn any exclusive skill and its children!
    if (skill.ExclusiveWith) {
      const exclusives = skill.ExclusiveWith.split(',').map(e => e.trim()).filter(Boolean);
      exclusives.forEach(excId => {
        if (newLearned[excId]) {
          newLearned = unlearnSkillCascade(excId, newLearned);
        }
      });
    }

    const currentRank = newLearned[skillId] || 0;
    if (currentRank < skill.MaxRank) {
      newLearned[skillId] = currentRank + 1;
      setLearnedSkills(newLearned);
      syncStateToHash(selectedHero, newLearned);

      // Play confetti on maxing out
      if (newLearned[skillId] === skill.MaxRank) {
        import('canvas-confetti').then(confetti => {
          confetti.default({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#f99e1a', '#00f0ff', '#ffffff']
          });
        });
      }
    }
  };

  // Unlearn a skill (right click / manual button)
  const handleUnlearnSkill = (skillId) => {
    const currentRank = learnedSkills[skillId] || 0;
    if (currentRank === 0) return;

    let newLearned = { ...learnedSkills };
    if (currentRank === 1) {
      // Goes to 0, trigger cascade unlearn for dependents
      newLearned = unlearnSkillCascade(skillId, newLearned);
    } else {
      newLearned[skillId] = currentRank - 1;
    }
    
    setLearnedSkills(newLearned);
    syncStateToHash(selectedHero, newLearned);
  };

  return (
    <>
      <Header
        csvUrl={csvUrl}
        setCsvUrl={setCsvUrl}
        onLoadCsv={handleLoadCsv}
        onReset={handleReset}
        onCopyShareLink={handleCopyShareLink}
        selectedHero={selectedHero}
        onBackToLobby={handleBackToLobby}
      />

      {/* Loading banner */}
      {isLoading && (
        <div style={{ position: 'fixed', top: '75px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0, 240, 255, 0.2)', border: '1px solid var(--color-available)', padding: '10px 20px', borderRadius: '4px', zIndex: '99', fontFamily: 'Orbitron' }}>
          LOADING DATA...
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ position: 'fixed', top: '75px', left: '50%', transform: 'translateX(-50%)', zIndex: '99' }}>
          <div className="data-status-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', marginLeft: '10px', cursor: 'pointer', textDecoration: 'underline' }}>닫기</button>
          </div>
        </div>
      )}

      <div className="simulator-layout">
        {selectedHero ? (
          <>
            <HeroSelector
              heroes={heroes}
              selectedHero={selectedHero}
              onSelectHero={handleSelectHero}
              onBackToLobby={handleBackToLobby}
              learnedSkills={learnedSkills}
              skills={skills}
            />

            <SkillTree
              skills={activeHeroSkills}
              learnedSkills={learnedSkills}
              selectedSkill={activeDetailSkill}
              onSelectSkill={(id) => {
                setSelectedSkillId(id);
                setHoveredSkillId(null);
              }}
              onLearnSkill={handleLearnSkill}
              onUnlearnSkill={handleUnlearnSkill}
              onHoverSkill={(skill) => setHoveredSkillId(skill.ID)}
              onLeaveSkill={() => setHoveredSkillId(null)}
            />

            <SkillDetails
              skill={activeDetailSkill}
              rank={learnedSkills[activeDetailSkill?.ID] || 0}
              state={
                activeDetailSkill 
                  ? (learnedSkills[activeDetailSkill.ID] > 0 
                      ? 'active' 
                      : (activeHeroSkills.find(s => s.ID === activeDetailSkill.ID) && 
                         (() => {
                           const s = activeHeroSkills.find(s => s.ID === activeDetailSkill.ID);
                           // Check prerequisites
                           if (s.Prerequisites) {
                             const prereqs = s.Prerequisites.split(',').map(p => p.trim()).filter(Boolean);
                             const met = prereqs.every(pId => (learnedSkills[pId] || 0) > 0);
                             if (!met) return 'locked';
                           }
                           // Check exclusives
                           if (s.ExclusiveWith) {
                             const exclusives = s.ExclusiveWith.split(',').map(e => e.trim()).filter(Boolean);
                             const conflict = exclusives.some(eId => (learnedSkills[eId] || 0) > 0);
                             if (conflict) return 'locked';
                           }
                           return 'available';
                         })())
                    )
                  : 'locked'
              }
              learnedSkills={learnedSkills}
              allSkills={skills}
              onLearn={handleLearnSkill}
              onUnlearn={handleUnlearnSkill}
            />
          </>
        ) : (
          <HeroLobby
            heroes={heroes}
            learnedSkills={learnedSkills}
            skills={skills}
            onSelectHero={handleSelectHero}
          />
        )}
      </div>

      {/* Copy-share link confirmation toast */}
      {toastMessage && (
        <div className="share-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

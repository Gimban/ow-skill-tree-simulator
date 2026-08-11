import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HeroSelector({
  heroes,
  selectedHero,
  onSelectHero,
  onBackToLobby,
  learnedSkills,
  skills
}) {
  
  // Calculate total points spent for a hero
  const getHeroPoints = (heroName) => {
    const heroSkills = skills.filter(s => s.Hero === heroName);
    let total = 0;
    heroSkills.forEach(s => {
      if (learnedSkills[s.ID]) {
        total += learnedSkills[s.ID];
      }
    });
    return total;
  };

  return (
    <div className="hero-selector-bar">
      <div className="hero-selector-title">HERO SELECTOR</div>
      
      {heroes.map(heroName => {
        const points = getHeroPoints(heroName);
        const isActive = heroName === selectedHero;
        
        return (
          <div
            key={heroName}
            className={`hero-mini-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectHero(heroName)}
          >
            <span>{heroName}</span>
            {points > 0 && (
              <span className="hero-mini-tab-points">{points}</span>
            )}
          </div>
        );
      })}

      <button className="lobby-back-btn" onClick={onBackToLobby}>
        <ArrowLeft size={12} />
        <span>로비 화면</span>
      </button>
    </div>
  );
}

import React from 'react';
import { Shield, Zap, Sword, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

// Simple mapping for hero icons and descriptions
const heroMetadata = {
  "라인하르트": {
    role: "돌진 / 탱커 (Tank)",
    description: "굳건한 방벽 방패로 아군을 보호하고 강력한 망치와 돌진으로 전장을 휩씁니다.",
    icon: Shield,
    color: "#f99e1a"
  },
  "트레이서": {
    role: "타격 / 딜러 (Damage)",
    description: "시공간을 넘나들며 점멸과 시간 역행을 사용해 적의 혼란을 유도하는 기동타격가입니다.",
    icon: Zap,
    color: "#00f0ff"
  },
  "겐지": {
    role: "타격 / 딜러 (Damage)",
    description: "사이버네틱 신체와 표창, 신속한 참격 및 적의 포화를 되돌리는 용의 검을 사용합니다.",
    icon: Sword,
    color: "#84cc16"
  }
};

export default function HeroLobby({ heroes, learnedSkills, skills, onSelectHero }) {
  
  // Calculate total points spent for each hero
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
    <div className="hero-lobby">
      <div className="lobby-hex-bg"></div>
      
      <div className="lobby-title-container">
        <h2 className="ow-title" style={{ fontSize: '3rem', letterSpacing: '5px' }}>
          영웅 선택
        </h2>
        <p className="lobby-title-sub">Select your main hero to simulate skill tree</p>
      </div>

      <div className="lobby-cards-grid">
        {heroes.map(heroName => {
          const meta = heroMetadata[heroName] || {
            role: "영웅 (Hero)",
            description: "구글 시트에서 로드된 새로운 영웅입니다.",
            icon: HelpCircle,
            color: "var(--color-available)"
          };
          const IconComp = meta.icon;
          const points = getHeroPoints(heroName);

          return (
            <div 
              key={heroName}
              className="hero-lobby-card"
              onClick={() => onSelectHero(heroName)}
            >
              <div className="hero-card-glow-bg"></div>
              
              <div className="hero-card-portrait">
                <IconComp 
                  className="hero-card-portrait-icon" 
                  style={{ color: points > 0 ? meta.color : undefined }}
                />
              </div>

              <div className="hero-card-info">
                <div>
                  <h3 className="hero-card-name">{heroName}</h3>
                  <p className="hero-card-role" style={{ color: meta.color }}>{meta.role}</p>
                </div>
                <div>
                  {points > 0 ? (
                    <div className="hero-card-points">
                      INVESTED: {points} SP
                    </div>
                  ) : (
                    <div className="hero-card-points" style={{ color: 'var(--color-text-secondary)' }}>
                      0 SP
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {heroes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '15px' }}>
              현재 로드된 스킬 데이터가 없습니다.
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              상단 바의 [샘플 시트 로드]를 누르거나 구글 시트 CSV 주소를 입력하여 데이터를 가져오세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { RefreshCw, Share2, FileSpreadsheet, ArrowLeft, Download } from 'lucide-react';

export default function Header({
  csvUrl,
  setCsvUrl,
  onLoadCsv,
  onReset,
  onCopyShareLink,
  selectedHero,
  onBackToLobby
}) {
  const handleUrlChange = (e) => {
    setCsvUrl(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onLoadCsv();
    }
  };

  // Helper to load sample sheet
  const handleLoadSampleSheet = () => {
    const sampleSheetUrl = "https://docs.google.com/spreadsheets/d/17aU2Dsk3V6tV9MpqoE-i9D90eL_wD9r9JsnY7v5Ua2Y/export?format=csv";
    setCsvUrl(sampleSheetUrl);
    onLoadCsv(sampleSheetUrl);
  };

  return (
    <header className="ow-header">
      <div className="ow-header-logo">
        <div className="ow-logo-slash"></div>
        <div>
          <h1 className="ow-title" style={{ fontSize: '1.4rem', lineHeight: 1 }}>
            OVERWATCH
          </h1>
          <p className="ow-title" style={{ fontSize: '0.85rem', color: 'var(--color-active)', letterSpacing: '1px' }}>
            PvE Skill Tree Simulator
          </p>
        </div>
      </div>

      <div className="ow-header-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="ow-input-slanted" style={{ width: '400px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} className="text-slate-400" style={{ transform: 'skewX(15deg)' }} />
            <input
              type="text"
              placeholder="구글 시트 주소 또는 CSV URL 입력..."
              value={csvUrl}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                width: '100%',
                fontFamily: 'inherit',
                transform: 'skewX(15deg)'
              }}
            />
          </div>
          
          <button className="ow-button-slanted" onClick={() => onLoadCsv()} title="CSV 데이터를 가져옵니다.">
            <span>가져오기</span>
          </button>
          
          <button 
            className="ow-button-slanted" 
            onClick={handleLoadSampleSheet}
            style={{ 
              borderColor: 'var(--color-available)', 
              background: 'rgba(0, 240, 255, 0.05)'
            }}
            title="미리 구성된 샘플 구글 시트를 불러옵니다."
          >
            <span style={{ color: 'var(--color-available)' }}>샘플 시트 로드</span>
          </button>
        </div>

        <div style={{ width: '2px', height: '24px', background: 'var(--color-border)' }}></div>

        {selectedHero && (
          <>
            <button className="ow-button-slanted" onClick={onReset} title="현재 영웅의 스킬 트리를 초기화합니다.">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> 초기화
              </span>
            </button>

            <button className="ow-button-slanted" onClick={onCopyShareLink} title="현재 스킬 트리 빌드 상태를 링크로 복사합니다.">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Share2 size={14} /> 빌드 공유
              </span>
            </button>
            
            <button 
              className="ow-button-slanted" 
              onClick={onBackToLobby}
              style={{ border: '2px solid rgba(255, 255, 255, 0.3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> 영웅 선택
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

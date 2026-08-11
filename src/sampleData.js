export const sampleData = [
  // === Reinhardt ===
  {
    Hero: "라인하르트",
    ID: "REIN_SHIELD_BASE",
    Name: "방벽 방패 (Barrier Field)",
    Tier: 1,
    MaxRank: 1,
    Description: "전방에 아군을 보호하는 에너지 방벽을 펼칩니다. 방벽 내구도가 1200으로 설정됩니다.",
    Prerequisites: "",
    ExclusiveWith: "",
    Icon: "Shield"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_SHIELD_REGEN",
    Name: "방벽 급속 복원 (Shield Restoration)",
    Tier: 2,
    MaxRank: 3,
    Description: "방벽 방패의 내구도 복원 대기 시간이 {rank * 0.5}초 감소하고, 복원 속도가 {rank * 15}% 증가합니다.",
    Prerequisites: "REIN_SHIELD_BASE",
    ExclusiveWith: "",
    Icon: "Zap"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_SHIELD_SPEED",
    Name: "방패 돌격 (Shield Charge)",
    Tier: 2,
    MaxRank: 3,
    Description: "방벽 방패를 활성화한 상태에서 이동 속도가 {rank * 10}% 증가합니다.",
    Prerequisites: "REIN_SHIELD_BASE",
    ExclusiveWith: "",
    Icon: "Move"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_SHIELD_EXPLODE",
    Name: "피드백 회로 (Feedback Loop)",
    Tier: 3,
    MaxRank: 1,
    Description: "방벽 방패가 파괴될 때 강력한 에너지가 폭발하여 8m 내의 적에게 150의 피해를 입히고 멀리 밀쳐냅니다.",
    Prerequisites: "REIN_SHIELD_REGEN",
    ExclusiveWith: "REIN_SHIELD_REFLECT",
    Icon: "Bomb"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_SHIELD_REFLECT",
    Name: "에너지 편향 (Energy Deflection)",
    Tier: 3,
    MaxRank: 1,
    Description: "방벽 방패에 부딪히는 모든 투사체 피해의 35%를 전방으로 반사하여 적에게 되돌려 줍니다.",
    Prerequisites: "REIN_SHIELD_SPEED",
    ExclusiveWith: "REIN_SHIELD_EXPLODE",
    Icon: "RotateCcw"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_CHARGE_BASE",
    Name: "중력 돌진 (Gravity Charge)",
    Tier: 4,
    MaxRank: 1,
    Description: "돌진 시 정면에 중력장을 형성하여 돌진 경로의 좌우 3m 내에 있는 모든 적들을 중심으로 끌어당깁니다.",
    Prerequisites: "REIN_SHIELD_BASE",
    ExclusiveWith: "",
    Icon: "ChevronsRight"
  },
  {
    Hero: "라인하르트",
    ID: "REIN_EARTHSHATTER_EXT",
    Name: "대지분쇄: 공명 (Earthshatter: Resonance)",
    Tier: 5,
    MaxRank: 2,
    Description: "대지분쇄의 사거리가 {rank * 20}% 증가하며, 기절한 적에게 주는 모든 피해량이 {rank * 15}% 증가합니다.",
    Prerequisites: "REIN_CHARGE_BASE",
    ExclusiveWith: "",
    Icon: "Flame"
  },

  // === Tracer ===
  {
    Hero: "트레이서",
    ID: "TRACER_BLINK_BASE",
    Name: "시간 가속기 (Blink Charger)",
    Tier: 1,
    MaxRank: 1,
    Description: "점멸의 최대 충전 횟수가 3회에서 4회로 증가하고, 기본 이동 속도가 10% 증가합니다.",
    Prerequisites: "",
    ExclusiveWith: "",
    Icon: "Zap"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_BLINK_CD",
    Name: "시공간 안정화 (Chronal Stability)",
    Tier: 2,
    MaxRank: 3,
    Description: "점멸의 재충전 대기 시간이 {rank * 0.4}초 감소합니다.",
    Prerequisites: "TRACER_BLINK_BASE",
    ExclusiveWith: "",
    Icon: "Clock"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_MELEE_BLINK",
    Name: "점멸 충격 (Blink Strike)",
    Tier: 2,
    MaxRank: 3,
    Description: "점멸 사용 직후 1.5초 내에 가하는 첫 근접 공격의 피해량이 {rank * 30}% 증가합니다.",
    Prerequisites: "TRACER_BLINK_BASE",
    ExclusiveWith: "",
    Icon: "Sword"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_BLINK_HEAL",
    Name: "시간적 복구 (Temporal Mend)",
    Tier: 3,
    MaxRank: 1,
    Description: "점멸을 사용할 때마다 최근 잃은 생명력의 20%를 즉시 회복합니다.",
    Prerequisites: "TRACER_BLINK_CD",
    ExclusiveWith: "TRACER_BLINK_DAMAGE",
    Icon: "Heart"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_BLINK_DAMAGE",
    Name: "공간 왜곡 (Spatial Distortion)",
    Tier: 3,
    MaxRank: 1,
    Description: "점멸할 때 지나간 경로 상의 공기가 폭발하여 궤적에 닿은 모든 적에게 50의 지속 피해를 줍니다.",
    Prerequisites: "TRACER_MELEE_BLINK",
    ExclusiveWith: "TRACER_BLINK_HEAL",
    Icon: "Wind"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_RECALL_CD",
    Name: "시간 역행 극대화 (Recall Maximization)",
    Tier: 4,
    MaxRank: 1,
    Description: "시간 역행의 재사용 대기 시간이 3초 감소하며, 역행하는 시간이 기존 3초에서 5초 전으로 연장됩니다.",
    Prerequisites: "TRACER_BLINK_BASE",
    ExclusiveWith: "",
    Icon: "CornerUpLeft"
  },
  {
    Hero: "트레이서",
    ID: "TRACER_PULSE_STICK",
    Name: "펄스 폭탄: 분열 (Pulse Bomb: Fission)",
    Tier: 5,
    MaxRank: 2,
    Description: "펄스 폭탄이 폭발할 때 주위로 {rank * 2}개의 초소형 자탄(각 100의 피해)이 분열되어 사방으로 폭발합니다.",
    Prerequisites: "TRACER_RECALL_CD",
    ExclusiveWith: "",
    Icon: "Sparkles"
  },

  // === Genji ===
  {
    Hero: "겐지",
    ID: "GENJI_CYBER_BASE",
    Name: "사이버네틱 민첩성 (Cybernetic Agility)",
    Tier: 1,
    MaxRank: 1,
    Description: "이단 점프 후 착지할 때 이동 속도가 3초 동안 25% 증가하며, 벽 타기 속도가 40% 증가합니다.",
    Prerequisites: "",
    ExclusiveWith: "",
    Icon: "User"
  },
  {
    Hero: "겐지",
    ID: "GENJI_DASH_CD",
    Name: "신속한 참격 (Swift Strike: CD)",
    Tier: 2,
    MaxRank: 3,
    Description: "질풍참으로 적을 처치하면 재사용 대기 시간이 즉시 초기화되며, 처치하지 못하더라도 대기 시간이 {rank * 1.5}초 감소합니다.",
    Prerequisites: "GENJI_CYBER_BASE",
    ExclusiveWith: "",
    Icon: "Zap"
  },
  {
    Hero: "겐지",
    ID: "GENJI_DEFLECT_DUR",
    Name: "철벽의 칼날 (Enhanced Deflect)",
    Tier: 2,
    MaxRank: 3,
    Description: "튕겨내기의 지속 시간이 {rank * 0.5}초 증가하고 튕겨내기로 적에게 되돌려 주는 피해량이 {rank * 15}% 증가합니다.",
    Prerequisites: "GENJI_CYBER_BASE",
    ExclusiveWith: "",
    Icon: "ShieldAlert"
  },
  {
    Hero: "겐지",
    ID: "GENJI_DASH_SHADOW",
    Name: "그림자 칼날 (Shadow Blade)",
    Tier: 3,
    MaxRank: 1,
    Description: "질풍참 사용 시 분신이 함께 질풍참을 가하여 경로 내의 적들에게 추가로 60의 피해를 입히고 1초간 출혈 상태(초당 15 피해)로 만듭니다.",
    Prerequisites: "GENJI_DASH_CD",
    ExclusiveWith: "GENJI_DEFLECT_ALL",
    Icon: "Layers"
  },
  {
    Hero: "겐지",
    ID: "GENJI_DEFLECT_ALL",
    Name: "전방위 칼날 장막 (Omni-Deflect)",
    Tier: 3,
    MaxRank: 1,
    Description: "튕겨내기가 활성화된 동안 전방뿐만 아니라 자신을 중심으로 360도 모든 방향의 공격을 방어하고 반사합니다.",
    Prerequisites: "GENJI_DEFLECT_DUR",
    ExclusiveWith: "GENJI_DASH_SHADOW",
    Icon: "RotateCw"
  },
  {
    Hero: "겐지",
    ID: "GENJI_SHURIKEN_POW",
    Name: "바람의 표창 (Gale Shuriken)",
    Tier: 4,
    MaxRank: 1,
    Description: "표창이 첫 번째 적을 관통하여 뒤에 있는 적에게도 동일한 피해를 입힙니다. 벽을 타는 동안 표창 발사 속도가 30% 빨라집니다.",
    Prerequisites: "GENJI_CYBER_BASE",
    ExclusiveWith: "",
    Icon: "Disc"
  },
  {
    Hero: "겐지",
    ID: "GENJI_DRAGON_STRIKE",
    Name: "용검: 승천 (Dragonblade: Ascension)",
    Tier: 5,
    MaxRank: 2,
    Description: "용검 상태에서 검을 휘두를 때마다 전방 12m 범위로 용의 검기가 날아가 궤적 상의 모든 적에게 {rank * 50}의 피해를 입힙니다.",
    Prerequisites: "GENJI_SHURIKEN_POW",
    ExclusiveWith: "",
    Icon: "Flame"
  }
];

import { Shield, Zap, Sword } from 'lucide-react';

// 영웅별 메타데이터 (역할, 설명, 아이콘, 테마 색상)
export const heroMetadata = {
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

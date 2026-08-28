export type CommuteStation = {
  id: string;
  name: string;
  area: string;
};

export type CommuteFareRecord = {
  originStationId: string;
  schoolId: string;
  routeLabel: string;
  studentSixMonthYen: number;
  verifiedAt: string;
  sourceUrl: string;
};

export type CommuteFareLookup = {
  originStationId: string;
  schoolId: string;
  status: 'verified' | 'unverified';
  routeLabel: string | null;
  studentSixMonthYen: number | null;
  verifiedAt: string | null;
  sourceUrl: string | null;
};

export const commuteStations: CommuteStation[] = [
  { id: 'omiya', name: '大宮駅', area: '埼玉県' },
  { id: 'urawa', name: '浦和駅', area: '埼玉県' },
  { id: 'akabane', name: '赤羽駅', area: '東京都' },
  { id: 'kitasenju', name: '北千住駅', area: '東京都' },
  { id: 'kashiwa', name: '柏駅', area: '千葉県' },
  { id: 'funabashi', name: '船橋駅', area: '千葉県' },
  { id: 'chiba', name: '千葉駅', area: '千葉県' },
  { id: 'yokohama', name: '横浜駅', area: '神奈川県' },
  { id: 'kawasaki', name: '川崎駅', area: '神奈川県' },
  { id: 'hachioji', name: '八王子駅', area: '東京都' },
];

// 金額は公式資料で経路・学生区分・6か月期間を確認できたものだけを追加する。
// 未登録区間を通常運賃や距離から補間してはいけない。
export const verifiedCommuteFares: CommuteFareRecord[] = [];

export const commuteFareKey = (originStationId: string, schoolId: string) =>
  [originStationId, schoolId].join(':');

export const getCommuteFare = (originStationId: string, schoolId: string): CommuteFareLookup => {
  const record = verifiedCommuteFares.find(
    (fare) => fare.originStationId === originStationId && fare.schoolId === schoolId,
  );

  if (!record) {
    return {
      originStationId,
      schoolId,
      status: 'unverified',
      routeLabel: null,
      studentSixMonthYen: null,
      verifiedAt: null,
      sourceUrl: null,
    };
  }

  return {
    ...record,
    status: 'verified',
  };
};

export const parseFareYen = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('-')) return null;
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return null;
  const yen = Number(digits);
  return Number.isSafeInteger(yen) && yen > 0 ? yen : null;
};

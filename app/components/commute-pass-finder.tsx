'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  commuteFareKey,
  commuteStations,
  getCommuteFare,
  parseFareYen,
} from '../data/commute';
import type { School } from '../data/schools';

type CommutePassFinderProps = {
  schools: School[];
  homeStationId: string;
  setHomeStationId: Dispatch<SetStateAction<string>>;
  commutePassCosts: Record<string, string>;
  setCommutePassCosts: Dispatch<SetStateAction<Record<string, string>>>;
  commuteTimes: Record<string, string>;
  setCommuteTimes: Dispatch<SetStateAction<Record<string, string>>>;
};

const formatYen = (value: number) => value.toLocaleString('ja-JP') + '円';

export default function CommutePassFinder({
  schools,
  homeStationId,
  setHomeStationId,
  commutePassCosts,
  setCommutePassCosts,
  commuteTimes,
  setCommuteTimes,
}: CommutePassFinderProps) {
  const homeStation = commuteStations.find((station) => station.id === homeStationId);

  return (
    <section id="commute">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">通学費用</div>
          <h2>駅を選ぶと、確認済みの定期代を表示</h2>
          <p>
            自宅最寄り駅と学校の通学先駅を組み合わせ、確認済みの大学生6か月定期だけを表示します。
            未確認区間は通常運賃や距離から推定しません。
          </p>
        </div>
        <div className="searchbox">
          <div className="field station-field">
            <label htmlFor="home-station">自宅最寄り駅</label>
            <select
              id="home-station"
              value={homeStationId}
              onChange={(event) => setHomeStationId(event.target.value)}
            >
              <option value="">駅を選択してください</option>
              {commuteStations.map((station) => (
                <option value={station.id} key={station.id}>
                  {station.name}（{station.area}）
                </option>
              ))}
            </select>
            <small>初期MVPは主要駅10駅から選択できます。</small>
          </div>
          <div className="filters commute-inputs">
            {schools.map((school) => {
              const fareKey = homeStationId ? commuteFareKey(homeStationId, school.id) : '';
              const recordedFare = homeStationId ? getCommuteFare(homeStationId, school.id) : null;
              const enteredFare = fareKey ? parseFareYen(commutePassCosts[fareKey] ?? '') : null;
              const shownFare = enteredFare ?? recordedFare?.studentSixMonthYen ?? null;
              const routeUrl = homeStation
                ? 'https://www.google.com/maps/dir/?api=1&origin='
                  + encodeURIComponent(homeStation.name)
                  + '&destination='
                  + encodeURIComponent(school.commuteStation)
                  + '&travelmode=transit'
                : undefined;

              return (
                <div className="field commute-card" key={school.id}>
                  <label htmlFor={'commute-pass-' + school.id}>
                    {school.name}
                    <small className="info">通学先駅：{school.commuteStation}</small>
                    {school.commuteStationNote && <small className="info">{school.commuteStationNote}</small>}
                  </label>
                  <div className="commute-meta">
                    <span className={recordedFare?.status === 'verified' ? 'fare-status verified' : 'fare-status'}>
                      {recordedFare?.status === 'verified' ? '確認済みデータ' : '定期代未確認'}
                    </span>
                    <a className={'route-link' + (routeUrl ? '' : ' disabled')} href={routeUrl} target="_blank" rel="noreferrer" aria-disabled={!routeUrl}>
                      経路を確認 ↗
                    </a>
                  </div>
                  <div className={'fare-readout' + (shownFare === null ? ' unverified' : '')}>
                    {shownFare === null ? '未確認' : formatYen(shownFare)}
                    {enteredFare !== null && <small>入力値</small>}
                  </div>
                  <label className="manual-fare-label" htmlFor={'commute-pass-' + school.id}>
                    確認済み金額を入力（任意）
                  </label>
                  <input
                    id={'commute-pass-' + school.id}
                    type="text"
                    inputMode="numeric"
                    placeholder="例：60,000"
                    value={fareKey ? commutePassCosts[fareKey] ?? '' : ''}
                    disabled={!homeStationId}
                    onChange={(event) => {
                      if (!fareKey) return;
                      setCommutePassCosts((current) => ({ ...current, [fareKey]: event.target.value }));
                    }}
                  />
                  <small>入力値はこのブラウザ内だけで利用します。</small>
                  <label className="time-label" htmlFor={'commute-' + school.id}>
                    所要時間（検索条件用）
                  </label>
                  <input
                    id={'commute-' + school.id}
                    type="number"
                    min="1"
                    max="300"
                    inputMode="numeric"
                    placeholder="例：45"
                    value={commuteTimes[school.id] ?? ''}
                    onChange={(event) => setCommuteTimes((current) => ({ ...current, [school.id]: event.target.value }))}
                  />
                  <small>分</small>
                </div>
              );
            })}
          </div>
          <p className="info simulator-note">
            確認済みデータは駅・学校・経路・学生区分・6か月期間がそろったものだけを登録します。
            手入力した金額は参考値として4年間の試算に反映されます。未入力の学校は通学費0円として扱います。
          </p>
        </div>
      </div>
    </section>
  );
}

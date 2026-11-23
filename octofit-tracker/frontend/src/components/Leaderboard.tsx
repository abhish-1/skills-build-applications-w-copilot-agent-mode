import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

async function loadLeaderboard() {
  const body = await getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard');
  return body.leaderboard;
}

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      emptyMessage="No leaderboard scores yet."
      loadItems={loadLeaderboard}
      renderItems={(entries) => (
        <ol className="list-group list-group-numbered">
          {entries.map((entry) => (
            <li className="list-group-item" key={entry.rank}>
              <strong>{entry.teamName}</strong>: {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    />
  );
}

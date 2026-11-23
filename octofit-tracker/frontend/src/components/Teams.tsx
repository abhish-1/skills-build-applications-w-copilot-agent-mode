import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members: string[];
};

async function loadTeams() {
  const body = await getJson<{ teams: Team[] }>('/api/teams');
  return body.teams;
}

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      emptyMessage="No teams yet."
      loadItems={loadTeams}
      renderItems={(teams) => (
        <ul className="list-group">
          {teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? index}>
              <strong>{team.name}</strong> ({team.mascot})
              <p className="mb-0">Members: {team.members.join(', ') || 'None'}</p>
            </li>
          ))}
        </ul>
      )}
    />
  );
}

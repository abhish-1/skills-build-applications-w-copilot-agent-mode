import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

async function loadActivities() {
  const body = await getJson<{ activities: Activity[] }>('/api/activities');
  return body.activities;
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      emptyMessage="No activities yet."
      loadItems={loadActivities}
      renderItems={(activities) => (
        <ul className="list-group">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? index}>
              <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}

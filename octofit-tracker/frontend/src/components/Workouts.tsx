import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type WorkoutSuggestion = {
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
};

async function loadWorkoutSuggestions() {
  const userEmail = encodeURIComponent('mona@example.com');
  const body = await getJson<{ suggestions: WorkoutSuggestion[] }>(
    `/api/workouts/suggestions/${userEmail}`,
  );
  return body.suggestions;
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyMessage="No workout suggestions available."
      loadItems={loadWorkoutSuggestions}
      renderItems={(suggestions) => (
        <ul className="list-group">
          {suggestions.map((workout, index) => (
            <li className="list-group-item" key={`${workout.title}-${index}`}>
              <strong>{workout.title}</strong> — {workout.focus}, {workout.minutes} minutes, {workout.difficulty}
              <p className="mb-0">{workout.reason}</p>
            </li>
          ))}
        </ul>
      )}
    />
  );
}

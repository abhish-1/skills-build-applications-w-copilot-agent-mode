import { Activity, Team, User, Workout } from '../models/index.js';

type HttpError = Error & { status: number };

function badRequest(message: string): HttpError {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): HttpError {
  return Object.assign(new Error(message), { status: 404 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}

function normalizeFocus(focus: unknown): string {
  return typeof focus === 'string' ? focus.trim().toLowerCase() : '';
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw badRequest('Activity input must be an object');

  const { userId, teamId, type, minutes } = input;
  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw badRequest('Activity must reference a valid user and team');
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw badRequest('Activity type is required');
  }
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw badRequest('Activity minutes must be a positive number');
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw badRequest('Activity user and team must exist');
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw badRequest('Team input must be an object');

  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw badRequest('Team name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw badRequest('Team mascot is required');
  }
  if (!Array.isArray(members) || !members.every(isObjectId)) {
    throw badRequest('Team members must be an array of valid user IDs');
  }

  const memberIds = [...new Set(members)];
  if (memberIds.length > 0 && await User.countDocuments({ _id: { $in: memberIds } }) !== memberIds.length) {
    throw badRequest('Team members must reference existing users');
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    { $unwind: { path: '$activities', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        teamName: { $first: '$name' },
        totalPoints: { $sum: { $ifNull: ['$activities.points', 0] } },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return teams.map(({ teamName, totalPoints }, index) => ({
    teamName,
    totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw notFound('No user found for that email');

  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
    Workout.find().lean(),
  ]);
  const preferredFocuses = [
    ...(typeof user.fitnessGoal === 'string' ? [user.fitnessGoal] : []),
    ...recentActivities.map(({ type }) => type),
  ].map(normalizeFocus).filter(Boolean);

  const focusRank = (focus: unknown) => {
    const index = preferredFocuses.indexOf(normalizeFocus(focus));
    return index === -1 ? preferredFocuses.length : index;
  };
  const sortedWorkouts = workouts.sort((left, right) =>
    focusRank(left.focus) - focusRank(right.focus)
    || String(left.title ?? '').localeCompare(String(right.title ?? '')),
  );

  return sortedWorkouts.map((workout) => {
    const matchingFocus = preferredFocuses.find(
      (focus) => focus === normalizeFocus(workout.focus),
    );
    const goalFocus = normalizeFocus(user.fitnessGoal);
    const reason = matchingFocus !== undefined && matchingFocus === goalFocus
      ? `Recommended to support your ${user.fitnessGoal} goal.`
      : matchingFocus
        ? `Recommended based on your recent ${matchingFocus} activity.`
        : 'A general suggestion to help you stay active.';
    return { ...workout, reason };
  });
}

export { User };

import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: String,
  focus: { type: String, required: true },
  minutes: { type: Number, required: true },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);

// This is a Mongoose model for the Workout collection in MongoDB. It defines the schema for a workout document, which includes the following fields:
// - title: A string representing the title of the workout (optional).
// - focus: A required string indicating the focus area of the workout (e.g., "cardio", "strength").
// - minutes: A required number representing the duration of the workout in minutes.
// - difficulty: A required string indicating the difficulty level of the workout (e.g., "easy", "medium", "hard").

// The model is then exported for use in other parts of the application, allowing for CRUD operations on workout documents in the MongoDB database.

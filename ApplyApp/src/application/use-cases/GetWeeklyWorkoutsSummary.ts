import { IWorkoutRepository } from "../../domain/repositories/IWorkoutRepository";
import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";
import { IExerciseRepository } from "../../domain/repositories/IExerciseRepository";
import { Workout } from "../../domain/entities/Workout";

export interface WorkoutSummaryItem {
  workout: Workout;
  exerciseCount: number;
  muscleGroups: string[];
}

export class GetWeeklyWorkoutsSummary {
  constructor(
    private workoutRepo: IWorkoutRepository,
    private weRepo: IWorkoutExerciseRepository,
    private exerciseRepo: IExerciseRepository
  ) {}

  async execute(userId: string): Promise<WorkoutSummaryItem[]> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // domingo da semana atual

    const workouts = await this.workoutRepo.findWeeklyByUserId(
      userId,
      weekStart.toISOString().split("T")[0],
      today.toISOString().split("T")[0]
    );

    const allExercises = await this.exerciseRepo.findAll();
    const exerciseMap = new Map(allExercises.map(e => [e.id, e]));

    const summary: WorkoutSummaryItem[] = [];
    for (const workout of workouts) {
      const workoutExercises = await this.weRepo.findByWorkoutId(workout.id);
      const muscleGroupSet = new Set<string>();
      for (const we of workoutExercises) {
        const ex = exerciseMap.get(we.exercise_id);
        if (ex) muscleGroupSet.add(ex.muscle_group);
      }
      summary.push({
        workout,
        exerciseCount: workoutExercises.length,
        muscleGroups: Array.from(muscleGroupSet),
      });
    }

    return summary;
  }
}

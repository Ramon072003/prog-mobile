import { IWorkoutExerciseRepository } from "../../domain/repositories/IWorkoutExerciseRepository";

export interface UpdateWorkoutExerciseProps {
  id: string;
  sets: number;
  reps: number;
  weight: number;
  media_url?: string;
}

export class UpdateWorkoutExercise {
  constructor(private weRepo: IWorkoutExerciseRepository) {}

  async execute(props: UpdateWorkoutExerciseProps): Promise<void> {
    const we = await this.weRepo.findById(props.id);
    if (!we) throw new Error("Exercício não encontrado.");
    we.updatePerformance(props.sets, props.reps, props.weight, props.media_url);
    await this.weRepo.update(we);
  }
}

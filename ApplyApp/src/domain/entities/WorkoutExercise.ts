export enum MediaSyncStatus {
  PENDING = "pending",
  UPLOADED = "uploaded",
}

export interface WorkoutExerciseProps {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number;
  media_url?: string;
  media_sync: MediaSyncStatus;
  created_at?: string;
}

export class WorkoutExercise {
  private props: WorkoutExerciseProps;

  constructor(props: WorkoutExerciseProps) {
    if (props.sets <= 0) throw new Error("As séries devem ser maiores que zero.");
    if (props.reps <= 0) throw new Error("As repetições devem ser maiores que zero.");
    if (props.weight < 0) throw new Error("O peso não pode ser negativo.");

    this.props = {
      ...props,
      media_sync: props.media_sync || MediaSyncStatus.PENDING,
    };
  }

  get id() { return this.props.id; }
  get workout_id() { return this.props.workout_id; }
  get exercise_id() { return this.props.exercise_id; }
  get sets() { return this.props.sets; }
  get reps() { return this.props.reps; }
  get weight() { return this.props.weight; }
  get media_url() { return this.props.media_url; }
  get media_sync() { return this.props.media_sync; }

  setMediaUploaded(publicUrl: string) {
    this.props.media_url = publicUrl;
    this.props.media_sync = MediaSyncStatus.UPLOADED;
  }

  toJSON() {
    return { ...this.props };
  }
}

export interface ExerciseProps {
  id: string;
  name: string;
  muscle_group: string;
  created_at?: string;
}

export class Exercise {
  private props: ExerciseProps;

  constructor(props: ExerciseProps) {
    if (!props.name || props.name.trim() === "") {
      throw new Error("O nome do exercício é obrigatório.");
    }
    if (!props.muscle_group || props.muscle_group.trim() === "") {
      throw new Error("O grupo muscular é obrigatório.");
    }
    this.props = props;
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get muscle_group() { return this.props.muscle_group; }
  get created_at() { return this.props.created_at; }

  toJSON() {
    return { ...this.props };
  }
}

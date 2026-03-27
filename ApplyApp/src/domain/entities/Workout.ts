export enum WorkoutStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
}

export enum SyncStatus {
  PENDING = "pending",
  SYNCED = "synced",
}

export interface WorkoutProps {
  id: string;
  user_id: string;
  date: string;
  status: WorkoutStatus;
  sync_status: SyncStatus;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export class Workout {
  private props: WorkoutProps;

  constructor(props: WorkoutProps) {
    if (!props.user_id) throw new Error("O ID do usuário é obrigatório.");
    this.props = {
      ...props,
      status: props.status || WorkoutStatus.ACTIVE,
      sync_status: props.sync_status || SyncStatus.PENDING,
    };
  }

  get id() { return this.props.id; }
  get user_id() { return this.props.user_id; }
  get date() { return this.props.date; }
  get status() { return this.props.status; }
  get sync_status() { return this.props.sync_status; }
  get latitude() { return this.props.latitude; }
  get longitude() { return this.props.longitude; }

  complete(latitude?: number, longitude?: number) {
    this.props.status = WorkoutStatus.COMPLETED;
    this.props.latitude = latitude;
    this.props.longitude = longitude;
    this.props.updated_at = new Date().toISOString();
  }

  markSynced() {
    this.props.sync_status = SyncStatus.SYNCED;
  }

  toJSON() {
    return { ...this.props };
  }
}

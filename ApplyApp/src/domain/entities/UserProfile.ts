export interface UserProfileProps {
  id: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserProfile {
  readonly id: string;
  name: string;
  avatar_url?: string;
  readonly created_at: string;
  updated_at: string;

  constructor(props: UserProfileProps) {
    if (!props.name || props.name.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres.");
    }
    this.id = props.id;
    this.name = props.name.trim();
    this.avatar_url = props.avatar_url;
    this.created_at = props.created_at ?? new Date().toISOString();
    this.updated_at = props.updated_at ?? new Date().toISOString();
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres.");
    }
    this.name = newName.trim();
    this.updated_at = new Date().toISOString();
  }

  toJSON(): UserProfileProps {
    return {
      id: this.id,
      name: this.name,
      avatar_url: this.avatar_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

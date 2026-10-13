export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  updatedAt: string;
}

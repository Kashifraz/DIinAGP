export interface Project {
  id: number;
  owner: number;
  owner_username: string;
  name: string;
  description: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: "active" | "archived";
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: "active" | "archived";
}


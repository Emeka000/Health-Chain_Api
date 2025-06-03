// Mock for Role entity
export class Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript module augmentation for missing modules

// This provides type declarations for the missing modules without actually importing them
// These declarations will be used by TypeScript during compilation but won't affect runtime
declare module 'src/medical-staff/entities/department.entity' {
  export class Department {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
  }
}

declare module 'src/role/entities/role.entity' {
  export class Role {
    id: string;
    name: string;
    description?: string;
    permissions?: string[];
    isActive: boolean;
  }
}

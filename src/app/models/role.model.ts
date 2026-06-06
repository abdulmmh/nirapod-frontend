export interface RolePermission {
  module: string;
  create: boolean;
  read:   boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
}

export interface Role {
  id:          number;
  name:        string;
  code:        string;
  description: string;
  color:       string;
  status:      'Active' | 'Inactive';
  permissions: RolePermission[];   
  createdAt:   string;
}

// Raw API response — permissions is a JSON string
export interface RoleResponse {
  id:          number;
  name:        string;
  code:        string;
  description: string;
  color:       string;
  status:      string;
  permissions: string;   
  createdAt:   string;
}

export interface RoleCreateRequest {
  name:        string;
  code:        string;
  description: string;
  color:       string;
  status:      string;
  permissions: string;   
}

export interface DeployConfig {
  dir: string;
  projectName: string;
  directusUrl: string;
  directusToken: string;
  adminPassword?: string;
  adminSecret?: string;
  force: boolean;
}

export interface DeployResult {
  projectUrl: string;
  envVarsSet: string[];
  errors: string[];
}

export interface EnvVar {
  key: string;
  value: string;
  required: boolean;
}

export { checkVercelCli, linkProject, setEnvVar, deploy } from './vercel.js';
export { detectRequiredEnvVars, readEnvLocal, hasDirectusCmsDep } from './env-vars.js';
export type { EnvVar, DeployConfig, DeployResult } from './types.js';

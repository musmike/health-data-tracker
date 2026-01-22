export interface TestParameter {
  id?: number;
  name: string;
  unit: string;
  minNorm?: number;
  maxNorm?: number;
  privateParam?: boolean;
}

export interface TestResult {
  id?: number;
  value: number;
  date: string;
  parameterId: number;
  parameterName?: string;
  parameterUnit?: string;
  minNorm?: number;
  maxNorm?: number;
}
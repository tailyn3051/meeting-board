export interface ProjectDetails {
  id: string;
  quantity: number;
  pcbSize: string;
  targetShipDate: string;
}

export interface SpecDetails {
  id: string;
  title: string;
  items: Record<string, string | number>;
}

export interface ProcessStep {
  id:string;
  name:string;
  details: string;
  type: 'process' | 'test' | 'qc' | 'pack';
  isActive: boolean;
  startDate: string;
  endDate: string;
  relatedSpecId?: string | null;
}

export interface ScheduleTask {
  date: string;
  day: string;
  task: string;
  notes: string;
  highlight?: string;
  ganttGroup: string; // Links this task to a bar in the Gantt chart
}

export interface GanttTask {
  name: string;
  start: Date;
  end: Date;
}

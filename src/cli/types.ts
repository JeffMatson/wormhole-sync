interface Queue {
  total: number;
  active: number;
  pending: number;
  completed: number;
  title?: string;
}

export interface QueueUpdate {
  active?: number;
  pending?: number;
  total?: number;
  completed?: number;
}

export type Queues = Record<string, Queue>;

export type QueueType = keyof Queues;

export type QueueAction = "add" | "remove" | "set";

export type QueueProperty = keyof Queue;

export interface QueueActionProps {
  queueType: QueueType;
  action: QueueAction;
  property: QueueProperty;
  value?: number;
}

import { ReactNode } from 'react';

export interface ServiceType {
  id: number;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  highlight: string;
}

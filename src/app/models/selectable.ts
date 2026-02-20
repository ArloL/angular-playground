import { EntityId } from './entity';

export interface Selectable {
  id: EntityId;
  label: string;
  selected: boolean;
}

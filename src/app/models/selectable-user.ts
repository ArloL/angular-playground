import { EntityId } from './entity';

export interface SelectableUser {
  userId: EntityId;
  name: string;
  selected: boolean;
}

import { StateInterfaceFromModule } from '../src';
import { doggoState } from './doggos';
import { kittenState } from './kittens';

export interface RootState extends StateInterfaceFromModule<typeof kittenState> {
  doggoState: StateInterfaceFromModule<typeof doggoState>;
}

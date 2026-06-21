import {
  bridgeAbstractInputSuggest,
  unbridgeAbstractInputSuggest
} from './bridges/abstract-input-suggest-bridge.ts';
import {
  bridgeCapacitorAdapter,
  unbridgeCapacitorAdapter
} from './bridges/capacitor-adapter-bridge.ts';
import {
  bridgeComponent,
  unbridgeComponent
} from './bridges/component-bridge.ts';
import {
  bridgeFileSystemAdapter,
  unbridgeFileSystemAdapter
} from './bridges/file-system-adapter-bridge.ts';
import {
  bridgeSettingGroup,
  unbridgeSettingGroup
} from './bridges/setting-group-bridge.ts';
import {
  bridgeTAbstractFile,
  unbridgeTAbstractFile
} from './bridges/t-abstract-file-bridge.ts';
import {
  bridgeVault,
  unbridgeVault
} from './bridges/vault-bridge.ts';

export function setup(): void {
  bridgeAbstractInputSuggest();
  bridgeCapacitorAdapter();
  bridgeComponent();
  bridgeFileSystemAdapter();
  bridgeSettingGroup();
  bridgeTAbstractFile();
  bridgeVault();
}

export function teardown(): void {
  unbridgeAbstractInputSuggest();
  unbridgeCapacitorAdapter();
  unbridgeComponent();
  unbridgeFileSystemAdapter();
  unbridgeSettingGroup();
  unbridgeTAbstractFile();
  unbridgeVault();
}

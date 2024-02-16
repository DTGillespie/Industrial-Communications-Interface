export interface NetworkConfiguration {
  MAC_ADDRESS : string;
  HOST        : string;
  PORT        : number;
};

export interface NetworkEntity {
  setNetworkConfiguration(configuration: NetworkConfiguration): void;
  getNetworkConfiguration(): NetworkConfiguration;
};

export interface CIPDevice {
  ID : string;
  NETWORK_CONFIGURATION : NetworkConfiguration;
};  
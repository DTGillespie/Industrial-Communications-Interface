import { Utilities, NetworkConfiguration, NetworkEntity, CIPDevice } from "./lib";

class Device implements NetworkEntity {
  private networkConfiguration: NetworkConfiguration;
  
  constructor() {
    this.networkConfiguration = {
      MAC_ADDRESS  : "",
      HOST : "",
      PORT : 0
    };
  };

  public setNetworkConfiguration(configuration: NetworkConfiguration): void { 
    this.networkConfiguration = configuration;
    Object.freeze(this.networkConfiguration);
  };

  public getNetworkConfiguration(): NetworkConfiguration {
    return this.networkConfiguration;
  };

};

class ENIPCIPRequest {

  constructor() {
    
  };

};

export class IndustrialCommunicationsInterface {
  private static devices: Map<string, Device> = new Map<string, Device>();

  public static newDevice(netConfig: NetworkConfiguration): CIPDevice | null {
    try {

      const id = Utilities.makeHashId(); 
      IndustrialCommunicationsInterface.devices.set(id, new Device);
      const device = IndustrialCommunicationsInterface.devices.get(id);

      if (device) {
        device.setNetworkConfiguration(netConfig);
        const networkConfiguration = device.getNetworkConfiguration();
        return {ID: id, NETWORK_CONFIGURATION: networkConfiguration};
      } else {
        return null;
      };

    } catch(error) {
      console.log(error);
      return null;
    };
  };

  public static deleteDevice(id: string) { this.devices.delete(id); };
};
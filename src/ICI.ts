import { 
  Utilities, 
  NetworkConfiguration, 
  NetworkEntity, 
  CIPDevice, 
  EIPHeader,
  CommandSpecificData,
  CIPFrame,
  RequestCallback,
  Directive,
  PacketConstructor
 } from "./lib";

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

  public requestFunctionRef(): Function {
    return function request(
      directive           : Directive,
      callback            : RequestCallback
    ): void {
      const frames = PacketConstructor.create(directive);
    };
  };
};

class Request {

  private ethernetIpHeader    : EIPHeader    | null;
  private commandSpecificData : CommandSpecificData | null;
  private cipFrame            : CIPFrame            | null;
  private callback            : Function            | null;

  constructor(
    ethernetIPHeader    : EIPHeader    | null,
    commandSpecificData : CommandSpecificData | null,
    cipFrame            : CIPFrame            | null,
    callback            : Function            | null
  ) {
    this.ethernetIpHeader    = ethernetIPHeader;
    this.commandSpecificData = commandSpecificData;
    this.cipFrame            = cipFrame;
    this.callback            = callback;
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
        return {
          ID: id, 
          NETWORK_CONFIGURATION: networkConfiguration,
          request: device.requestFunctionRef()
        };
      } else {
        return null;
      };

    } catch(error) {
      console.log(error);
      return null;
    };
  };

  public static removeDevice(id: string) { this.devices.delete(id); };
};
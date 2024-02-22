import net, { Socket, NetConnectOpts } from 'node:net';

import { 
  Utilities, 
  NetworkConfiguration, 
  NetworkEntity, 
  DeviceHandle, 
  EIPHeader,
  CommandSpecificData,
  CIPFrame,
  RequestFunc,
  ResponseListener,
  Directive,
  PacketConstructor
 } from "./lib";

class Device implements NetworkEntity {

  private networkConfiguration: NetworkConfiguration | null;
  private littleEndian : boolean
  private tcpClient    : Socket | null;

  constructor(littleEndian: boolean) {
    this.networkConfiguration = null;
    this.tcpClient            = null;
    this.littleEndian         = littleEndian;
  };

  public setNetworkConfiguration(configuration: NetworkConfiguration, connectionListener?: () => void): void { 
    this.networkConfiguration = configuration;
    Object.freeze(this.networkConfiguration);

    let options: NetConnectOpts = {
      host: this.networkConfiguration.host, 
      port: this.networkConfiguration.port,
      localPort: this.networkConfiguration.localPort ?? undefined
    };

    this.tcpClient = net.createConnection(options, connectionListener);
  };

  public getNetworkConfiguration(): NetworkConfiguration {
    return this.networkConfiguration!;
  };

  public requestFuncRef(): RequestFunc {
    return (
      directive        : Directive,
      responseListener : ResponseListener
    ): void => {
      const frames = PacketConstructor.create(directive);
      const request = new Request(
        frames?.eipHeader           ?? null,
        frames?.commandSpecificData ?? null,
        frames?.cipFrame            ?? null,
        this.littleEndian,
      );
    };
  };
};

class Request {

  private eipHeader           : Buffer | null;
  private commandSpecificData : Buffer | null;
  private cipFrame            : Buffer | null;
  private concatBuffer        : Buffer;

  constructor(
    eipHeader           : EIPHeader           | null,
    commandSpecificData : CommandSpecificData | null,
    cipFrame            : CIPFrame            | null,
    littleEndian        : boolean
  ) {
    this.eipHeader           = eipHeader           !== null ? Utilities.writeBuffer(littleEndian, ...eipHeader.get()) : null;
    this.commandSpecificData = commandSpecificData !== null ? Utilities.writeBuffer(littleEndian, ...commandSpecificData.get()) : null;
    this.cipFrame            = cipFrame            !== null ? Utilities.writeBuffer(littleEndian, ...cipFrame.get()) : null;
    const buffers = [this.eipHeader, this.commandSpecificData, this.cipFrame].filter(buffer => buffer !== null) as Buffer[];
    this.concatBuffer = Buffer.concat(buffers);
  };
};

export class IndustrialCommunicationsInterface {
  private static devices: Map<string, Device> = new Map<string, Device>();

  public static newDevice(netConfig: NetworkConfiguration, littleEndian: boolean, connectionListener?: () => void): DeviceHandle | null {
    try {

      const id = Utilities.makeHashId(); 
      IndustrialCommunicationsInterface.devices.set(id, new Device(littleEndian));
      const device = IndustrialCommunicationsInterface.devices.get(id);

      if (device) {
        device.setNetworkConfiguration(netConfig, connectionListener);
        const networkConfiguration = device.getNetworkConfiguration();
        return {
          id: id, 
          networkConfiguration: networkConfiguration,
          request: device.requestFuncRef()
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
import net, { Socket, NetConnectOpts } from 'node:net';
import { 
  Utilities, 
  NetworkConfiguration, 
  DeviceHandle, 
  EIPHeader,
  CIPPacket,
  RequestFunc,
  ResponseListener,
  Directive,
  PacketConstructor
 } from "./lib";

class Device {

  private networkConfiguration: NetworkConfiguration | null;
  private littleEndian  : boolean
  private tcpClient     : Socket | null;
  private sessionHandle : number | null;

  constructor(littleEndian: boolean) {
    this.networkConfiguration = null;
    this.tcpClient            = null;
    this.sessionHandle        = null;
    this.littleEndian         = littleEndian;
  };

  public setNetworkConfiguration(
    configuration: NetworkConfiguration, 
    connectionListener? : () => void,
    errorListener?      : (error: any) => void
    ): void { 
    this.networkConfiguration = configuration;
    Object.freeze(this.networkConfiguration);

    let options: NetConnectOpts = {
      host: this.networkConfiguration.host, 
      port: this.networkConfiguration.port,
      localPort: this.networkConfiguration.localPort ?? undefined
    };

    if (connectionListener === undefined) connectionListener = () => {};
    if (errorListener === undefined) errorListener = (error: any) => {throw error};
    this.tcpClient = net.createConnection(options, connectionListener);
    this.tcpClient.on('error', errorListener);
  };

  public getNetworkConfiguration(): NetworkConfiguration {
    return this.networkConfiguration!;
  };

  public ref_request(): RequestFunc {
    return (
      directive            : Directive,
      packetEncapsulation? : number[][],
      responseListener?    : ResponseListener,
    ): void => {
      this.tcpClient?.on('data', responseListener !== undefined ? responseListener : (buffer: Buffer) => {
        console.log(`Received: `, buffer);
      });
      
      const packet = packetEncapsulation !== undefined 
      ? PacketConstructor.create(directive, this.sessionHandle ?? undefined, ...packetEncapsulation!)
      : PacketConstructor.create(directive, this.sessionHandle ?? undefined);

      const request = new Request(
        packet?.eipHeader ?? null,
        packet?.cipPacket ?? null,
        this.littleEndian,
      );
      try {
        this.tcpClient?.write(request.getPacketBuffer());
      } catch(error) {
        console.log(error);
      }
    };
  };

  public ref_setSessionHandle(): Function {
    return (sessionHandle: number): void => {
      this.sessionHandle = sessionHandle;
    };
  };
};

class Request {

  private eipHeader           : Buffer | null;
  private cipPacket           : Buffer | null;
  private packetBuffer        : Buffer;

  constructor(
    eipHeader           : EIPHeader | null,
    cipPacket           : CIPPacket | null,
    littleEndian        : boolean
  ) {
    this.eipHeader = eipHeader !== null ? Utilities.writeBuffer(littleEndian, ...eipHeader.get()) : null;
    this.cipPacket = cipPacket !== null ? Utilities.writeBuffer(littleEndian, ...cipPacket.get()) : null;
    const buffers = [this.eipHeader, this.cipPacket].filter(buffer => buffer !== null) as Buffer[];
    this.packetBuffer = Buffer.concat(buffers);
    console.log(this.packetBuffer);
  };

  getPacketBuffer(): Buffer {
    return this.packetBuffer;
  };
};

export class IndustrialCommunicationsInterface {
  private static devices: Map<string, Device> = new Map<string, Device>();
  
  public static newDevice(
    netConfig: NetworkConfiguration,
    littleEndian: boolean, 
    connectionListener? : () => void,
    errorListener?      : (error:any) => void
    ): DeviceHandle | null {
    try {
      const id = Utilities.makeHashId(); 
      IndustrialCommunicationsInterface.devices.set(id, new Device(littleEndian));
      const device = IndustrialCommunicationsInterface.devices.get(id);

      if (device) {
        device.setNetworkConfiguration(netConfig, connectionListener, errorListener);
        const networkConfiguration = device.getNetworkConfiguration();
        return {
          id: id, 
          networkConfiguration: networkConfiguration,
          request: device.ref_request(),
          setSessionHandle: device.ref_setSessionHandle()
        };
      } else {
        return null;
      };
    } catch(error: any) {
      throw new Error(`Failed to allocate new device. ${error.message}`)
    };
  };

  public static removeDevice(id: string) { this.devices.delete(id); };
};
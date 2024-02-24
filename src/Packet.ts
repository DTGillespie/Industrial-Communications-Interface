import { EIPCommandCode, Directive, RequestFrame, Utilities } from "./lib";

export class PacketConstructor {

  public static create(directive: Directive, sessionHandle?: number, ...userDefinedValues: number[][]): RequestFrame | null {

    switch(directive) {

      case 0x00:
        return {
          eipHeader: this.new_EIPHeader(
            [0x0065, 2],             // Command
            [0x0004, 2],             // Length
            [0x00000001, 4],         // Session Handle
            [0x00000000, 4],         // Status
            [0x0000000000000000, 8], // Context
            [0x00000000, 4]          // Options
          ),
          commandSpecificData: this.new_CommandSpecificData(
            [0x0001, 2],
            [0x0000, 2]
          ),
          cipFrame: null
        };

        case 0x01:
        return {
          eipHeader: this.new_EIPHeader(
            [0x006F, 2], 
            [0x0004, 2], 
            [sessionHandle !== undefined ? sessionHandle : 0x00000000, 4], 
            [0x00000000, 4], 
            [0x0000000000010000, 8], 
            [0x0000, 2]
          ),
          commandSpecificData: this.new_CommandSpecificData(
            [0x0000, 2], // Interface Handle: CIP
            [0x0400, 2], // Timeout: 1024
            [0x0002, 2], // Item Count
            [0x0000, 2], // Null Address Item
            [0x0000, 2], // ^ Length
            [0x00B2, 2], // Unconnected Data Item
            [0x000A, 2], // ^ Length
          ),
          cipFrame: this.new_CIPFrame(
            ...userDefinedValues.map(
              (value, index) => value !== undefined ? value : (index === 0 ? [0x00, 1] : [0x0000, 2]
          )))
        };

      default:
      return null;   
    };
  };

  private static new_EIPHeader(
    commandCode        : number[], 
    encapsulatedLength : number[], 
    sessionHandle      : number[],
    status             : number[],
    context            : number[],
    options            : number[] | null
  ): EIPHeader {
    return new EIPHeader(
      commandCode, 
      encapsulatedLength, 
      sessionHandle, 
      status, 
      context, 
      options
    );
  };

  private static new_CommandSpecificData(
    ...encapsulatedItems  : number[][]
  ): CommandSpecificData {
    return new CommandSpecificData(
      ...encapsulatedItems
    );
  };

  private static new_CIPFrame(...values: number[][]): CIPFrame {
    return new CIPFrame(
      values[0],
      values[1],
      values[2],
      values[3],
      values[4]
    );
  };
};

export class EIPHeader {
  
  private commandCode        : Uint8Array;
  private encapsulatedLength : Uint8Array; 
  private sessionHandle      : Uint8Array;
  private status             : Uint8Array; 
  private context            : Uint8Array;
  private options            : Uint8Array;

  constructor(
    commandCode        : number[], 
    encapsulatedLength : number[], 
    sessionHandle      : number[],
    status             : number[],
    context            : number[],
    options            : number[] | null
    ) {
    this.commandCode        = Utilities.numberToUintArray(...commandCode);
    this.encapsulatedLength = Utilities.numberToUintArray(...encapsulatedLength);
    this.sessionHandle      = Utilities.numberToUintArray(...sessionHandle);
    this.status             = Utilities.numberToUintArray(...status);
    this.context            = Utilities.numberToUintArray(...context);
    this.options            = Utilities.numberToUintArray(...options!) 
                           ?? Utilities.numberToUintArray(0x0000, 2);
  };

  get(): Array<Uint8Array> {
    return [
      this.commandCode, 
      this.encapsulatedLength, 
      this.sessionHandle, 
      this.status,
      this.context, 
      this.options
    ];
  };
};

export class CommandSpecificData {

  private encapsulatedItems : Uint8Array[];

  constructor(
    ...encapsulatedItems  : number[][]
  ) {
    this.encapsulatedItems = encapsulatedItems.map(
      (item) => Utilities.numberToUintArray(...item)
    );
  }; 

  get(): Array<Uint8Array> {
    return this.encapsulatedItems;
  };
};

export class CIPFrame {

  private serviceId   : Uint8Array;
  private pathSize    : Uint8Array;
  private classId     : Uint8Array;
  private instanceId  : Uint8Array;
  private attributeId : Uint8Array;

  constructor(
    serviceId   : number[],
    pathSize    : number[],
    classId     : number[],
    instanceId  : number[],
    attributeId : number[] | null
  ) {
    this.serviceId   = Utilities.numberToUintArray(...serviceId);
    this.pathSize    = Utilities.numberToUintArray(...pathSize);
    this.classId     = Utilities.numberToUintArray(...classId);
    this.instanceId  = Utilities.numberToUintArray(...instanceId);
    this.attributeId = Utilities.numberToUintArray(...attributeId!)
                    ?? Utilities.numberToUintArray(0xFFFF, 4);
  };

  get(): Array<Uint8Array> {
    return [
      this.serviceId,
      this.pathSize,
      this.classId,
      this.instanceId,
      this.attributeId
    ];
  };
};
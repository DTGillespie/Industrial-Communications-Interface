import { EIPCommandCode, Directive, RequestFrame, Utilities } from "./lib";

export class PacketConstructor {

  public static create(directive: Directive): RequestFrame | null {

    switch(directive) {

      case 0x00:
        return {
          eipHeader: this.new_EIPHeader(
            [0x0065, 2], 
            [0x0004, 2], 
            [0x00000001, 4], 
            [0x00000000, 4], 
            [0x0000000000000000, 8], 
            [0x00000000, 4]
          ),
          commandSpecificData: this.new_CommandSpecificData(0x0001, 2),
          cipFrame: null
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
    ...encapsulatedItems  : number[]
  ): CommandSpecificData {
    return new CommandSpecificData(
      encapsulatedItems
    );
  };

  private static newCIPFrame(
    serviceId   : number[],
    pathSize    : number[],
    classId     : number[],
    instanceId  : number[],
    attributeId : number[] | null
  ): CIPFrame {
    return new CIPFrame(
      serviceId,
      pathSize,
      classId,
      instanceId,
      attributeId
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
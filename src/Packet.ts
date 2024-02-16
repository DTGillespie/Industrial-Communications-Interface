export enum CIPClassID {
  Identity          = 0x01,
  MessageRouter     = 0x02,
  Assembly          = 0x04,
  ConnectionManager = 0x06,
  Parameter         = 0x0F
};

export enum CIPServiceID {
  GetAttributeAll    = 0x01,
  SetAttributeAll    = 0x02,
  GetAttributeList   = 0x03,
  SetAttributeList   = 0x04,
  GetAttributeSingle = 0x0E,
  SetAttributeSingle = 0x10
};

export enum EIPCommandCode {
  NOP               = 0x00,
  ListIdentity      = 0x63,
  ListInterfaces    = 0x64,
  RegisterSession   = 0x65,
  UnregisterSession = 0x66,
  SendRRData        = 0x6F,
  SendUnitData      = 0x70,
  IndicateStatus    = 0x78,
  CancelSend        = 0x79,
  MultiSend         = 0x64
};

class EthernetIPHeader {
  
  private commandCode        : EIPCommandCode;
  private encapsulatedLength : number; 
  private sessionHandle      : number;
  private status             : number; 
  private context            : number;
  private options            : number;

  constructor(
    commandCode        : EIPCommandCode, 
    encapsulatedLength : number, 
    sessionHandle      : number,
    status             : number,
    context            : number,
    options            : number | null
    ) {
    this.commandCode        = commandCode;
    this.encapsulatedLength = encapsulatedLength;
    this.sessionHandle      = sessionHandle;
    this.status             = status;
    this.context            = context;
    this.options            = options ?? 0x0000;
  };

  get(): Array<number> {
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

class CommandSpecificData {

  private interfaceHandle   : number;
  private timeout           : number;
  private itemCount         : number;
  private encapsulatedItems : number[][];

  constructor(
    interfaceHandle       : number | null,
    timeout               : number | null,
    itemCount             : number,
    ...encapsulatedItems  : number[][]
  ) {
    this.interfaceHandle   = interfaceHandle ?? 0x000;
    this.timeout           = timeout ?? 0x0400;
    this.itemCount         = itemCount;
    this.encapsulatedItems = encapsulatedItems;
  }; 

  get(): Array<number> {
    return [
      this.interfaceHandle,
      this.timeout,
      this.itemCount,
      ...this.encapsulatedItems.flatMap(([item, length]) => [item, length])
    ];
  };
};

class CIPFrame {

  private serviceId   : number;
  private pathSize    : number;
  private classId     : number;
  private instanceId  : number;
  private attributeId : number;

  constructor(
    serviceId   : number,
    pathSize    : number,
    classId     : number,
    instanceId  : number,
    attributeId : number | null
  ) {
    this.serviceId   = serviceId;
    this.pathSize    = pathSize;
    this.classId     = classId;
    this.instanceId  = instanceId;
    this.attributeId = attributeId ?? 0xFFFF;
  };
};
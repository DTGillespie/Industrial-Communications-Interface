import { EIPCommandCode, Directive } from "./lib";

export class EIPHeader {
  
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

export class CommandSpecificData {

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

export class CIPFrame {

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

  get(): Array<number> {
    return [
      this.serviceId,
      this.pathSize,
      this.classId,
      this.instanceId,
      this.attributeId
    ];
  };
};

class Parser {

};

export class PacketConstructor {

  public static create(directive: Directive): void  {

    switch(directive) {

      case 0x00:
      break;

    };
  };

  private static new_EIPHeader(
    commandCode        : EIPCommandCode, 
    encapsulatedLength : number, 
    sessionHandle      : number,
    status             : number,
    context            : number,
    options            : number | null
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
    interfaceHandle       : number | null,
    timeout               : number | null,
    itemCount             : number,
    ...encapsulatedItems  : number[][]
  ): CommandSpecificData {
    return new CommandSpecificData(
      interfaceHandle,
      timeout,
      itemCount,
      ...encapsulatedItems
    );
  };

  private static new_CIPFrame(
    serviceId   : number,
    pathSize    : number,
    classId     : number,
    instanceId  : number,
    attributeId : number | null
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
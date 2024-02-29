import { EIPCommandCode, Directive, RequestPacket, Utilities } from "./lib";

export class PacketConstructor {

  public static create(directive: Directive, sessionHandle?: number, ...packetEncapsulation: number[][]): RequestPacket | null {

    switch(directive) {

      // Forward Open
      case 0x00:
        return {
          eipHeader: this.EIPHeader(
            [EIPCommandCode.Register_Session, 2],
            [0x0004, 2],                         
            [0x00000001, 4],                     
            [0x00000000, 4],                     
            [0x0000000000000000, 8],             
            [0x00000000, 4]                      
          ),
          cipPacket: this.cipPacket(
            [0x0001, 2],
            [0x0000, 2]
          ),
        };

        // Generic Packet Structure
        case 0x01:
        return {
          eipHeader: this.EIPHeader(
            [EIPCommandCode.List_Services, 2],
            packetEncapsulation[0],       
            [sessionHandle !== undefined ? sessionHandle : 0x00000000, 4],
            [0x0000, 4],            
            [0x0000000000000000, 8],
            [0x0000, 2]             
          ),
          cipPacket: this.cipPacket(
            ...packetEncapsulation.slice(1).map((value) => {
            return value;
          }))
        };
      default:
      return null;   
    };
  };

  private static EIPHeader(
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

  private static cipPacket(
    ...packetEncapsulation : number[][]
  ): CIPPacket {
    return new CIPPacket(...packetEncapsulation);
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

export class CIPPacket {
  private packetEncapsulation: Uint8Array[];
  constructor(
    ...packetEncapsulation: number[][]
  ) {
    this.packetEncapsulation = packetEncapsulation.map(
      (value) => Utilities.numberToUintArray(...value)
    );
  };

  get(): Array<Uint8Array> {return this.packetEncapsulation};
};

/*
  ***** Common Packet Format **** 
  
  Working Examples
  -------------------

  Command Specific Data:
  [0x0000, 24],                                    // Interface Handle: CIP
  [0x0400, 28],                                    // Timeout: 1024
  [0x0002, 30],                                    // Item Count
  [0x0000, 32],                                    // Null Address Item     (Item #1)
  [0x0000, 34],                                    // ^ Length
  [0x00B2, 36],                                    // Unconnected Data Item (Item #2)
  [0x000A, 38]                                     // ^ Length

  CIP Frame (Item #2 below, no data required for Item #1 in this scenario):
  [0x0E, 40],                                      // Service
  [0x0004, 41],                                    // Path Size: 16-bit Words (Inclusive of itself)
  [0x0001, 43],                                    // Class ID: 0x01 Identity Object
  [0x0001, 45],                                    // Instance ID: 0x01
  [0x0001, 47]                                     // Attribute ID

  Item ID Numbers
  0x0000 address Null (used for UCMM messages). Indicates that encapsulation routing is NOT needed.
  Target is either local (Ethernet) or routing info is in a data Item.

  0x0001 – 0x000B Reserved for legacy usage 1

  0x000C CIP Identity (refer to section 2-4.2.3 for item definition)

  0x000D – 0x0085 Reserved for legacy usage 1

  0x0086 CIP Security Information (refer to Volume 8, Chapter 3 for item definition)

  0x0087 EtherNet/IP Capability (refer to section 2-4.2.3 for item definition)

  0x0088 EtherNet/IP Usage (refer to Section 2-4.2.3 for item definition)

  0x0089 – 0x0090 Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  0x0091 Reserved for legacy usage 1

  0x0092 – 0x00A0 Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  0x00A1 address Connection-based (used for connected messages)

  0x00A2 – 0x00A4 Reserved for legacy usage 1

  0x00A5 – 0x00B0 Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  0x00B1 data Connected Transport packet

  0x00B2 data Unconnected message

  0x00B3 – 0x00FF Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  0x0100 ListServices response (refer to section 2-4.6.3 for item definition)

  0x0101 – 0x010F Reserved for legacy usage 1

  0x0110 – 0x7FFF Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  0x8000 data Sockaddr Info, originator-to-target

  0x8001 data Sockaddr Info, target-to-originator

  0x8002 Sequenced Address item

  0x8003 Unconnected message over UDP (refer to Volume 8, Chapter 3 for item definition)

  0x8004 – 0xFFFF Reserved for future expansion of this specification (Products compliant with this
  specification shall not use command codes in this range)

  ----------
  Misc. Examples

  micro800?.request(
      Directive.List_Services, 
      [
        [0x0000, 2], // Interface Handle: CIP
        [0x0400, 2], // Timeout: 1024
        [0x0002, 2], // Item Count
        [0x0000, 2], // Null Address Item     (Item #1)
        [0x0000, 2], // ^ Length
        [0x00B2, 2], // Unconnected Data Item (Item #2)
        [0x000A, 2], // ^ Length

        // Item #2 (No data required for null address item)
        [0x0091, 2],        // Item Type (Symbolic Tag)
        [0x0006, 2],        // Data Type (INT)
        [0x0002, 2],        // Data Size (2 bytes for INT)
        [0x0000, 2],        // Data Length
        [0x09, 1],          // Length of Symbolic Tag Name

        // Symbolic Tag Name ("EIP_DEBUG")
        [0x45, 1], 
        [0x49, 1], 
        [0x50, 1], 
        [0x5F, 1], 
        [0x44, 1], 
        [0x45, 1], 
        [0x42, 1], 
        [0x55, 1], 
        [0x47, 1],              
        [0x0000, 2] // Reserved Padding
      ],
      (buffer: Buffer) => {
        logBuffer(buffer);
      });

    case 0xFE:
    return {
      eipHeader: this.new_EIPHeader(
        [0x0070, 2],             // Command (Send Unit Data)
        [0x0500, 2],             // Length
        [sessionHandle !== undefined ? sessionHandle : 0x00000000, 4], // Session Handle
        [0x0000, 4],             // Status
        [0x0000000000000000, 8], // Context
        [0x0000, 2]              // Options
      ),
      commandSpecificData: this.new_CommandSpecificData(
        [0x0000, 2],        // Interface Handle (CIP)
        [0x0000, 2],        // Timeou
        [0x0001, 2],        // Item Coun
        // Data Item 1: Read Tag 1
        [0x0091, 2],        // Item Type (Symbolic Tag)
        [0x0006, 2],        // Data Type (INT)
        [0x0001, 2],        // Data Size (2 bytes for INT)
        [0x0000, 2],        // Data Length (0, as no additional data)
        [0x09, 1],          // Length of Symbolic Tag Name
        // Symbolic Tag Name ("EIP_DEBUG")
        [0x45, 1], 
        [0x49, 1], 
        [0x50, 1], 
        [0x5F, 1], 
        [0x44, 1], 
        [0x45, 1], 
        [0x42, 1], 
        [0x55, 1], 
        [0x47, 1],              
        [0x0000, 2]         // Reserved Padding
      ),
      cipFrame: null
    };
*/
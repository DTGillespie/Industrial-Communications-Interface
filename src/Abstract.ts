import {EIPHeader, CommandSpecificData, CIPFrame} from "./lib";

export enum Directive {
  Forward_Open = 0x00,
};

export enum EIPCommandCode {
  NOP                = 0x00,
  List_Identity      = 0x63,
  List_Interfaces    = 0x64,
  Register_Session   = 0x65,
  Unregister_Session = 0x66,
  Send_RR_Data       = 0x6F,
  Send_Unit_Data     = 0x70,
  Indicate_Status    = 0x78,
  Cancel_Send        = 0x79,
  Multi_Send         = 0x64
};

export enum CIPClassID {
  Identity           = 0x01,
  Message_Router     = 0x02,
  Assembly           = 0x04,
  Connection_Manager = 0x06,
  Parameter          = 0x0F
};

export enum CIPServiceID {
  Get_Attribute_All    = 0x01,
  Set_Attribute_All    = 0x02,
  Get_Attribute_List   = 0x03,
  Set_Attribute_List   = 0x04,
  Get_Attribute_Single = 0x0E,
  Set_Attribute_Single = 0x10
};

export interface NetworkConfiguration {
  macAddress  : string;
  host        : string;
  port        : number;
}; 

export interface NetworkEntity {
  setNetworkConfiguration(configuration: NetworkConfiguration): void;
  getNetworkConfiguration(): NetworkConfiguration;
  requestFunctionRef(): Function;
};

export interface CIPDevice {
  id : string;
  networkConfiguration : NetworkConfiguration;
  request: Function;
};

export type RequestFuncton = (ethernetIpHeader: EIPHeader, commandSpecificData: CommandSpecificData, cipFrame: CIPFrame, callback: RequestCallback) => void;
export type RequestCallback = (error: Error | null, response?: Buffer) => void;
import {EIPHeader, CommandSpecificData, CIPFrame} from "./lib";

export enum Directive {
  Forward_Open = 0x00,
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

export interface NetworkConfiguration {
  MAC_ADDRESS : string;
  HOST        : string;
  PORT        : number;
}; 

export interface NetworkEntity {
  setNetworkConfiguration(configuration: NetworkConfiguration): void;
  getNetworkConfiguration(): NetworkConfiguration;
  requestFunctionRef(): Function;
};

export interface CIPDevice {
  ID : string;
  NETWORK_CONFIGURATION : NetworkConfiguration;
  request: Function;
};

export type RequestFuncton = (ethernetIpHeader: EIPHeader, commandSpecificData: CommandSpecificData, cipFrame: CIPFrame, callback: RequestCallback) => void;
export type RequestCallback = (error: Error | null, response?: Buffer) => void;
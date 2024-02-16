"use strict";
var CIPClassID;
(function (CIPClassID) {
    CIPClassID[CIPClassID["Identity"] = 1] = "Identity";
    CIPClassID[CIPClassID["MessageRouter"] = 2] = "MessageRouter";
    CIPClassID[CIPClassID["Assembly"] = 4] = "Assembly";
    CIPClassID[CIPClassID["ConnectionManager"] = 6] = "ConnectionManager";
    CIPClassID[CIPClassID["Parameter"] = 15] = "Parameter";
})(CIPClassID || (CIPClassID = {}));
;
var CIPServiceID;
(function (CIPServiceID) {
    CIPServiceID[CIPServiceID["GetAttributeAll"] = 1] = "GetAttributeAll";
    CIPServiceID[CIPServiceID["SetAttributeAll"] = 2] = "SetAttributeAll";
    CIPServiceID[CIPServiceID["GetAttributeList"] = 3] = "GetAttributeList";
    CIPServiceID[CIPServiceID["SetAttributeList"] = 4] = "SetAttributeList";
    CIPServiceID[CIPServiceID["GetAttributeSingle"] = 14] = "GetAttributeSingle";
    CIPServiceID[CIPServiceID["SetAttributeSingle"] = 16] = "SetAttributeSingle";
})(CIPServiceID || (CIPServiceID = {}));
;
var EIPCommandCode;
(function (EIPCommandCode) {
    EIPCommandCode[EIPCommandCode["NOP"] = 0] = "NOP";
    EIPCommandCode[EIPCommandCode["ListIdentity"] = 99] = "ListIdentity";
    EIPCommandCode[EIPCommandCode["ListInterfaces"] = 100] = "ListInterfaces";
    EIPCommandCode[EIPCommandCode["RegisterSession"] = 101] = "RegisterSession";
    EIPCommandCode[EIPCommandCode["UnregisterSession"] = 102] = "UnregisterSession";
    EIPCommandCode[EIPCommandCode["SendRRData"] = 111] = "SendRRData";
    EIPCommandCode[EIPCommandCode["SendUnitData"] = 112] = "SendUnitData";
    EIPCommandCode[EIPCommandCode["IndicateStatus"] = 120] = "IndicateStatus";
    EIPCommandCode[EIPCommandCode["CancelSend"] = 121] = "CancelSend";
    EIPCommandCode[EIPCommandCode["MultiSend"] = 100] = "MultiSend";
})(EIPCommandCode || (EIPCommandCode = {}));
;
class EthernetIPFrame {
    constructor(header, data) {
        this.header = header;
        this.data = data;
    }
    ;
    getHeader() {
        return this.header;
    }
    ;
    getData() {
        return this.data;
    }
    ;
}
;
class EthernetIPHeader {
    constructor(sourceMAC, destinationMAC, commandCode) {
        this.sourceMAC = sourceMAC;
        this.destinationMAC = destinationMAC;
        this.commandCode = commandCode;
    }
    ;
    getSourceMAC() {
        return this.sourceMAC;
    }
    ;
    getDestinationMAC() {
        return this.destinationMAC;
    }
    ;
    getCommandCode() {
        return this.commandCode;
    }
    ;
}
;
class CIPFrame {
    constructor(classID, serviceID, data) {
        this.classID = classID;
        this.serviceID = serviceID;
        this.data = data;
    }
    ;
    getClassID() {
        return this.classID;
    }
    ;
    getServiceID() {
        return this.serviceID;
    }
    ;
    getData() {
        return this.data;
    }
    ;
}
;
const ethernetIPHeader = new EthernetIPHeader("00:11:22:33:44:55", "AA:BB:CC:DD:EE:FF", EIPCommandCode.SendUnitData);
const ethernetIPData = Buffer.from([0x01, 0x02, 0x03, 0x04]); // Example data buffer
const ethernetIPFrame = new EthernetIPFrame(ethernetIPHeader, ethernetIPData);
const cipData = Buffer.from([0x0A, 0x0B, 0x0C, 0x0D]); // Example CIP data buffer
const cipPacket = new CIPFrame(CIPClassID.Identity, CIPServiceID.GetAttributeSingle, cipData);
console.log(ethernetIPFrame.getHeader().getSourceMAC());
console.log(ethernetIPFrame.getHeader().getCommandCode());
console.log(cipPacket.getClassID());
console.log(cipPacket.getServiceID());

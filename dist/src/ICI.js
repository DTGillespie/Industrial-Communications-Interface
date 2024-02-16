"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICI = void 0;
const lib_1 = require("./lib");
class Device {
    constructor() {
        this.networkConfiguration = {
            MAC_ADDRESS: "",
            HOST: "",
            PORT: 0
        };
    }
    ;
    setNetworkConfiguration(configuration) {
        this.networkConfiguration = configuration;
        Object.freeze(this.networkConfiguration);
    }
    ;
    getNetworkConfiguration() {
        return this.networkConfiguration;
    }
    ;
}
;
class ICI {
    static newDevice(netConfig) {
        try {
            const id = lib_1.Utilities.makeHashId();
            ICI.devices.set(id, new Device);
            const device = ICI.devices.get(id);
            if (device) {
                device.setNetworkConfiguration(netConfig);
                const networkConfiguration = device.getNetworkConfiguration();
                return { ID: id, NETWORK_CONFIGURATION: networkConfiguration };
            }
            else {
                return null;
            }
            ;
        }
        catch (error) {
            console.log(error);
            return null;
        }
        ;
    }
    ;
    static deleteDevice(id) { this.devices.delete(id); }
    ;
}
exports.ICI = ICI;
ICI.devices = new Map();
;

import { NetNode } from "@ailhc/enet";

export default class Net<ProtoKeyType> extends NetNode<ProtoKeyType> {

    private static _instance: Net<string> = null
    public static get inst(): Net<string> {
        if (!this._instance) {
            this._instance = new Net<string>()
            this._instance.init({
                netEventHandler: new ProtobufNet()
            })
        }
        return this._instance
    }

    public bind(protoKey, handler: (data) => void, obj) {
        Net._instance.onPush(protoKey, handler.bind(obj))

        Net._instance._onSocketClosed
    }

    constructor() {
        super()
    }
}


class ProtobufNet implements enet.INetEventHandler {

    onStartConnenct?(connectOpt: enet.IConnectOptions): void {
        console.log(`start connect:${connectOpt.url}`)
    }

    onConnectEnd?(connectOpt: enet.IConnectOptions): void {
        console.log(`connect end:${connectOpt.url}`);
    }
    onError?(event: any, connectOpt: enet.IConnectOptions): void {
        console.error(`socket error`);
        console.error(event);
    }
    onClosed?(event: any, connectOpt: enet.IConnectOptions): void {
        console.error(`socket close`);
        console.error(event);
    }
    onStartReconnect(reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`start reconnect:${connectOpt.url}`);
    }
    onReconnecting?(curCount: number, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`url:${connectOpt.url} reconnect count:${curCount},less count:${reConnectCfg.reconnectCount}`);
    }
    onReconnectEnd?(isOk: boolean, reConnectCfg: enet.IReconnectConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`url:${connectOpt.url}reconnect end ${isOk ? "ok" : "fail"} `);
    }
    onStartRequest?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
        console.log(`start request:${reqCfg.protoKey},id:${reqCfg.reqId}`);
    }
    onData?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
        console.log(`data :${dpkg.key}`);
    }
    onRequestTimeout?(reqCfg: enet.IRequestConfig, connectOpt: enet.IConnectOptions): void {
        console.warn(`request timeout:${reqCfg.protoKey}`);
    }
    onCustomError?(dpkg: enet.IDecodePackage<any>, connectOpt: enet.IConnectOptions): void {
        console.error(`proto key:${dpkg.key},reqId:${dpkg.reqId},code:${dpkg.code},errorMsg:${dpkg.errorMsg}`);
    }
    onKick(dpkg: enet.IDecodePackage<any>, copt: enet.IConnectOptions) {
        console.log(`be kick`);
    }
}
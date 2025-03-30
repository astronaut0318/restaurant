import { api } from "../../api/api";
import { Global } from "../../config/Global";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";
import WalletItem from "./WalletItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertTransferRecords extends UIView {

    @property(List)
    list: List = null;

    @property(cc.Node)
    noHis: cc.Node = null;

    private time = 0.3;
    private listData: any[] = null
    private userId: number = 0;
    private useRemotePicture = true;

    init(userId: number) {
        if (userId) {
            this.userId = userId;
        }
    }

    onOpen() {
        cc.tween(this.node).to(this.time, {
            x: 0
        }).start();
        this.getData();
    }

    private getData() {
        let _this = this;
        let data = [];
        let page = 1;
        let limit = 1000;

        Request2.getApp().get(`user/getSonIncomeLog?page=${page}&limit=${limit}&uid=${this.userId}`, (res) => {
            let list = res.data.list;
            if(list.length > 0) {
                for(let i=0; i<list.length; i++) {
                    let item = list[i];
                    let createTimeMS = item.createTime;
                    if (createTimeMS / (3600 * 24 * 365) < 100) {
                        createTimeMS = createTimeMS * 1000;
                    }
                    let ct = new Date(createTimeMS);
                    const localDateTimeStr = `${ct.getFullYear()}-${ct.getMonth()+1}-${ct.getDate()} ${ct.getHours()}:${ct.getMinutes()}:${ct.getSeconds()}`;
                    data.push(
                        {
                            id: item.id,
                            time: localDateTimeStr,
                            name: item.remark,
                            count: item.income,
                        }
                    );
                }
            }
            _this.listData = data;
            _this.list.numItems = data.length;

            if (data.length == 0) {
                _this.noHis.active = true;
            }
        });
    }

    loadSpritFrame(url: string, onComplete: (asset: cc.SpriteFrame) => void) {
        if(this.useRemotePicture) {
            cc.assetManager.loadRemote<cc.Texture2D>(url, (err, texture) => {
                if (err) {
                    console.error("ImageAsset loadRemote failed:" + err.message);
                    onComplete(null);
                    return;
                }
                const spriteFrame = new cc.SpriteFrame(texture);
                onComplete(spriteFrame);
            });
        }
        else {
            cc.resources.load<cc.SpriteFrame>(url, cc.SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error("SpriteFrame load failed, err:" + err.message);
                    onComplete(null);
                    return;
                }
                onComplete(spriteFrame);
            });
        }
    }

    onItemRender(item: cc.Node, idx: number) {
        let rewardName: cc.Label = item.getChildByName("rewardName").getComponent(cc.Label);
        let transferCount: cc.Label = item.getChildByName("transferCount").getComponent(cc.Label);
        let transferTime: cc.Label = item.getChildByName("transferTime").getComponent(cc.Label);
        let transferState: cc.Label = item.getChildByName("transferState").getComponent(cc.Label);
        
        let idata = this.listData[idx];

        rewardName.string = idata.name;
        transferCount.string = this.toFixed2(idata.count / 100) + " 元";
        transferTime.string = idata.time;
    }

    onClickClose() {
        uiManager.close(this);
    }

    private toFixed2(num) {
        if (!num) return "0.00";
        return num.toFixed(2);
    }

}
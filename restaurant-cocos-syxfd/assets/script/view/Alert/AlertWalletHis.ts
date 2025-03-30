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
export default class AlertWalletHis extends UIView {

    @property(List)
    list: List = null;

    @property(cc.Node)
    noHis: cc.Node = null;

    private time = 0.3;
    private listData: any[] = null
    private type = 0;

    init(type) {
        if (type) {
            this.type = type;
        }
    }

    onOpen() {
        cc.tween(this.node).to(this.time, {
            x: 0
        }).start();
        this.getData();
    }

    private getData() {
        let data = {
            id: Global.userid,
            pageNo: 1,
            pageSize: 100,
        }
        Request2.getApp().open('user/draw/list', data, res => {
            console.log("提现记录", res);
            let { data } = res;
            this.listData = data;
            this.list.numItems = data.length;
            if (data.length == 0) {
                this.noHis.active = true;
            }
        })
        return;

        let params = {
            uuid: Global.uuid,
            sourceType: this.type
        }
        Http.post(api.tixianHis, params, res => {
            let { result } = res;
            this.listData = result;
            this.list.numItems = result.length;
        })
    }

    onItemRender(item: cc.Node, idx: number) {
        let date: cc.Label = item.getChildByName("date").getComponent(cc.Label);
        let money: cc.Label = item.getChildByName("money").getComponent(cc.Label);
        let state: cc.Label = item.getChildByName("tixian").getComponent(cc.Label);
        let idata = this.listData[idx];
        date.string = idata.time;
        money.string = idata.money / 100 + "元";
        if (idata.state == 1) {
            state.string = "提现成功";
        } else if (idata.state == -1) {
            state.string = "提现异常";
        } else if (idata.state == 2) {
            state.string = "待审核";
        }
    }

    onClickClose() {
        cc.tween(this.node).to(this.time, {
            x: cc.winSize.width
        }).start().call(() => {
            uiManager.close(this);
        });
    }

}
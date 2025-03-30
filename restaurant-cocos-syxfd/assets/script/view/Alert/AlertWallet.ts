import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";
import CountManager from "../Hall/CountManager";
import WithdrawManager from "../Hall/WithdrawManager";
import { AlertData } from "./Alert";
import { AccountData } from "./AlertAlipayAccountFill";
import WalletItem from "./WalletItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AlertWallet extends UIView {
    @property(cc.Label)
    tixianYuan: cc.Label = null;

    @property(cc.Label)
    tixianHongbao: cc.Label = null;

    @property(cc.RichText)
    tiaojian: cc.RichText = null;

    @property(cc.ProgressBar)
    tiaojainBar: cc.ProgressBar = null;

    @property(cc.Sprite)
    touxiang: cc.Sprite = null;

    @property(cc.Prefab)
    tixianItem: cc.Prefab = null;

    @property(cc.Node)
    gridL: cc.Node = null;

    @property(cc.Node)
    gridR: cc.Node = null;

    @property(cc.Label)
    tiaojainBarLabel: cc.Label = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    username: cc.Label = null;

    private time = 0.3;

    private seletedData = null;

    private alertStr = "";

    onOpen() {
        cc.tween(this.node).to(this.time, {
            x: 0
        }).start();
        this.getData();
        main.on(EVENT_TAG.UPDATE_WALLET_DATA, this.getData, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.UPDATE_WALLET_DATA, this.getData, this);
    }

    private tixianList_l = {

    }

    private getData() {
        let redpack = Utils.findRedPack();
        this.tixianYuan.string = Utils.getYuanByWan(redpack);
        this.tixianHongbao.string = "" + redpack;

        this.gridL.removeAllChildren();
        this.gridR.removeAllChildren();

        let by_lvl = WithdrawManager.inst.findByLvlData();
        let arr_l = [];
        for (let i = 0; i < by_lvl.length; i++) {
            const element = by_lvl[i];
            arr_l.push(element);
            let item = cc.instantiate(this.tixianItem);
            this.setItem(item, element, element.shopLevel + "级饭店");
            this.gridL.addChild(item);
            if (arr_l.length >= 12) break;
        }

        let once = WithdrawManager.inst.findOnceData();
        let arr_r = [];
        for (let i = 0; i < once.length; i++) {
            const element = once[i];
            let item = cc.instantiate(this.tixianItem);
            this.setItem(item, element, "仅此一次");
            this.gridR.addChild(item);
            arr_r.push(element);
        }

        //初始选择
        if (this.gridL.children.length > 0) {
            this.selected(this.gridL.children[0]);
        } else if (this.gridR.children.length > 0) {
            this.selected(this.gridR.children[0]);
        }

        //头像
        Utils.loadRemoteImg(Global.headUrl, this.head);
        this.username.string = Global.username;

        Request2.getApp().open('user/chum/list', { id: Global.userid }, res => {
            console.log("获取列表getlistbyuserid", res);
            let { redirect, spread } = res.data;
            Global.friend = (redirect.length + spread.length);
            //Global.friend = redirect.length;
        });
    }

    setItem(node: cc.Node, data, title: string) {
        let script: WalletItem = node.getComponent(WalletItem);
        if (script) {
            script.setData(data.money, title);
        }
        node["_data"] = data;

        if (node.hasEventListener(cc.Node.EventType.TOUCH_START)) {
            node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        }
        node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);

        if (node.hasEventListener(cc.Node.EventType.TOUCH_END)) {
            node.off(cc.Node.EventType.TOUCH_END, this.itemTouch, this);
        }
        node.on(cc.Node.EventType.TOUCH_END, this.itemTouch, this);
    }

    private canSelect = true;
    private touchTimerFunc() {
        this.canSelect = false;
    }
    private touchStart(event: cc.Event.EventTouch) {
        this.scheduleOnce(this.touchStart, 1);
    }

    private itemTouch(event: cc.Event.EventTouch) {
        this.unschedule(this.touchTimerFunc);
        if (!this.canSelect) {
            this.canSelect = true;
            return;
        };

        this.canSelect = true;
        let target = event.target;
        this.selected(target);
    }


    // private selected(node) {
    //     let data = node._data;
    //     this.seletedData = data;

    private resetSelected() {
        this.gridL.children.forEach(el => {
            let script: WalletItem = el.getComponent(WalletItem);
            if (script) {
                script.showSelected(false);
            }
        })
        this.gridR.children.forEach(el => {
            let script: WalletItem = el.getComponent(WalletItem);
            if (script) {
                script.showSelected(false);
            }
        })
    }

    private selected(node) {
        let data = node._data;
        this.seletedData = data;
        this.resetSelected();
        let script: WalletItem = node.getComponent(WalletItem);
        if (script) {
            script.showSelected(true);
        }
        let str = "";
        //提现条件是登录天数还是等级
        if (data.shopLevel) {//根据等级
            if(data.needFriendCount > 0) {
                str = `<color=#97561a>达到</c><color=#ff0c18>${data.shopLevel}级</c><color=#97561a>饭店且拥有</c><color=#ff0c18>${data.needFriendCount}个</c><color=#97561a>好友即可提现，当前是</c><color=#ff0c18>${Global.shopLevel}级</c><color=#97561a>与</c><color=#ff0c18>${Global.friend}个好友</c>`;
                this.alertStr = `达到${data.shopLevel}级饭店且拥有${data.needFriendCount}个好友即可提现，当前是${Global.shopLevel}级和拥有${Global.friend}个好友`;
                this.setProgress(Global.shopLevel, data.shopLevel, Global.friend, data.needFriendCount);
            }
            else {
                str = `<color=#97561a>达到</c><color=#ff0c18>${data.shopLevel}级</c><color=#97561a>饭店即可提现，当前是</c><color=#ff0c18>${Global.shopLevel}级</c>`;
                this.alertStr = `达到${data.shopLevel}级饭店即可提现，当前是${Global.shopLevel}级`;
                this.setProgress(Global.shopLevel, data.shopLevel, 0, 0);
            }
        } else {//根据天数
            str = `<color=#97561a>连续登录</c><color=#ff0c18>${data.needLoginDayCount}天</c><color=#97561a>即可提现</c>`;
            this.alertStr = `连续登录${data.needLoginDayCount}天即可提现`;

            let loginDay = CountManager.inst.findLoginDayCount();
            this.setProgress(loginDay, data.needLoginDayCount, 0, 0);
        }
        this.tiaojian.string = str;
    }

    private setProgress(completedCount1: number, totalCount1: number, completedCount2: number, totalCount2: number) {
        let progress1 = totalCount1 > 0 ? completedCount1 / totalCount1 : 0;
        if (progress1 >= 1) progress1 = 1;
        if (progress1 < 0.1 && progress1 !== 0) progress1 = 0.1;

        let progress2 = totalCount2 > 0 ? completedCount2 / totalCount2 : 0;
        if (progress2 >= 1) progress2 = 1;
        if (progress2 < 0.1 && progress2 !== 0) progress2 = 0.1;

        let count = totalCount2 > 0 ? 2 : 1;
        let current = (progress1 + progress2) / count;

        this.tiaojainBarLabel.string = `${(current * 100).toFixed()}%`;
        this.tiaojainBar.progress = current;
    }

    //提现
    onClickTixian() {
        if (!this.seletedData) return;
        let { id, shopLevel, needFriendCount } = this.seletedData;
        let checkok = false;
        if (shopLevel) {
            checkok = WithdrawManager.inst.checkByLvl(id);
        } else {
            checkok = WithdrawManager.inst.checkOnce(id);
        }
        if (!checkok || Global.friend < needFriendCount) {
            let alertData: AlertData = {
                title: null,
                content: this.alertStr,
            }
            uiManager.showWindow(UIID.Alert, alertData)
            return;
        }
        
        uiManager.showWindow(UIID.AlertGuanfangtixian, this.seletedData);
        uiManager.showWindow(UIID.AlertAlipayAccountFill);
    }

    onClickTixianHis() {
        uiManager.open(UIID.AlertWalletHis);
    }

    onClickClose() {
        cc.tween(this.node).to(this.time, {
            x: cc.winSize.width
        }).start().call(() => {
            uiManager.close(this);
        });
    }

}
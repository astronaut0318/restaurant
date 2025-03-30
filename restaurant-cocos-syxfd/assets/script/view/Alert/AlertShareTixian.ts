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
import WithdrawManager from "../Hall/WithdrawManager";
import { AlertData } from "./Alert";
import WalletItem from "./WalletItem";

const { ccclass, property } = cc._decorator;

const KEY_ALIPAY_ACCOUNT = "KEY_ALIPAY_ACCOUNT";
const KEY_ALIPAY_REALNAME = "KEY_ALIPAY_REALNAME";

@ccclass
export default class AlertShareTixian extends UIView {

    @property(cc.Label)
    yue: cc.Label = null;

    @property(cc.Prefab)
    tixianItem: cc.Prefab = null;

    @property(cc.Node)
    grid: cc.Node = null;

    @property(cc.Button)
    submitBtn: cc.Button = null;

    private _data = null;
    private listData = null;
    private seletedData = null;
    private _isAlertAlipayAccountFillOpened = false;
    private _isTixianing = false;

    onOpen() {
        this.getData();
        this._isAlertAlipayAccountFillOpened = false;

        let accountStored = cc.sys.localStorage.getItem(KEY_ALIPAY_ACCOUNT);
        let realNameStored = cc.sys.localStorage.getItem(KEY_ALIPAY_REALNAME);

        if(!accountStored || !realNameStored || accountStored == "" || realNameStored == "" || this._isAlertAlipayAccountFillOpened == false) {
            uiManager.showWindow(UIID.AlertAlipayAccountFill);
            this._isAlertAlipayAccountFillOpened = true;
        }
    }

    private getData() {
        this.grid.removeAllChildren();

        Global.shareMoneyNumber = Global.leijishouyi / 100;
        this.yue.string = Global.shareMoneyNumber.toFixed(2);

        this.listData = WithdrawManager.inst.findShareData();
        if (this.listData) {
            for (let i = 0; i < this.listData.length; i++) {
                const element = this.listData[i];
                let item = cc.instantiate(this.tixianItem);
                this.setItem(item, element);
                this.grid.addChild(item);
            }

            let target = this.grid.children[0];
            if (target) {
                let data = target["_data"];
                this.seletedData = data;
                this.resetSelected();
                let script: WalletItem = target.getComponent(WalletItem);
                if (script) {
                    script.showSelected(true);
                }
            }
        }
    }

    // TODO 提现
    onClickOk() {
        if (this._isTixianing) return;

        if (!this.seletedData) return;

        let { money, id } = this.seletedData;
        //money = 0.1;
        console.log(money);
        if (money > Global.shareMoneyNumber) {
            let ad: AlertData = {
                title: "温馨提示",
                content: "当前余额不足，可以通过邀请好友或促进好友看视频获得更多奖励~"
            }
            uiManager.showWindow(UIID.Alert, ad);
            this._isTixianing = false;
            this.submitBtn.interactable = !this._isTixianing;
            return;
        }

        let accountStored = cc.sys.localStorage.getItem(KEY_ALIPAY_ACCOUNT);
        let realNameStored = cc.sys.localStorage.getItem(KEY_ALIPAY_REALNAME);

        if(!accountStored || !realNameStored || accountStored == "" || realNameStored == "" || this._isAlertAlipayAccountFillOpened == false) {
            uiManager.showWindow(UIID.AlertAlipayAccountFill);
            this._isAlertAlipayAccountFillOpened = true;
        }
        else {
            let data = {
                type: "share",
                money: money * 100,
                payee_account: accountStored,
                payee_real_name: realNameStored,
                payer_show_name: "分享提现",
            };
            let _this = this;

            _this._isTixianing = true;
            _this.submitBtn.interactable = !_this._isTixianing;
            setTimeout(()=>{
                _this._isTixianing = false;
                _this.submitBtn.interactable = !_this._isTixianing;
            }, 6000);

            Request2.getApp().open('user/alidraw', data, (res) => {
                _LOG("share---", res)
                if (res.code != 0) {
                    Utils.showToast("提现失败");
                    setTimeout(()=>{
                        _this._isTixianing = false;
                        _this.submitBtn.interactable = !_this._isTixianing;
                    }, 2000);
                    return;
                }
                WithdrawManager.inst.getShareRewerd(id, () => {
                    _this.getData();
                    let desc = `恭喜您成功提现${money}元红包，您可以前往支付宝查看到账情况`;
                    let ad: AlertData = {
                        title: "提现成功",
                        content: desc,
                    }
                    uiManager.showWindow(UIID.Alert, ad);
                    main.emit(EVENT_TAG.GTE_SHARE_LAYER_DATA);
                    setTimeout(()=>{
                        _this._isTixianing = false;
                        _this.submitBtn.interactable = !_this._isTixianing;
                    }, 2000);
                });
            })
        }
    }

    onClickHis() {
        uiManager.open(UIID.AlertWalletHis, 1);
    }

    onClickClose() {
        uiManager.close(this);
    }

    setItem(node: cc.Node, data) {
        let script: WalletItem = node.getComponent(WalletItem);
        if (script) {
            script.setData(data.money, data.title);
        }
        node["_data"] = data;
        if (node.hasEventListener(cc.Node.EventType.TOUCH_START)) {
            node.off(cc.Node.EventType.TOUCH_START, this.itemTouch, this);
        }
        node.on(cc.Node.EventType.TOUCH_START, this.itemTouch, this);
    }

    private resetSelected() {
        this.grid.children.forEach(el => {
            let script: WalletItem = el.getComponent(WalletItem);
            if (script) {
                script.showSelected(false);
            }
        })
    }

    private itemTouch(event: cc.Event.EventTouch) {
        let target = event.target;
        let data = target._data;
        this.seletedData = data;
        this.resetSelected();
        let script: WalletItem = target.getComponent(WalletItem);
        if (script) {
            script.showSelected(true);
        }
    }

}
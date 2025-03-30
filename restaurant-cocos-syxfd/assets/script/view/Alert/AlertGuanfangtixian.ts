import { api } from "../../api/api";
import { cc_game_config, EVENT_TAG, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";
import WxUtil from "../../wx/Wx";
import WithdrawManager from "../Hall/WithdrawManager";
import { AlertData } from "./Alert";
import { AccountData } from "./AlertAlipayAccountFill";



const { ccclass, property } = cc._decorator;

const KEY_ALIPAY_ACCOUNT = "KEY_ALIPAY_ACCOUNT";
const KEY_ALIPAY_REALNAME = "KEY_ALIPAY_REALNAME";

@ccclass
export default class AlertGuanfangtixian extends UIView {

    @property(cc.Node)
    tx1: cc.Node = null;

    @property(cc.Label)
    tx1_yuan: cc.Label = null;

    @property(cc.Button)
    tx1_btn: cc.Button = null;

    @property(cc.Node)
    tx2: cc.Node = null;

    @property(cc.Label)
    tx2_yuan: cc.Label = null;

    @property(cc.Label)
    tx2_yuan2: cc.Label = null;

    @property(cc.Label)
    tx2_yaoqing: cc.Label = null;

    @property(cc.ProgressBar)
    tx2_yaoqing_bar: cc.ProgressBar = null;

    @property(cc.Label)
    tx2_yaoqing_bar_label: cc.Label = null;

    @property(cc.Label)
    tx2_tixian_btn_label: cc.Label = null;

    private _data = null;
    private needFriendCount;
    private shopLevel;
    private id;
    private isDrawing = false;

    init(data) {
        this._data = data;
    }

    onOpen() {
        let { money, needFriendCount } = this._data;
        if (needFriendCount) {
            this.tx2.active = true;
            this.tx2_yuan.string = "0.3元";
            this.tx2_yuan2.string = money + "元";
            this.tx2_yaoqing.string = `邀请${needFriendCount}个好友即可助力`;
            this.setProgress(Global.friend, needFriendCount)
        } else {
            this.tx1.active = true;
            this.tx1_yuan.string = money + "元";
        }

        this.tx1_btn.enabled = true;
    }

    private setProgress(completedCount: number, totalCount: number) {
        let current = completedCount / totalCount;
        if (current >= 1) current = 1;
        if (current < 0.1 && current !== 0) current = 0.1;
        this.tx2_yaoqing_bar_label.string = `${completedCount}/${totalCount}`;
        this.tx2_yaoqing_bar.progress = current;
        if (this.tx2_yaoqing_bar.progress >= 1) {
            this.tx2_tixian_btn_label.string = "提现";
        }
    }

    // TODO 提现
    onClickTixian() {
        if(this.isDrawing == true) {
            return;
        }
        else {
            this.isDrawing = true;
            setTimeout(()=>{
                this.isDrawing = false;
            }, 5000);
        }

        this.isDrawing
        let { needFriendCount, shopLevel, id } = this._data;
        if (Global.friend < needFriendCount) return;

        this.needFriendCount = needFriendCount;
        this.shopLevel = shopLevel;
        this.id = id;

        let accountStored = cc.sys.localStorage.getItem(KEY_ALIPAY_ACCOUNT);
        let realNameStored = cc.sys.localStorage.getItem(KEY_ALIPAY_REALNAME);

        
        if(accountStored != null && realNameStored != null) {
            let data = {
                accout: accountStored,
                realName: realNameStored,
            }
    
            this.cashDraw(data);
        }
        else {
            uiManager.showWindow(UIID.AlertAlipayAccountFill);
        }
    }

    cashDraw(accountData: AccountData) {
        let desc = ""
        if (this.tx1.active) {
            desc = `恭喜您成功提现${this._data.money}元红包，您可以前往支付宝查看到账情况`;
        } else if (this.tx2.active) {
            if (this.tx2_yaoqing_bar.progress < 1) {
                desc = "恭喜您成功提现0.3元红包，您可以前往支付宝查看到账情况";
            } else {
                desc = `恭喜您成功提现${this._data.money}元红包，您可以前往支付宝查看到账情况`;
            }
        }

        let data = {
            type: "money",
            money: this._data.money * 100,
            payee_account: accountData.accout,
            payee_real_name: accountData.realName,
            payer_show_name: "游戏提现",
        };
        Request2.getApp().open('user/alidraw', data, (res) => {
            _LOG("money---", res)
            if (res.code != 0) {
                Utils.showToast("提现失败");
                return;
            }
            let cb = () => {
                main.emit(EVENT_TAG.UPDATE_WALLET_DATA);
                Utils.closeEvent(this);
                let ad: AlertData = {
                    title: "提现成功",
                    content: desc,
                }

                uiManager.showWindow(UIID.Alert, ad);

                main.emit(EVENT_TAG.SUB_HONGBAO, this._data.money * 10000, () => { })
                main.emit(EVENT_TAG.UPDATE_WALLET_DATA);
            }
            if (this.shopLevel) {
                WithdrawManager.inst.getByLvlRewerd(this.id, cb);
            } else {
                WithdrawManager.inst.getOnceRewerd(this.id, cb);
            }
        });
    }

    // TODO SDK 分享
    onClickShare() {
        Utils.closeEvent(this);
        WxUtil.shareWeb();
    }

    onClickClose() {
        Utils.closeEvent(this);
    }

}
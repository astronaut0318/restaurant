import { api } from "../../api/api";
import { EVENT_TAG } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
import { main } from "../../Main";
import List from "../../ui/list/List";
import { uiManager } from "../../ui/UIManager";
import { UIView } from "../../ui/UIView";
import Http from "../../utils/Http";
import Request2 from "../../utils/Request";
import Utils from "../../utils/Utils";
import WxUtil from "../../wx/Wx";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareLayer extends cc.Component {

    @property(cc.Label)
    shareID: cc.Label = null;

    @property(cc.Label)
    haoyoushu: cc.Label = null;

    @property(cc.Label)
    leijizongshouyi: cc.Label = null;

    @property(cc.Label)
    leijinianshouyi: cc.Label = null;

    @property(cc.Label)
    jinriZongshouyi: cc.Label = null;

    @property(cc.Label)
    jinriZhiyaohaoyougongxian: cc.Label = null;

    @property(cc.Label)
    jinriKuosanhaoyougongxian: cc.Label = null;

    @property(cc.RichText)
    yaoqingren: cc.RichText = null;

    @property(cc.Sprite)
    yaoqingrenHead: cc.Sprite = null;

    @property(cc.Label)
    ramdomInfoLabel: cc.Label = null;

    @property(cc.Node)
    fillShareNode: cc.Node = null;

    private _data = null;

    private apprenticeList = [];

    private time = 0.3;

    start() {
        this.node.zIndex = 9999;
        this.node.x = cc.winSize.width;
    }

    onDestroy() {
        this.unschedule(this.ramdomInfo);
        main.off(EVENT_TAG.GTE_SHARE_LAYER_DATA, this.getShaerData, this);
    }

    open() {
        this.node.active = true;
        cc.tween(this.node).to(this.time, {
            x: cc.winSize.width / 2
        }).start();

        this.shareID.string = Global.shareID;
        this.getShaerData();

        this.ramdomInfo();
        this.schedule(this.ramdomInfo, 5);
        main.on(EVENT_TAG.GTE_SHARE_LAYER_DATA, this.getShaerData, this);
    }

    private ramdomInfo() {
        let randomUserName = Utils.randomUserName();
        let randomPerpleNum = Utils.getRandom(2, 20);
        let randomMoney = (randomPerpleNum * Utils.getRandom(3.5, 6, 1)).toFixed(1);
        this.ramdomInfoLabel.string = `${randomUserName}刚刚邀请了${randomPerpleNum}个好友，预计获得收益${randomMoney}元`;
    }

    private getShaerData() {
        this.leijizongshouyi.string = this.toFixed2(Global.leijishouyi / 100);
        this.leijinianshouyi.string = this.toFixed2(Global.jinrizongshouyi / 100 * 365);
        this.jinriZongshouyi.string = this.toFixed2(Global.jinrizongshouyi / 100);
        this.jinriZhiyaohaoyougongxian.string = this.toFixed2(Global.zhiyaohaoyougoobgxian / 100);
        this.jinriKuosanhaoyougongxian.string = this.toFixed2(Global.kuosanhaoyougongxian / 100);


        Request2.getApp().open('user/chum/list', { id: Global.userid }, res => {
            console.log("获取列表getlistbyuserid", res);
            let { redirect, spread } = res.data;
            let _list1 = [], _list2 = [], _list3 = [];

            if (redirect) {
                if (redirect instanceof Array && redirect.length > 0) {
                    redirect.forEach(val => {
                        if (val.service_count < 100) {
                            _list3.push(val);
                        } else {
                            _list1.push(val);
                        }
                    })
                }
            }
            if (spread) {
                if (spread instanceof Array && spread.length > 0) {
                    spread.forEach(val => {
                        if (val.service_count < 100) {
                            _list3.push(val);
                        } else {
                            _list2.push(val);
                        }
                    })
                }
            }

            this.apprenticeList = [_list1, _list2, _list3];

            let apprenticeNum = _list1.length + _list2.length + _list3.length;
            //let apprenticeNum = _list1.length + _list3.length;
            this.haoyoushu.string = "好友数：" + apprenticeNum;
            Global.friend = apprenticeNum;
        });

        Request2.getApp().open('user/my/inviter', { id: Global.userid }, res => {
            console.log("我的邀请人", res);
            if (res.code != 0) return;
            let imgUrl = res?.data?.heading;
            let nickname = res?.data?.nickname;
            if(nickname == null || nickname == undefined) {
                nickname = "无"
            }
            //let renshu = res?.data?.v1 + res?.data?.v2;
            //let shouyi = this.toFixed2(res?.data?.hysy / 100);
            //this.yaoqingren.string = `<color=#845542>他邀请</c><color=#ff2a2b>${renshu}</color><color=#845542>个好友，有效收益</c><color=#ff2a2b>${shouyi}</color><color=#845542>元</c>`;
            this.yaoqingren.string = `<color=#845542>邀请人：</color><color=#ff2a2b>${nickname}</color>`;
            if (imgUrl) {
                Utils.loadRemoteImg(imgUrl + "?aaa=aa.jpg", this.yaoqingrenHead);
            }
        });

        return;

        let params = {
            uuid: Global.uuid
        }
        Http.post(api.restaurantShareProfit, params, res => {
            this._data = res?.result;
            let { apprenticeNum } = this._data.hashMap;
            this.haoyoushu.string = "好友数：" + apprenticeNum;

            let { cumulativeProfit, estimateYearProfit, profitToday, inviteFriendsDirectlyProfit, spreadFriendsProfit } = this._data.restaurantShareRes;
            this.leijizongshouyi.string = this.toFixed2(cumulativeProfit);
            this.leijinianshouyi.string = this.toFixed2(estimateYearProfit);
            this.jinriZongshouyi.string = this.toFixed2(profitToday);
            this.jinriZhiyaohaoyougongxian.string = this.toFixed2(inviteFriendsDirectlyProfit);
            this.jinriKuosanhaoyougongxian.string = this.toFixed2(spreadFriendsProfit);

            let superiorUser = this._data?.superiorUser;
            if (superiorUser) {
                this.fillShareNode.active = false;
            }
            let superiorUserFriendNum = this._data.superiorUserFriendNum || 0;
            let shareMoneyCount = this._data.shareMoneyCount || 0;
            let imgUrl = superiorUser?.img;
            this.yaoqingren.string = `<color=#845542>他邀请</c><color=#ff2a2b>${superiorUserFriendNum}</color><color=#845542>个好友，有效收益</c><color=#ff2a2b>${shareMoneyCount}</color><color=#845542>元</c>`;
            if (imgUrl) {
                Utils.loadRemoteImg(imgUrl + "?aaa=aa.jpg", this.yaoqingrenHead);
            }
        })
    }

    private toFixed2(num) {
        if (!num) return "0.00";
        return num.toFixed(2);
    }

    onClickHis() {
        uiManager.open(UIID.ShareHis, this.apprenticeList);
    }

    // TODO SDK 微信分享
    onClickShareToWX() {
        WxUtil.shareWeb();
    }

    onClickShuoming() {
        uiManager.open(UIID.AlertShuoyiShuoming);
    }

    onClickShareTixian() {
        uiManager.open(UIID.AlertShareTixian);
    }

    onClickFillShare() {
        uiManager.showWindow(UIID.AlertShareFill);
    }


    onClickClose() {
        cc.tween(this.node).to(this.time, {
            x: cc.winSize.width * 2
        }).start().call(() => {
            this.node.active = false;
        });
        this.unschedule(this.ramdomInfo);
    }

}
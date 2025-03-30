import { cc_game_config, DEBUG } from "../config/GameConfig";
import { Global } from "../config/Global";

let domain = Global.serverHost; //"http://192.168.3.10:8080/jeecg-boot/restaurant";

if (!DEBUG) {
    domain = Global.serverHost;
}
// domain = "http://121.196.198.12/jeecg-boot/restaurant";

export let api = {
    // "1.localtest.dluu.net/getconfig"，



    login: domain + "/wx/login",
    getUserInfo: domain + "/restaurantUser/getUserByUuid",

    getTixianList: domain + "/restaurantWithdrawalConfigUser/list",//官方提现
    tixian: domain + "/restaurantWithdrawalConfigUser/receiveReward",//提现
    restaurantShareProfit: domain + "/restaurantShareProfit/list",//邀请好友界面数据
    fillShareID: domain + "/restaurantInvitationRecord/share",//填写邀请码
    shareTixianData: domain + "/restaurantShareWithdrawalUser/list",//分享提现数据
    shareTixian: domain + "/restaurantShareWithdrawalUser/receiveReward",//分享提现
    tixianHis: domain + "/restaurantUserWithdrawal/listByUuid",//提现历史记录
}
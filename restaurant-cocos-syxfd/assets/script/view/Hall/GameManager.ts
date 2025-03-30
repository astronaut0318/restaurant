import { api } from "../../api/api";
import Audioplayer from "../../audio/Audioplayer";
import { DEBUG, EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { UIID } from "../../config/UIConfig";
// import { astar } from "../../libs/AStar";
import { main } from "../../Main";
import { uiManager } from "../../ui/UIManager";
import GameStorage from "../../utils/GameStorage";
import Http from "../../utils/Http";
import Utils from "../../utils/Utils";
import ChuniangManager from "./ChuniangManager";
import CountManager from "./CountManager";
import KerenManager from "./KerenManager";
import ShopLevelManager from "./ShopLevelManager";
import TableManager from "./TableManager";
import TaskGuideManager from "./TaskGuideManager";
import TaskManager from "./TaskManager";

let PF = require("pathfinding");

const { ccclass, property } = cc._decorator;

export interface RoleRunData {
    path: cc.Vec2[],
    role: cc.Node,
    zIndex?: number,
    animPlay: boolean,
    animName: string,
}

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.Prefab)
    public gridPrefab: cc.Prefab = null;

    public gx: number = 40;

    // public grid = null;
    // public aStar = null;
    public _grid = null;
    public finder = null;

    public kerenManager: KerenManager = null;
    public tableManager: TableManager = null;
    public cnManager: ChuniangManager = null;

    @property(cc.Node)
    public noWalkPoints: cc.Node = null;

    @property(cc.Sprite)
    batai: cc.Sprite = null;

    @property(cc.Node)
    guideSpineNode: cc.Node = null;

    @property(cc.Node)
    chaopiaoNode: cc.Node = null;

    @property(cc.Prefab)
    chaopiaoSprite: cc.Prefab = null;

    @property(cc.Sprite)
    ditan: cc.Sprite = null;

    @property([cc.Sprite])
    lvzhis: cc.Sprite[] = [];

    @property([cc.Sprite])
    xianhuas: cc.Sprite[] = [];

    @property(cc.Sprite)
    zhaocaishu: cc.Sprite = null;

    @property(cc.Sprite)
    zaowangye: cc.Sprite = null;

    @property(cc.Sprite)
    shengxiao: cc.Sprite = null;

    @property(cc.Node)
    getChongzhiNode: cc.Node = null;

    @property(cc.Label)
    chongzhiLabel: cc.Label = null;

    @property(cc.Node)
    hongbaoNode: cc.Node = null;

    @property(cc.Prefab)
    hongbaoSprite: cc.Prefab = null;

    @property(cc.Node)
    guideTanhao: cc.Node = null;

    @property(cc.Node)
    guideDuihao: cc.Node = null;

    @property(cc.Node)
    everyTaskRedPoint: cc.Node = null;

    @property(cc.Label)
    shopLvl: cc.Label = null;

    @property(cc.Label)
    shopJindu: cc.Label = null;

    @property(cc.Node)
    chihuojieSpine: cc.Node = null;

    @property(cc.Label)
    chihuojieTimeLabel: cc.Label = null;

    @property(cc.Node)
    caidengs: cc.Node = null;

    @property(cc.Sprite)
    head: cc.Sprite = null;

    @property(cc.Label)
    clockMakingProgress: cc.Label = null;

    private cpSpriteNodePool: cc.NodePool = new cc.NodePool("cpSpriteNodePool");
    private hbSpriteNodePool: cc.NodePool = new cc.NodePool("hbSpriteNodePool");

    start() {
        this.node.zIndex = 99;
        this.kerenManager = this.node.getChildByName("KerenManager").getComponent(KerenManager);
        this.tableManager = this.node.getChildByName("TableManager").getComponent(TableManager);
        this.cnManager = this.node.getChildByName("ChuniangManager").getComponent(ChuniangManager);

        let numCols = Math.ceil(cc.winSize.width / this.gx);
        let numRows = Math.ceil(cc.winSize.height / this.gx);

        this._grid = new PF.Grid(numCols, numRows);
        // let noWalkables = [
        //     [4, 23],
        //     [4, 22],
        //     [4, 21], [5, 21],
        //     [4, 20], [5, 20],
        // ]
        // noWalkables.forEach(val => {
        //     this.grid.setWalkableAt(val[0], val[1], false);
        // })

        this.noWalkPoints.children.forEach(node => {
            node.getComponent(cc.Widget).updateAlignment();
            let point = [Math.ceil(node.x / this.gx), Math.ceil(node.y / this.gx)];
            this._grid.setWalkableAt(point[0], point[1], false);
        })

        for (let x = 3; x < 16; x++) {
            this._grid.setWalkableAt(x, 10, false);
            this._grid.setWalkableAt(x, 11, false);
        }


        // 画网格---------------------------------------------------------------------------------------------------------------------------
        // let grid = new astar.Grid(numCols, numRows);
        // let nodes = grid.getNodes()
        // nodes.forEach((node: any) => {
        //     node.forEach(element => {
        //         let node = cc.instantiate(this.gridPrefab);
        //         this.node.addChild(node);
        //         node.width = this.gx - 2;
        //         node.height = this.gx - 2;
        //         node.x = element.x * this.gx;
        //         node.y = element.y * this.gx;
        //         node.getChildByName("label").getComponent(cc.Label).string = `(${element.x},${element.y})`;
        //     });

        // });
        // 画网格--------------------------------------------end----------------------------------------------------------------------------

        // this.aStar = new astar.AStar();
        // this.aStar.allowDiag(false);
        this.finder = new PF.AStarFinder();

        this._init();
    }

    private _init() {
        Global.shopLevel = ShopLevelManager.inst.findShopLevelData().shopLevel - 1;
        let id = Global.shopLevel;
        let lvl = Global.shopLevel;
        GameStorage.setJson(STORAGE_KEY.NOW_SHOP_LEVEL, { id, lvl });

        this.updateMoneyLabel();
        this.updateRedPackLabel();
        this.updateUnLockFoods();
        this.updateUnLockTables();
        this.updateUnLockDecoration();
        this.updateUnLockCookWoman();

        this.updateHead();

        this.initEvent();
        this.scheduleUpdateAllType();

        this.initGuideSpine();


        let storageIncome = GameStorage.getInt(STORAGE_KEY.SHOP_INCOME) || 0;
        this.chongzhiLabel.string = "" + storageIncome;
        this.setShopIncomeTimer();

        this.checkChihuojie();
    }

    private initEvent() {
        main.on(EVENT_TAG.ADD_FLY_MONEY, this.flyMoney, this);
        main.on(EVENT_TAG.ADD_FLY_RED_PACK, this.flyRedPack, this);
        main.on(EVENT_TAG.ADD_MONEY, this.addMoney, this);
        main.on(EVENT_TAG.SUB_MONEY, this.subMoney, this);
        main.on(EVENT_TAG.SUB_HONGBAO, this.subRedPack, this);
        main.on(EVENT_TAG.UPDATE_UNLOCK_FOODS, this.updateUnLockFoods, this);
        main.on(EVENT_TAG.UPDATE_TABLE, this.updateUnLockTables, this);
        main.on(EVENT_TAG.UPDATE_DECORATION, this.updateUnLockDecoration, this);
        main.on(EVENT_TAG.UPDATE_UN_LOCK_COOK_WOMAN, this.updateUnLockCookWoman, this);
        main.on(EVENT_TAG.OPEN_CHIHUOJIE, this.openChiHuoJie, this);
    }

    protected onDestroy() {
        main.off(EVENT_TAG.ADD_FLY_MONEY, this.flyMoney, this);
        main.off(EVENT_TAG.ADD_FLY_RED_PACK, this.flyRedPack, this);
        main.off(EVENT_TAG.ADD_MONEY, this.addMoney, this);
        main.off(EVENT_TAG.SUB_MONEY, this.subMoney, this);
        main.off(EVENT_TAG.SUB_HONGBAO, this.subRedPack, this);
        main.off(EVENT_TAG.UPDATE_UNLOCK_FOODS, this.updateUnLockFoods, this);
        main.off(EVENT_TAG.UPDATE_TABLE, this.updateUnLockTables, this);
        main.off(EVENT_TAG.UPDATE_DECORATION, this.updateUnLockDecoration, this);
        main.off(EVENT_TAG.UPDATE_UN_LOCK_COOK_WOMAN, this.updateUnLockCookWoman, this);
        main.off(EVENT_TAG.OPEN_CHIHUOJIE, this.openChiHuoJie, this);
    }

    private updateUnLockFoods() {
        let unlockFoods: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS);
        if (!unlockFoods) {
            Utils.unlockFood(1);
        }
        unlockFoods = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS);

        let foodconfig = Global.localConfig[LOCAL_CONFIG.FoodConfig];
        if (foodconfig) {
            Global.unlockFoods = [];
            unlockFoods.forEach(id => {
                foodconfig.forEach(element => {
                    if (element.id == id) {
                        Global.unlockFoods.push(element);
                    }
                });
            })
        }

        _LOG(" Global.unLockFoods----", Global.unlockFoods);
    }

    private updateUnLockTables() {
        let unlockTables: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES);
        if (!unlockTables) {
            // Utils.unlockTable(1);
            // Utils.unlockTable(11);
            GameStorage.setJson(STORAGE_KEY.UN_LOCK_TABLES, [1, 11]);
        }
        unlockTables = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES);

        let tableConfig = Global.localConfig[LOCAL_CONFIG.Table];
        if (tableConfig) {
            Global.unlockTables = [];
            unlockTables.forEach(id => {
                tableConfig.forEach(element => {
                    if (element.id == id) {
                        Global.unlockTables.push(element);
                    }
                });
            })
        }

        _LOG(" Global.unlockTables----", Global.unlockTables);
        this.updateUseTable();
    }

    private updateUseTable() {
        let useTable: number[] = GameStorage.getJson(STORAGE_KEY.USE_TABLE);
        if (!useTable) {
            // Utils.useTable(0, 1)
            // Utils.useTable(1, 11)
            GameStorage.setJson(STORAGE_KEY.USE_TABLE, [1, 11]);
        }
        useTable = GameStorage.getJson(STORAGE_KEY.USE_TABLE);

        let unlockTables = Global.unlockTables;
        if (unlockTables) {
            useTable.forEach((id, index) => {
                unlockTables.forEach(element => {
                    if (id == null) {
                        let __id = index * 10 + 1;
                        if (element.id == __id) {
                            Utils.useTable(index, __id);
                            Global.useTables[index] = element;
                        }
                        return;
                    }
                    if (element.id == id) {
                        Global.useTables[index] = element;
                    }
                });
            })
        }

        _LOG(" Global.useTables----", Global.useTables);
        this.updateBatai();
        this.tableManager.updateTable();
    }

    private updateUnLockDecoration() {
        let unDecoration: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []);
        let DecorationUpgradeConfig = Global.localConfig[LOCAL_CONFIG.DecorationUpgradeConfig];
        if (DecorationUpgradeConfig) {
            Global.unlockDecoration = [];
            unDecoration.forEach(id => {
                DecorationUpgradeConfig.forEach(element => {
                    if (element.id == id) {
                        Global.unlockDecoration.push(element);
                    }
                });
            })
        }

        _LOG(" Global.unlockDecoration----", Global.unlockDecoration);
        this.updateUseDecoration();
    }

    private updateUseDecoration() {
        let useDecoration: number[] = GameStorage.getJson(STORAGE_KEY.USE_DECORATION, []);

        let unlockDecoration = Global.unlockDecoration;
        if (unlockDecoration) {
            useDecoration.forEach((id, index) => {
                unlockDecoration.forEach(element => {
                    if (element.id == id) {
                        Global.useDecoration[index] = element;
                    }
                });
            })
        }

        _LOG(" Global.useDecoration----", Global.useDecoration);
        this.updateDecoration();
    }

    private updateUnLockCookWoman() {
        let unlockCookWomans: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_COOK_WOMAN);
        if (!unlockCookWomans) {
            Utils.unlockCookWoman(2);
        }
        let cookWomans = Utils.formatCookWoman();
        for (let i = 0; i < cookWomans.length; i++) {
            let cookWoman = cookWomans[i];
            if (cookWoman.unlock) {
                Global.unlockCookWoman[i] = cookWoman;
            } else {
                Global.unlockCookWoman[i] = null;
            }
        }

        _LOG(" Global.unlockCookWoman----", Global.unlockCookWoman);
        this.cnManager.updateCookWoman();
    }

    private scheduleUpdateAllType() {
        this.updateAllType()
        this.schedule(this.updateAllType, 0.8);
    }

    private updateAllType() {
        //任务红点
        let guideData = TaskGuideManager.inst.getGuide();
        // console.log("guideData---", guideData)
        if (guideData.isok) {
            this.guideDuihao.active = true;
            this.guideTanhao.active = false;
        } else {
            this.guideTanhao.active = true;
            this.guideDuihao.active = false;
        }

        //饭店等级
        let lvlData = ShopLevelManager.inst.findShopLevelData();
        this.shopLvl.string = lvlData.shopLevel - 1 + "";
        console.log("饭店升级 updateAllType: " + (lvlData.shopLevel - 1).toString());
        this.checkUpLvl(lvlData.shopLevel - 1);
        this.shopJindu.string = Math.floor(lvlData.progress) + "%";

        //每日任务/成就红点
        let taskCanGetData = TaskManager.inst.findTaskCanGet();
        if (taskCanGetData.everyDayTaskCanGet || taskCanGetData.achievementCanGet) {
            this.everyTaskRedPoint.active = true;
        } else {
            this.everyTaskRedPoint.active = false;
        }

        //打卡进度
        let count = CountManager.inst.findEveryDayQuikCustomerCount();
        if (count > Global.everyMakeNeedNum) {
            count = Global.everyMakeNeedNum;
        }
        this.clockMakingProgress.string = `${count}/${Global.everyMakeNeedNum}`;
    }

    private checkUpLvl(lv: number) {
        if (lv > Global.shopLevel) {
            Global.shopLevel = lv;
            console.log("饭店升级 checkUpLvl: " + lv.toString());
            ShopLevelManager.inst.setShopUpLevel();
            uiManager.showWindow(UIID.AlertShopUpLvl, lv);
        }
    }

    private canSetShopIncomeTimer = true;
    private shopIncomeTimerInterval = 15;
    private shopIncomeTimerFunc() {
        let limit = Utils.getIncomeLimit();
        _LOG("充值收入上限", limit);
        let storageIncome = GameStorage.getInt(STORAGE_KEY.SHOP_INCOME) || 0;
        let income = Utils.getPerSeconIncome() * this.shopIncomeTimerInterval;
        _LOG("收入", income);
        storageIncome += income;
        if (storageIncome >= limit) {
            storageIncome = limit;
            this.unschedule(this.shopIncomeTimerFunc);
            this.canSetShopIncomeTimer = true;
        }
        GameStorage.setInt(STORAGE_KEY.SHOP_INCOME, storageIncome);
        this.chongzhiLabel.string = "" + storageIncome.toFixed(1);
        this.getChongzhiNode.active = true;
    }

    private setShopIncomeTimer() {
        if (!this.canSetShopIncomeTimer) return;
        this.canSetShopIncomeTimer = false;
        this.schedule(this.shopIncomeTimerFunc, this.shopIncomeTimerInterval)
    }

    private getShopIncome(double = false) {
        _LOG("获取充值收入");
        let storageIncome = GameStorage.getInt(STORAGE_KEY.SHOP_INCOME) || 0;
        if (double) {
            storageIncome *= 2;
        }
        this.flyMoney(storageIncome);
        GameStorage.setInt(STORAGE_KEY.SHOP_INCOME, 0);
        this.chongzhiLabel.string = "0";
        this.getChongzhiNode.active = false;
    }

    private initGuideSpine() {
        this.schedule(() => {
            this.guideSpineNode.active = true;
            Utils.playSpine(this.guideSpineNode, "1", false, () => {
                this.guideSpineNode.active = false;
            })
        }, 5)
    }

    private updateHead() {
        Utils.loadRemoteImg(Global.headUrl, this.head);
    }

    // 桌子类型0吧台1-6对应1-6号桌7
    private updateBatai() {
        let bataiData = Global.useTables[0];
        if (bataiData) {
            Utils.loadLocalSprite(`texture/batai/bar_${bataiData["id"]}`, this.batai);
        }
    }

    // 摆件类型0迎宾地垫1绿植2鲜花3招财摆件4灶王爷5生肖摆件
    private updateDecoration() {
        let useDecoration = Global.useDecoration;
        let data_0 = useDecoration[0];
        if (data_0) {
            Utils.loadLocalSprite(`texture/ditan/ditan${data_0["id"] % 10}`, this.ditan);
        }

        let data_1 = useDecoration[1];
        if (data_1) {
            this.lvzhis.forEach(sprite => {
                Utils.loadLocalSprite(`texture/peijian/lvzhi${data_1["id"] % 10}`, sprite);
            })
        }

        let data_2 = useDecoration[2];
        if (data_2) {
            this.xianhuas.forEach(sprite => {
                Utils.loadLocalSprite(`texture/peijian/xianhua${data_2["id"] % 10}`, sprite);
            })
        }

        let data_3 = useDecoration[3];
        if (data_3) {
            Utils.loadLocalSprite(`texture/peijian/zhaocai${data_3["id"] % 10}`, this.zhaocaishu);
        }

        let data_4 = useDecoration[4];
        if (data_4) {
            Utils.loadLocalSprite(`texture/peijian/zaowangye${data_4["id"] % 10}`, this.zaowangye);
        }

        let data_5 = useDecoration[5];
        if (data_5) {
            Utils.loadLocalSprite(`texture/peijian/shengxiao${data_5["id"] % 10}`, this.shengxiao);
        }
    }

    public updateMoneyLabel() {
        let value = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.init_money);
        let money = GameStorage.getInt(STORAGE_KEY.GAME_MONEY);
        if (!money) {
            GameStorage.setInt(STORAGE_KEY.GAME_MONEY, value || 0);
            money = GameStorage.getInt(STORAGE_KEY.GAME_MONEY, 0);
        }
        this.chaopiaoNode.getComponent(cc.Label).string = money + "";
    }

    public updateRedPackLabel() {
        let redpack = GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK);
        if (!redpack) {
            GameStorage.setInt(STORAGE_KEY.GAME_RED_PACK, 0);
            redpack = GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK, 0);
        }

        this.hongbaoNode.getComponent(cc.Label).string = Utils.getYuanByWan(redpack) + "";
    }

    public flyMoney(num, pos?: cc.Vec2) {
        Utils.addMoney(num, () => {
            this.updateMoneyLabel();
            if (!pos) {
                pos = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);
            }
            Audioplayer.play_sound("coin");
            this.fly(this.cpSpriteNodePool, this.chaopiaoSprite, pos, this.chaopiaoNode);
        })
    }

    public flyRedPack(num, pos?: cc.Vec2) {
        Utils.addRedPack(num, () => {
            this.updateRedPackLabel();
            if (!pos) {
                pos = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);
            }
            Audioplayer.play_sound("coin");
            this.fly(this.hbSpriteNodePool, this.hongbaoSprite, pos, this.hongbaoNode);
        })
    }

    public addMoney(num) {
        Utils.addMoney(num, () => {
            this.updateMoneyLabel();
        })
    }

    public addRedPack(num) {
        Utils.addRedPack(num, () => {
            this.updateRedPackLabel();
        })
    }

    public subMoney(num, callback) {
        Utils.subMoney(num, () => {
            this.updateMoneyLabel();
            if (callback) {
                callback();
            }
        })
    }

    public subRedPack(num, callback) {
        Utils.subRedpack(num, () => {
            this.updateRedPackLabel();
            if (callback) {
                callback();
            }
        })
    }

    private fly(nodePool: cc.NodePool, spritePrefab: cc.Prefab, pos, flyNode: cc.Node) {
        for (let i = 0; i < 10; i++) {
            let cp = nodePool.get();
            if (!cp) {
                cp = cc.instantiate(spritePrefab);
            }
            let toV2 = Utils.convetOtherNodeSpaceAR(flyNode, this.node.parent);

            this.node.parent.addChild(cp);
            cp.setPosition(pos);
            cc.tween(cp)
                .delay(0.1 * i)
                .to(1, {
                    x: toV2.x,
                    y: toV2.y
                })
                .call(() => {
                    nodePool.put(cp);
                })
                .start();
        }
    }

    private checkChihuojie() {
        let open = GameStorage.getBool(STORAGE_KEY.CHIHUOJIE_OPEN, false);
        if (open) {
            let time = GameStorage.getInt(STORAGE_KEY.CHIHUOJIE_TIME, 0);
            if (time > 0) {
                this.chihuojieTotalTime = time;
                this.openChiHuoJie(true);
            }
        }
    }

    private chihuojieTotalTime = 500;
    private openChiHuoJie(noNeedPlaySpine = false) {
        if (Global.chihuojieOpen) return;
        Global.chihuojieOpen = true;
        GameStorage.setBool(STORAGE_KEY.CHIHUOJIE_OPEN, Global.chihuojieOpen);

        let openFunc = () => {
            this.chihuojieSpine.active = false;
            this.caidengs.active = true;
            this.schedule(() => {
                this.chihuojieTotalTime--;
                GameStorage.setInt(STORAGE_KEY.CHIHUOJIE_TIME, this.chihuojieTotalTime);

                this.chihuojieTimeLabel.string = Utils.getTimeStrBySeconds(this.chihuojieTotalTime);

                if (this.chihuojieTotalTime <= 0) {
                    this.chihuojieTotalTime = 500;
                    Global.chihuojieOpen = false;
                    GameStorage.setBool(STORAGE_KEY.CHIHUOJIE_OPEN, Global.chihuojieOpen);
                    this.chihuojieTimeLabel.string = "";
                    this.caidengs.active = false;
                }
            }, 1, this.chihuojieTotalTime - 1);
        }

        if (noNeedPlaySpine) {
            openFunc();
            return;
        }

        this.chihuojieSpine.active = true;
        Audioplayer.play_sound("double_success");
        Utils.playSpine(this.chihuojieSpine, "rwwc", false, openFunc, this)
    }

    onClickShowGetIncome() {
        uiManager.showWindow(UIID.AlertGetIncome, {
            cb: this.getShopIncome,
            thisObj: this
        })
    }

    // update (dt) {}
}

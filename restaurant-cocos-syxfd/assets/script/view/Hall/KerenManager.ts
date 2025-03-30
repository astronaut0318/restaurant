import Audioplayer from "../../audio/Audioplayer";
import { EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY, STORAGE_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { main } from "../../Main";
import GameStorage from "../../utils/GameStorage";
import Utils from "../../utils/Utils";
import CountManager from "./CountManager";
import GameManager, { RoleRunData } from "./GameManager";
import Keren from "./Keren";
import ShopLevelManager from "./ShopLevelManager";

const { ccclass, property } = cc._decorator;

interface WalkToWaitPath {
    path: cc.Vec2[],
    isEmpty: boolean,
    index: number,
}

export interface KerenRoleRunData extends RoleRunData {
    walkToWaitPath: WalkToWaitPath,
    role: cc.Node,
    delay: number,
    caiData: any,
    isWalk: boolean,
    roleTag: number,
    zIndex?: number,
    tableIndex?: number,
    dir?: string,
    chaocaiId?: number,
}

@ccclass
export default class KerenManager extends cc.Component {
    @property(cc.Node)
    public kerenStage: cc.Node = null;

    @property([cc.Prefab])
    public kerenPrefab: cc.Prefab[] = [];

    @property(cc.Node)
    public pingfang: cc.Node = null;

    @property(cc.Node)
    public tempStartPoint: cc.Node = null;

    @property([cc.Node])
    public tempEndPoints: cc.Node[] = [];

    @property(cc.Prefab)
    public rmb100: cc.Prefab = null;

    @property(cc.Node)
    public teshuStartPoint: cc.Node = null;

    @property(cc.Node)
    public teshuEndPoint: cc.Node = null;

    @property([cc.Prefab])
    public teshuKerenPrefab: cc.Prefab[] = [];

    @property(cc.Prefab)
    public hongbao: cc.Prefab = null;

    @property(cc.Node)
    public autoTipNode: cc.Node = null;

    @property(cc.Label)
    public autoTipLabel: cc.Label = null;

    private gameManager: GameManager = null;

    private kerenPool = new cc.NodePool("keren");
    private walkToWaitPaths: WalkToWaitPath[] = [];
    private createList: KerenRoleRunData[] = [];
    private _temp: KerenRoleRunData[] = [];
    private waitKerens: KerenRoleRunData[] = [];
    private tableKerens: KerenRoleRunData[] = [];

    private kerenSpeed: number = 0.1;

    private ypllPos: cc.Vec2 = null;
    private yplrPos: cc.Vec2 = null;

    start() {
        let y1 = this.pingfang.getChildByName("yellow_point_light_l");
        let y2 = this.pingfang.getChildByName("yellow_point_light_r");
        this.ypllPos = Utils.convetOtherNodeSpaceAR(y1, this.kerenStage);
        this.yplrPos = Utils.convetOtherNodeSpaceAR(y2, this.kerenStage);

        let value = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.people_move_speed);
        if (value) {
            this.kerenSpeed = value;
        }

        this.gameManager = this.node.parent.getComponent(GameManager);

        //初始化运行路线
        this.initWalkToWaitPath();
        // 初始化客人nodepool
        this.initKerenPool(20);
        //初始创建一个客人
        this.createKeren(1, 0);

        //检查排队客人数
        let people_into_duration = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.people_into_duration);
        let sort_people_max_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.sort_people_max_count);
        this.schedule(() => {
            if (this.createList.length <= sort_people_max_count) {
                this.createKeren(1, 0);
            }
        }, people_into_duration);

        this.schedule(this.runKeren, 1);

        //特殊客人
        this.createTeshuKeren();

        this.checkAutoFuwu();

        main.on(EVENT_TAG.AUTO_FUWU, this.autoFuwu, this);
        main.on(EVENT_TAG.QUICK_GET_KEREN, this.quickGetKeren, this);
        main.on(EVENT_TAG.CREATE_KEREN, this.createKeren, this);
        main.on(EVENT_TAG.UPDATE_WALK_TO_VACANCY, this.updateWaltToVacancy, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.AUTO_FUWU, this.autoFuwu, this);
        main.off(EVENT_TAG.QUICK_GET_KEREN, this.quickGetKeren, this);
        main.off(EVENT_TAG.CREATE_KEREN, this.createKeren, this);
        main.off(EVENT_TAG.UPDATE_WALK_TO_VACANCY, this.updateWaltToVacancy, this);
    }

    private runKeren() {
        //如果没有创建的客人长度 或者 等待的客人大于设定的数量，则先不运行
        let sort_people_max_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.sort_people_max_count);
        if (this.createList.length <= 0) {
            return
        };
        if (this._temp.length >= sort_people_max_count) {
            return
        };
        if (this.updateSorting) {
            return;
        }
        // 获取结束点
        let walkToWaitPath = this.getWalkToWaitPath();
        if (!walkToWaitPath) {
            _LOG("没有找到运行路线");
            this.updateSort();
            return;
        };

        _LOG("客人走到等待区");

        let keren = this.createList.shift();
        // this.scheduleOnce(() => {
        keren.isWalk = true;

        keren.walkToWaitPath = walkToWaitPath;
        keren.path = walkToWaitPath.path;

        this.kerenStage.addChild(keren.role);
        let pfSiblingIndex = this.pingfang.getSiblingIndex();
        keren.role.setSiblingIndex(pfSiblingIndex);
        keren.role.x = keren.path[0].x;
        keren.role.y = keren.path[0].y;

        this._temp.push(keren);
        keren.zIndex = this._temp.length;
        this.runPath(keren, 0, this.kerenSpeed, () => {
            keren.isWalk = false;
            this.waitKerens.push(keren);
            main.emit(EVENT_TAG.UPDATE_WALK_TO_VACANCY);
        });
        // }, keren.delay);
    }

    public createKeren(total: number, delay: number) {
        let unlockFoods = Global.unlockFoods;
        // _LOG("解锁的菜品：", unlockCai);
        if (!unlockFoods) return;

        for (let i = 0; i < total; i++) {
            let caiIndex = 0;
            //获取随机菜品
            if (unlockFoods.length > 1) {
                caiIndex = Utils.getRandom(0, unlockFoods.length - 1);
            }

            let foodData = unlockFoods[caiIndex];
            let foodLvl = Utils.findFoodLvl(foodData.id);
            let foodUpgradeData = Utils.findFoodUpgradeData(foodData.id, foodLvl);
            foodData["upgradeData"] = foodUpgradeData;
            _LOG("随机的菜", foodData);

            let keren = this.kerenPool.get();
            if (!keren) {
                keren = this.getRandomKeren();
                if (!keren) {
                    return;
                }
            }

            keren.getComponent(Keren).setData(foodData);

            let walkKeren: KerenRoleRunData = {
                walkToWaitPath: null,
                delay: delay * i,
                caiData: foodData,
                isWalk: false,
                path: null,
                role: keren,
                roleTag: Date.now(),
                zIndex: 200,
                animPlay: false,
                animName: "",
            }

            this.createList.push(walkKeren);
        }
    }

    private teshuIndex = 0;
    private teshuSpeed = 0.7;
    private teshukerenZanliTime = 5;

    private createTeshuKeren() {
        //特殊客人
        let tkPath = this.getTeshuPath();
        let tk = cc.instantiate(this.teshuKerenPrefab[this.teshuIndex]);
        this.kerenStage.addChild(tk);

        let kerenIndexs = {
            tuhao: 0,
            mingxing: 1,
            daoyou: 2,
        }
        let _index = kerenIndexs[tk.name];
        console.log(_index)
        let config = Utils.getTeshukerenConfig(_index);
        _LOG("特殊客人" + this.teshuIndex + "配置：", config);
        tk["_config"] = config;
        tk["_index"] = _index;

        tk.setPosition(tkPath[0].x, tkPath[0].y);
        let pfSiblingIndex = this.pingfang.getSiblingIndex();
        tk.setSiblingIndex(pfSiblingIndex);

        this.teshuIndex += 1;
        if (this.teshuIndex >= this.teshuKerenPrefab.length) this.teshuIndex = 0;

        let runData: RoleRunData = {
            path: tkPath,
            role: tk,
            zIndex: 2,
            animPlay: false,
            animName: "",
        }

        this.runPath(runData, 0, this.teshuSpeed, () => {
            Utils.playSpine(tk, "zhengmian_stan", false);
            this.scheduleOnce(() => {
                tkPath = tkPath.reverse();
                let runData: RoleRunData = {
                    path: tkPath,
                    role: tk,
                    zIndex: 2,
                    animPlay: false,
                    animName: "",
                }
                this.createTeshuKeren();
                this.runPath(runData, 0, this.teshuSpeed, () => {
                    tk.destroy();
                })
            }, this.teshukerenZanliTime);
        })
    }

    private initWalkToWaitPath() {
        this.tempStartPoint.getComponent(cc.Widget).updateAlignment();
        let s1 = this.tempStartPoint.x / this.gameManager.gx;
        s1 = Math.ceil(s1);
        let s2 = this.tempStartPoint.y / this.gameManager.gx;
        s2 = Math.ceil(s2);

        for (let i = 1; i < 3; i++) {
            let y = s2 - i;
            // 左侧墙体
            for (let j = 0; j < 9; j++) {
                this.gameManager._grid.setWalkableAt(j, y - 1, false);
            }
            // 右侧墙体
            for (let j = 11; j < 19; j++) {
                this.gameManager._grid.setWalkableAt(j, y, false);
            }
        }

        let sort_people_max_count = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.sort_people_max_count);

        let len = this.tempEndPoints.length;
        if (sort_people_max_count > len) sort_people_max_count = len;
        len = sort_people_max_count;

        for (let i = 0; i < len; i++) {
            const endPoint = this.tempEndPoints[i];
            endPoint.getComponent(cc.Widget).updateAlignment();
            let end = [Math.ceil(endPoint.x / this.gameManager.gx), Math.floor(endPoint.y / this.gameManager.gx)];


            let gridBackup = this.gameManager._grid.clone();
            let _path = this.gameManager.finder.findPath(s1, s2, end[0], end[1], gridBackup);
            let path = this.getRealPath(_path);

            this.walkToWaitPaths.push({
                path,
                isEmpty: true,
                index: i,
            });
        }
    }

    private lastWalkIndex = 0;
    private getWalkToWaitPath() {
        _LOG("this.walkToWaitPaths...", this.walkToWaitPaths)
        let walkToWaitPath: WalkToWaitPath = null;

        for (let i = this.walkToWaitPaths.length - 1; i >= 0; i--) {
            const element = this.walkToWaitPaths[i];
            if (!element.isEmpty) {
                break;
            }
            walkToWaitPath = element;
        }
        if (walkToWaitPath) {
            _LOG("有空站位的id:" + walkToWaitPath.index);
            this.setWalkToWaitPathEmpty(walkToWaitPath.index, false);
        }

        return walkToWaitPath;
    }

    private resetWalkToWaitPath() {
        this.lastWalkIndex = 0;
        for (let i = 0; i < this.walkToWaitPaths.length; i++) {
            this.walkToWaitPaths[i].isEmpty = true;
        }
    }

    private setWalkToWaitPathEmpty(index: number, isEmpty: boolean) {
        // if (isEmpty) {
        //     this.getWalkIndex -= 1;
        // } else {
        //     this.getWalkIndex += 1;
        // }
        this.walkToWaitPaths[index].isEmpty = isEmpty;
    }

    private getRandomKeren() {
        let r = Utils.getRandom(0, this.kerenPrefab.length - 1);
        let rKerenPrefab = this.kerenPrefab[r];
        if (!rKerenPrefab) {
            _LOG("客人预制体创建错误");
            return;
        };
        return cc.instantiate(rKerenPrefab);
    }

    private initKerenPool(num: number) {
        for (let i = 0; i < num; i++) {
            let keren = this.getRandomKeren();
            if (keren) {
                this.kerenPool.put(keren);
            }
        }
    }

    private getRealPath(path): cc.Vec2[] {
        let real: cc.Vec2[] = [];
        path.forEach((arr) => {
            real.push(cc.v2(arr[0] * this.gameManager.gx, arr[1] * this.gameManager.gx));
        })
        return real;
    }

    private walkToVacancy(findVacancy) {
        _LOG("去空位......")
        this._temp.shift();
        let waitKeren = this.waitKerens.shift();

        let { dir, findPos, findRPos, tableIndex } = findVacancy;
        this.gameManager.tableManager.setVacancy(tableIndex, dir, false);

        let walkToWaitPath = waitKeren.walkToWaitPath;

        let path = waitKeren.path;
        let rolePos = waitKeren.role.position;

        let s1 = Math.round(rolePos.x / this.gameManager.gx),
            s2 = Math.round(rolePos.y / this.gameManager.gx);

        let gridBackup = this.gameManager._grid.clone();
        let _path = this.gameManager.finder.findPath(s1, s2, findPos.x, findPos.y, gridBackup);
        path = this.getRealPath(_path);
        console.log("findRPos...............", findRPos)
        path.push(findRPos)
        waitKeren.path = path;
        waitKeren.isWalk = true;
        waitKeren.zIndex = null;

        this.updateSort();

        this.runPath(waitKeren, 0, this.kerenSpeed, () => {
            //做到空位置上
            _LOG("坐到空位......")
            waitKeren.isWalk = false
            // waitKeren.role.zIndex = waitKeren.zIndex;
            waitKeren.tableIndex = tableIndex;
            waitKeren.dir = dir;

            this.setWalkToWaitPathEmpty(walkToWaitPath.index, true);
            this.tableKerens.push(waitKeren);

            let sx = Math.abs(waitKeren.role.scaleX);
            if (dir == "left") {
                sx = -sx;
            }
            waitKeren.role.scaleX = sx;

            let runLastPos = path[path.length - 1];
            let rolePos = waitKeren.role.position;
            if (runLastPos.x !== rolePos.x || runLastPos.y !== rolePos.y) {
                console.error("没有走到空位置");

                // let s1 = Math.round(rolePos.x / this.gameManager.gx);
                // let s2 = Math.round(rolePos.y / this.gameManager.gx);
                // let gridBackup = this.gameManager._grid.clone();
                // let _path = this.gameManager.finder.findPath(s1, s2, findPos.x, findPos.y, gridBackup);
                // path = this.getRealPath(_path);
                // waitKeren.path = path;
                // waitKeren.isWalk = true;
                return
            }

            // // 测试钱的位置
            // let rmb = cc.instantiate(this.rmb100);
            // this.kerenStage.addChild(rmb);
            // rmb.x = waitKeren.role.x + 60;
            // rmb.y = waitKeren.role.y + 40;

            // // 测试红包的位置
            // let rmb2 = cc.instantiate(this.rmb100);
            // this.kerenStage.addChild(rmb2);
            // rmb2.x = waitKeren.role.x + 110;
            // rmb2.y = waitKeren.role.y + 40;


            //点菜
            let diancan = waitKeren.role.getChildByName("diancan");
            diancan["waitKeren"] = waitKeren;
            Utils.playSpine(waitKeren.role, "diancai");
            diancan.active = true;
        });

    }

    private getTeshuPath() {
        this.teshuStartPoint.getComponent(cc.Widget).updateAlignment();
        let s1 = this.teshuStartPoint.x / this.gameManager.gx;
        s1 = Math.ceil(s1);
        let s2 = this.teshuStartPoint.y / this.gameManager.gx;
        s2 = Math.ceil(s2);

        this.teshuEndPoint.getComponent(cc.Widget).updateAlignment();
        let e1 = this.teshuEndPoint.x / this.gameManager.gx;
        e1 = Math.ceil(e1);
        let e2 = this.teshuEndPoint.y / this.gameManager.gx;
        e2 = Math.ceil(e2);

        let gridBackup = this.gameManager._grid.clone();
        let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
        return this.getRealPath(_path);
    }

    private updateSorting = false;
    private updateSort() {
        if (this.updateSorting) {
            return;
        }
        if (this._temp.length <= 0) {
            return;
        }
        if (this._temp.some(val => val.isWalk == true)) {
            return;
        }
        this.updateSorting = true;
        _LOG("排队更新开始-----------------------------------------------------------");
        // debugger;
        this.resetWalkToWaitPath();
        let len = this._temp.length - 1;
        this._temp.forEach((walkKeren, i) => {

            let walkToWaitPath = this.getWalkToWaitPath();
            if (!walkToWaitPath) return;
            let newPath = walkToWaitPath.path;
            let s1 = Math.ceil(walkKeren.role.x / this.gameManager.gx),
                s2 = Math.ceil(walkKeren.role.y / this.gameManager.gx);

            let e1 = Math.ceil(newPath[newPath.length - 1].x / this.gameManager.gx),
                e2 = Math.ceil(newPath[newPath.length - 1].y / this.gameManager.gx);

            let gridBackup = this.gameManager._grid.clone();
            let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
            walkKeren.path = this.getRealPath(_path);


            this.runPath(walkKeren, 0, this.kerenSpeed, () => {
                if (i >= len) {
                    this.updateSorting = false;
                    _LOG("排队更新完成");
                }
                // if (this.waitKerens[i]) {
                //     this.waitKerens[i].path = walkKeren.path;
                // }
            });
        })
    }

    public eat(kerenData: KerenRoleRunData) {
        let role = kerenData.role;
        this.gameManager.tableManager.setFood(kerenData.tableIndex, kerenData.dir, kerenData.caiData.id || 1);

        Utils.playSpine(role, "chifan", false, () => {
            CountManager.inst.setServiceCount();
            // 扔钱 和 红包
            let rmbV2 = cc.v2(role.x + 100, role.y + 50);
            let hongbaoV2 = cc.v2(role.x + 40, role.y + 50);
            console.error(kerenData)
            let rmbNum = kerenData.caiData.upgradeData.sellPrice || 50;
            let hongbaoNum = Utils.getRandom(100, 200);
            if (Global.chihuojieOpen) {
                rmbNum *= 2;
                hongbaoNum *= 2;
            }
            let rmb = cc.instantiate(this.rmb100);
            this.kerenStage.addChild(rmb);
            rmb.setPosition(rmbV2);
            rmb["rmbNum"] = rmbNum;

            let hongbao = cc.instantiate(this.hongbao);
            this.kerenStage.addChild(hongbao);
            hongbao.setPosition(hongbaoV2);
            hongbao["hongbaoNum"] = hongbaoNum;

            let s1 = Math.ceil(role.x / this.gameManager.gx),
                s2 = Math.ceil(role.y / this.gameManager.gx);

            let end = this.tempStartPoint;
            let e1 = Math.ceil(end.x / this.gameManager.gx),
                e2 = Math.ceil(end.y / this.gameManager.gx);

            let gridBackup = this.gameManager._grid.clone();
            let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
            let path = this.getRealPath(_path);

            let runData: RoleRunData = {
                path,
                role: kerenData.role,
                zIndex: 1000,
                animPlay: false,
                animName: "",
            }

            this.gameManager.tableManager.setFood(kerenData.tableIndex, kerenData.dir, 0);
            this.gameManager.tableManager.setVacancy(kerenData.tableIndex, kerenData.dir, true);
            //回去
            let index = -1;
            for (let i = 0; i < this.tableKerens.length; i++) {
                const element = this.tableKerens[i];
                if (element.roleTag == kerenData.roleTag) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                _LOG("删除tableKerens", index);
                this.tableKerens.splice(index, 1);
            }
            this.runPath(runData, 0, this.kerenSpeed, () => {
                // this.tableKerens.shift();
                // kerenData.role.destroy();
                this.kerenPool.put(kerenData.role);
            })
        })
    }

    private checkAutoFuwu() {
        let open = GameStorage.getBool(STORAGE_KEY.AUTO_FUWU_OPEN, false);
        if (open) {
            let time = GameStorage.getInt(STORAGE_KEY.AUTO_FUWU_TIME, 0);
            if (time > 0) {
                this.autoFuwu(time);
            }
        }
    }

    private autoFuwuTotalTime = 500;
    public autoFuwu(time?: number) {
        //自动服务
        if (Global.autoFuwuOpen) return;
        _LOG("自动服务");
        Audioplayer.play_sound("double_success");
        Global.autoFuwuOpen = true;
        GameStorage.setBool(STORAGE_KEY.AUTO_FUWU_OPEN, Global.autoFuwuOpen);

        let video_add_waiter_timer = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.video_add_waiter_timer);
        if (video_add_waiter_timer && video_add_waiter_timer > 0) {
            this.autoFuwuTotalTime = video_add_waiter_timer;
        }
        if (time) {
            this.autoFuwuTotalTime = time;
        }
        let func = () => {
            this.autoFuwuTotalTime--;
            GameStorage.setInt(STORAGE_KEY.AUTO_FUWU_TIME, this.autoFuwuTotalTime);
            this.autoTipNode.active = true;
            this.autoTipLabel.string = Utils.getTimeStrBySeconds(this.autoFuwuTotalTime);
            if (this.autoFuwuTotalTime <= 0) {
                this.unschedule(func);
                Global.autoFuwuOpen = false;
                GameStorage.setBool(STORAGE_KEY.AUTO_FUWU_OPEN, Global.autoFuwuOpen);
                GameStorage.setInt(STORAGE_KEY.AUTO_FUWU_TIME, 0);
                this.autoTipNode.active = false;
                this.autoTipLabel.string = "";
                return;
            }
            main.emit(EVENT_TAG.AUTO_GET_RMB);
            main.emit(EVENT_TAG.AUTO_GET_HONGBAO);
            main.emit(EVENT_TAG.DIAN_CAI);
        }
        this.schedule(func, 1, this.autoFuwuTotalTime - 1);
    }

    public quickGetKeren() {
        if (!Global.canQuickGet) return;
        Global.canQuickGet = false;
        this.scheduleOnce(() => {
            Global.canQuickGet = true;
        }, 60)
        this.createKeren(15, 1);
    }

    private runPath(roleRunData: KerenRoleRunData | RoleRunData, index: number, speed: number, callback?: () => void) {
        let path = roleRunData.path;
        let role = roleRunData.role;
        let zIndex = roleRunData.zIndex;

        if (index >= path.length - 1) {
            if (callback) callback();
            return;
        };

        let node = path[index];
        let animationName = "";
        let sx = 0

        let nextNode = path[index + 1];
        if (nextNode) {
            if (nextNode.x == node.x) {
                if (nextNode.y > node.y) {
                    animationName = "beimian";
                } else {
                    animationName = "zhengmian";
                }
            } else {
                animationName = "cemian";
                sx = Math.abs(role.scaleX);
                if (nextNode.x > node.x) {
                    sx = -sx;
                }
            }
            if (sx) {
                role.scaleX = sx;
            }

            if (!roleRunData.animPlay || animationName !== roleRunData.animName) {
                roleRunData.animPlay = true;
                roleRunData.animName = animationName;
                role.getComponent(sp.Skeleton).setAnimation(0, animationName + "_walk", true);
            }

            let z = cc.winSize.height - role.y;
            if ((role.y <= this.pingfang.y)
                // ||(role.x >= this.ypllPos.x && role.x < this.yplrPos.x && animationName !== "beimian" && role.scaleX < 0)
            ) {
                role.zIndex = z;
            } else {
                role.zIndex = 0;
                let pfSiblingIndex = this.pingfang.getSiblingIndex();
                role.setSiblingIndex(pfSiblingIndex - 1);
            }
            if (!zIndex) {
                role.zIndex = z;
            }

            cc.tween(role)
                .to(speed, { x: nextNode.x, y: nextNode.y })
                .call(() => {
                    index++;
                    if (index == path.length - 1) {
                        roleRunData.animPlay = false;
                        Utils.playSpine(role, animationName + "_stan");
                    }
                    this.runPath(roleRunData, index, speed, callback);
                })
                .start();
        }
    }

    private updateWaltToVacancy() {
        let findVacancy = this.gameManager.tableManager.findVacancy();
        if (this.waitKerens.length > 0 && findVacancy) {
            this.walkToVacancy(findVacancy);
        }
    }

    update(dt) {
        // let findVacancy = this.gameManager.tableManager.findVacancy();
        // if (this.waitKerens.length > 0 && findVacancy && !this.updateSorting) {
        //     // _LOG("findVacancy:", findVacancy);
        //     // this.walkToVacancy(findVacancy);
        // }
    }
}

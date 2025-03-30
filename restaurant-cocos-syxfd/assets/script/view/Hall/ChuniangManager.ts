import { EVENT_TAG, LOCAL_CONFIG, LOCAL_CONFIG_KEY } from "../../config/GameConfig";
import { Global } from "../../config/Global";
import { astar } from "../../libs/AStar";
import { main } from "../../Main";
import Utils from "../../utils/Utils";
import Caidan from "./Caidan";
import GameManager, { RoleRunData } from "./GameManager";
import { KerenRoleRunData } from "./KerenManager";
let xMin = 4,
    xMax = 14,
    yMax = 9,
    yMin = 7;

let caocaiPoints = [
    [4, 8], [8, 8], [11, 8], [15, 8]
]

interface ChaocaiTask {
    inTaskPoint: cc.Vec2,
    keren: KerenRoleRunData,
}

interface Chuniang {
    node: cc.Node,
    isWork: boolean,
    index: number,
    cnData: any,
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChuniangManager extends cc.Component {
    @property(cc.Node)
    cnStage: cc.Node = null;

    @property([cc.Prefab])
    chuniangPrefabs: cc.Prefab[] = [];

    @property([cc.Node])
    guos: cc.Node[] = [];

    @property(cc.Node)
    caidanLayer: cc.Node = null;

    @property(cc.Prefab)
    caidan: cc.Prefab = null;

    private chuniangs: Chuniang[] = [];

    // private chuniang: cc.Node = null;

    private gameManager: GameManager = null;

    private chuniangSpeed: number = 0.5;

    private localConfigSpeed: number = null;

    private points = [
        [xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]
    ];

    private started = false;

    private chaocaiTaskList: ChaocaiTask[] = [];

    private runIndex = 0;

    start() {
        this.started = true;
        this.gameManager = this.node.parent.getComponent(GameManager);
        this.resetChuniangSpeed();
        this.updateCookWoman();
        // this.runCn1();

        main.on(EVENT_TAG.SET_CHAOCAI_TASK, this.setChaocaiTask, this);
    }

    onDestroy() {
        main.off(EVENT_TAG.SET_CHAOCAI_TASK, this.setChaocaiTask, this);
    }

    private resetChuniangSpeed() {
        if (!this.localConfigSpeed) {
            this.localConfigSpeed = Utils.getLocalConfigValue(LOCAL_CONFIG.GamePlayConfig, LOCAL_CONFIG_KEY.people_move_speed);
        }
        if (this.localConfigSpeed) {
            this.chuniangSpeed = this.localConfigSpeed;
        }
    }

    private chihuojieSpeed() {
        if (this.chuniangSpeed == this.localConfigSpeed) {
            this.chuniangSpeed = this.chuniangSpeed / 2;
        } else {
            this.chuniangSpeed = this.localConfigSpeed;
            this.chuniangSpeed = this.chuniangSpeed / 2;
        }
    }

    public updateCookWoman() {
        if (!this.started) {
            return;
        }
        for (let i = 0; i < Global.unlockCookWoman.length; i++) {
            const element = Global.unlockCookWoman[i];
            if (element) {
                this.createChuniang(i, element);
            }
        }
    }

    private createChuniang(i: number, cnData) {
        //创建厨娘
        if (this.chuniangs[i]) return;

        this.guos[i].active = true;
        let chuniang = cc.instantiate(this.chuniangPrefabs[i]);
        this.cnStage.addChild(chuniang);
        chuniang.zIndex = 66;

        let x = caocaiPoints[i][0] * this.gameManager.gx;
        let y = caocaiPoints[i][1] * this.gameManager.gx;

        let pos = this.getCnPos(i, x, y);
        chuniang.x = pos.x;
        chuniang.y = pos.y;
        this.chuniangs[i] = {
            node: chuniang,
            isWork: false,
            index: i,
            cnData
        };
    }

    // 最多同时有 6*2 = 12
    private setChaocaiTask(keren: KerenRoleRunData) {
        let inTaskPoint = this.gameManager.tableManager.getTablePoint(keren.tableIndex, keren.dir);

        this.chaocaiTaskList.push({
            inTaskPoint,
            keren
        });
    }

    private shiftTask() {
        let cn = this.getNoworkCn();

        // 设置厨娘工作
        if (this.chaocaiTaskList.length > 0 && cn) {
            let taskData = this.chaocaiTaskList.shift();
            this.setChuniangWork(cn.index, true);
            // 寻路到浏览菜单点
            let s1 = Math.ceil(cn.node.x / this.gameManager.gx),
                s2 = Math.ceil(cn.node.y / this.gameManager.gx);
            if (cn.index == 2) {
                s1 = Math.floor(cn.node.x / this.gameManager.gx);
            }
            let chaocaiPoint = caocaiPoints[cn.index];

            let e1 = chaocaiPoint[0],
                e2 = chaocaiPoint[1] + 1;
            // this.gameManager.grid.setStartNode(start[0], start[1]);
            // this.gameManager.grid.setEndNode(chaocaiPoint[0], chaocaiPoint[1] + 1);
            // this.gameManager.aStar.findPath(this.gameManager.grid);
            let gridBackup = this.gameManager._grid.clone();
            let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
            let path = this.getRealPath(_path);

            let p0 = path[0];
            path[0] = this.getCnPos(cn.index, p0.x, p0.y);
            let pMax = path[path.length - 1];
            path[path.length - 1] = this.getCnPos(cn.index, pMax.x, pMax.y);

            let rundata: RoleRunData = {
                path,
                role: cn.node,
                animPlay: false,
                animName: "",
            }

            this.runPath(rundata, 0, () => {
                Utils.playSpine(cn.node, "liulancaidan", false, () => {
                    //添加菜单
                    let caidan = cc.instantiate(this.caidan);
                    this.caidanLayer.addChild(caidan);
                    let caidanScript = caidan.getComponent(Caidan);
                    caidanScript.setData(taskData.keren.caiData.id, taskData.keren.caiData.upgradeData.sellPrice);

                    // 去做饭
                    // this.gameManager.grid.setStartNode(chaocaiPoint[0], chaocaiPoint[1] + 1);
                    // this.gameManager.grid.setEndNode(chaocaiPoint[0], chaocaiPoint[1]);
                    // this.gameManager.aStar.findPath(this.gameManager.grid);
                    let s1 = chaocaiPoint[0],
                        s2 = chaocaiPoint[1] + 1,
                        e1 = chaocaiPoint[0],
                        e2 = chaocaiPoint[1];

                    let gridBackup = this.gameManager._grid.clone();
                    let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
                    let path = this.getRealPath(_path);
                    let p0 = path[0];
                    path[0] = this.getCnPos(cn.index, p0.x, p0.y);
                    let pMax = path[path.length - 1];
                    path[path.length - 1] = this.getCnPos(cn.index, pMax.x, pMax.y);

                    let rundata: RoleRunData = {
                        path,
                        role: cn.node,
                        animPlay: false,
                        animName: "",
                    }

                    this.runPath(rundata, 0, () => {
                        // 炒菜
                        Utils.playSpine(cn.node, "chaocai", true);
                        // 冒火
                        this.showGuoHuo(cn.index, true);
                        // 炒菜计时
                        let chaocaiTime = taskData.keren.caiData.upgradeData.cookTime || 1;
                        let chuniangSpeed = cn.cnData.lastUpgradeData.speedBonus || 0;
                        let time: any = (chaocaiTime / (1 + chuniangSpeed / 100)).toFixed(1);
                        time = Number(time);
                        _LOG("做饭厨娘数据速度：", chuniangSpeed);
                        _LOG("菜谱时间：", chaocaiTime);
                        _LOG("炒菜计时：", time);
                        let fenge = 10;
                        let delay = time / fenge;
                        let i = 0;
                        this.schedule(() => {
                            i += 1;
                            if (i >= fenge) {
                                this.setGuoProgressBar(cn.index, false, 0, fenge);
                            } else {
                                this.setGuoProgressBar(cn.index, true, i, fenge);
                            }
                        }, delay, fenge - 1)
                        this.scheduleOnce(() => {
                            //炒菜完成
                            this.showGuoHuo(cn.index, false);
                            Utils.playSpine(cn.node, "chaocaiwancheng", false, () => {
                                // 去送菜
                                // this.gameManager.grid.setStartNode(chaocaiPoint[0], chaocaiPoint[1]);
                                let inTaskPoint = taskData.inTaskPoint
                                if (taskData.keren.dir == "left") {
                                    inTaskPoint.x += 1;
                                    inTaskPoint.y -= 1;
                                } else {
                                    if (taskData.keren.dir == "right") {
                                        inTaskPoint.x -= 1;
                                        inTaskPoint.y -= 1;
                                    }
                                }
                                let s1 = chaocaiPoint[0],
                                    s2 = chaocaiPoint[1],
                                    e1 = inTaskPoint.x,
                                    e2 = inTaskPoint.y;
                                // this.gameManager.grid.setEndNode(inTaskPoint.x, inTaskPoint.y);
                                // this.gameManager.aStar.findPath(this.gameManager.grid);

                                let gridBackup = this.gameManager._grid.clone();
                                let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
                                let path = this.getRealPath(_path);

                                let rundata: RoleRunData = {
                                    path,
                                    role: cn.node,
                                    animPlay: false,
                                    animName: "",
                                }

                                if (Global.chihuojieOpen) {
                                    this.chihuojieSpeed();
                                } else {
                                    this.resetChuniangSpeed();
                                }

                                this.runPath(rundata, 0, () => {
                                    // 上菜动画
                                    Utils.playSpine(cn.node, "beimian_shangcai", false, () => {
                                        //销毁菜单
                                        caidan.destroy();
                                        // 通知客人吃饭
                                        this.gameManager.kerenManager.eat(taskData.keren);
                                        // 返回原位置
                                        // this.gameManager.grid.setStartNode(inTaskPoint.x, inTaskPoint.y);
                                        // this.gameManager.grid.setEndNode(chaocaiPoint[0], chaocaiPoint[1]);
                                        // this.gameManager.aStar.findPath(this.gameManager.grid);

                                        let s1 = inTaskPoint.x,
                                            s2 = inTaskPoint.y,
                                            e1 = chaocaiPoint[0],
                                            e2 = chaocaiPoint[1];

                                        let gridBackup = this.gameManager._grid.clone();
                                        let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
                                        let path = this.getRealPath(_path);
                                        let p0 = path[0];
                                        path[0] = this.getCnPos(cn.index, p0.x, p0.y);
                                        let pMax = path[path.length - 1];
                                        path[path.length - 1] = this.getCnPos(cn.index, pMax.x, pMax.y);

                                        let rundata: RoleRunData = {
                                            path,
                                            role: cn.node,
                                            animPlay: false,
                                            animName: "",
                                        }

                                        this.runPath(rundata, 0, () => {
                                            Utils.playSpine(cn.node, "maimeng", true);
                                            this.setChuniangWork(cn.index, false);
                                        }, this.chuniangSpeed, true);
                                    });
                                }, this.chuniangSpeed, true, true);
                            });
                        }, time)
                    }, 1, true);
                });
            }, 1, true);
        }
    }

    private getNoworkCn() {
        let chuniang: Chuniang = null;

        this.chuniangs.forEach(cnData => {
            if (!cnData.isWork && !chuniang) {
                chuniang = cnData;
            }
        })

        return chuniang;
    }

    private runCn1() {
        if (this.chuniangs[0].isWork) {
            return;
        }

        let start = this.points[this.runIndex];
        this.runIndex++;
        let nextIndex = this.runIndex;
        if (nextIndex == this.points.length) {
            nextIndex = 0;
            this.runIndex = 0;
        }
        let end = this.points[nextIndex]

        // _LOG(start, end);
        // this.gameManager.grid.setStartNode(start[0], start[1]);
        // this.gameManager.grid.setEndNode(end[0], end[1]);
        // this.gameManager.aStar.findPath(this.gameManager.grid);

        let s1 = start[0],
            s2 = start[1],
            e1 = end[0],
            e2 = end[1];

        let gridBackup = this.gameManager._grid.clone();
        let _path = this.gameManager.finder.findPath(s1, s2, e1, e2, gridBackup);
        let path = this.getRealPath(_path);

        let rundata: RoleRunData = {
            path,
            role: this.chuniangs[0].node,
            animPlay: false,
            animName: "",
        }

        this.runPath(rundata, 0, () => {
            this.scheduleOnce(() => {
                this.runCn1();
            }, 0.2)
        }, 1);
    }

    private getRealPath(path): cc.Vec2[] {
        let real: cc.Vec2[] = [];
        path.forEach((arr) => {
            real.push(cc.v2(arr[0] * this.gameManager.gx, arr[1] * this.gameManager.gx));
        })
        return real;
    }

    private runPath(roleRunData: RoleRunData, index: number, callback: Function, speed: number = 1, qiangzhi: boolean = false, duancai: boolean = false) {
        let path = roleRunData.path;
        let role = roleRunData.role;

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
                let suffix = "_walk";
                if (duancai) suffix = "_duancai";
                role.getComponent(sp.Skeleton).setAnimation(0, animationName + suffix, true);
            }

            cc.tween(role)
                .to(speed, { x: nextNode.x, y: nextNode.y })
                .call(() => {
                    index++;
                    this.runPath(roleRunData, index, callback, speed, qiangzhi, duancai);
                    // if (!this.chuniangs[0].isWork || qiangzhi) {
                    //     this.runPath(roleRunData, index, callback, speed, qiangzhi, duancai);
                    // }
                })
                .start();
        }
    }

    private getCnPos(i, x, y) {
        if (i == 1) {
            x -= 15;
        } else if (i == 2) {
            x += 15;
        }
        return cc.v2(x, y);
    }

    private setChuniangWork(index: number, isWork: boolean) {
        this.chuniangs[index].isWork = isWork;
    }

    private showGuoHuo(index: number, show: boolean) {
        let huo = this.guos[index].getChildByName("huo");
        huo.active = show;
    }

    private setGuoProgressBar(index: number, show: boolean, completedCount: number, totalCount: number) {
        let progressBarNode = this.guos[index].getChildByName("progressBar");
        progressBarNode.active = show;
        let progressBar = progressBarNode.getComponent(cc.ProgressBar);
        if (progressBar) {
            progressBar.progress = completedCount / totalCount;
        }
    }

    update(dt) {
        this.shiftTask();
    }
}

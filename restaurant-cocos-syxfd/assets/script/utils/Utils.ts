import { Util } from "pathfinding";
import { api } from "../api/api";
import Audioplayer from "../audio/Audioplayer";
import { assetsData, cc_game_config, EVENT_TAG, LOCAL_CONFIG, remote_assets, REMOTE_ASSET_TYPE, STORAGE_KEY } from "../config/GameConfig";
import { Global } from "../config/Global";
import { UIID } from "../config/UIConfig";
import { resLoader } from "../libs/res/ResLoader";
import { main } from "../Main";
import { uiManager } from "../ui/UIManager";
import { RoleRunData } from "../view/Hall/GameManager";
import GameStorage from "./GameStorage";
import Http from "./Http";
import LoadRemotePlist from "./LoadRemotePlist";
import Request2 from "./Request";

const md5 = require('md5');

class Utils {
    private static _inst: Utils = null
    public static get inst() {
        if (!this._inst) {
            this._inst = new Utils()
        }
        return this._inst
    }

    public md5(string: string) {
        return md5(string);
    }

    public getTimestamp() {
        return Math.floor(new Date().getTime() / 1000);
    }

    public copy(str: string) {
        if (cc.sys.isBrowser) {
            var input = document.createElement('input');
            input.setAttribute('readonly', 'readonly');
            input.setAttribute('value', str);
            document.body.appendChild(input);
            input.select();
            input.setSelectionRange(0, 9999);
            document.execCommand('Copy');
            if (document.execCommand('Copy')) {
                // 复制成功
            }
        } else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copy", "(Ljava/lang/String;)V", str);
            }
        }
    }

    public getLocalAsset(assetName: string, assetArr: any[]) {
        let assetData = null;
        for (let i = 0; i < assetArr.length; ++i) {
            if (assetName === assetArr[i].type) {
                assetData = assetArr[i];
                break;
            }
        }
        return assetData;
    }

    public getLocalAssetData(assetName): any {
        let assetData: assetsData = null;
        for (let i = 0; i < remote_assets.length; ++i) {
            let val = remote_assets[i]
            if (assetName === val.name) {
                assetData = val
                break;
            }
        }
        return assetData
    }

    public loadLocalSprite(url: string, sp: cc.Sprite) {
        resLoader.loadRes(url, (err, res: cc.Texture2D) => {
            if (err || !res) return;
            let spriteFrame = new cc.SpriteFrame(res);
            sp.spriteFrame = spriteFrame;
        })
    }

    public preloadRemote(url: string, callback: (data: any) => void, obj) {
        resLoader.loadRemoteRes(url, (err, res) => {
            if (err || !res) {
                callback.bind(this, err)();
                return
            };
            callback.bind(this, res)();
        })
    }

    // public preloadRemoteAll(arrar: any[], callback: (data: any) => void, obj) {
    //     arrar.map(url => {
    //         this.preloadRemote(url, callback, obj)
    //     })
    // }

    public loadRemoteImg(url: string, sprite: cc.Sprite,) {
        url += "?aaa=aa.jpg";
        resLoader.loadRemoteRes(url, (err, res) => {
            if (err || !res) return;

            let spriteFrame = new cc.SpriteFrame(res);
            sprite.spriteFrame = spriteFrame;
        })
    }

    public loadRemoteDragonBoneAssets(textureUrl: string, atlasJsonUrl: string, dragonboneJsonUrl: string) {
        return new Promise((resolve, reject) => {
            resLoader.loadRemoteRes(textureUrl, (error, texture) => {
                if (error) { reject(error); return; }

                resLoader.loadRemoteRes(atlasJsonUrl, { type: 'txt' }, (error, atlasJson: cc.JsonAsset) => {
                    if (error) { reject(error); return; }

                    resLoader.loadRemoteRes(dragonboneJsonUrl, { type: 'txt' }, (error, dragonBonesJson: cc.JsonAsset) => {
                        if (error) { reject(error); return; }

                        let assets = {
                            texture: texture,
                            atlasJson: atlasJson,
                            dragonBonesJson: dragonBonesJson,
                        }
                        // dbDisplay.playAnimation('goat_trot_anim', 0);
                        resolve(assets)
                    });
                });
            })
        })
    }

    public loadLocalDragonBoneAssets(textureUrl: string, atlasJsonUrl: string, dragonboneJsonUrl: string) {
        return new Promise((resolve, reject) => {
            resLoader.loadRes(textureUrl, (error, texture) => {
                if (error) { reject(error); return; }

                resLoader.loadRes(atlasJsonUrl, (error, atlasJson: cc.JsonAsset) => {
                    if (error) { reject(error); return; }

                    resLoader.loadRes(dragonboneJsonUrl, (error, dragonBonesJson: cc.JsonAsset) => {
                        if (error) { reject(error); return; }

                        let assets = {
                            texture: texture,
                            atlasJson: atlasJson,
                            dragonBonesJson: dragonBonesJson,
                        }
                        // dbDisplay.playAnimation('goat_trot_anim', 0);
                        resolve(assets)
                    });
                });
            })
        })
    }

    public setDragonBoneDisplay(dbDisplay: dragonBones.ArmatureDisplay, texture: cc.Texture2D, atlasJson: cc.JsonAsset, dragonBonesJson: cc.JsonAsset, armatureName: string = "Armature") {
        if (!dbDisplay) {
            let animNode = new cc.Node();
            animNode.name = 'animNode';
            animNode.parent = cc.find('Canvas');
            dbDisplay = animNode.addComponent(dragonBones.ArmatureDisplay);
        }
        return new Promise((resolve, reject) => {
            try {
                let atlas = new dragonBones.DragonBonesAtlasAsset();
                atlas.atlasJson = JSON.stringify(atlasJson.json);
                atlas.texture = texture;

                let asset = new dragonBones.DragonBonesAsset();
                asset.dragonBonesJson = JSON.stringify(dragonBonesJson.json);

                dbDisplay.dragonAtlasAsset = atlas;
                dbDisplay.dragonAsset = asset;
                dbDisplay.armatureName = armatureName;
                resolve(dbDisplay)
            } catch (error) {
                reject(error)
            }
        })
    }

    public loadRemoteDragonBones(textureUrl: string, atlasJsonUrl: string, dragonboneJsonUrl: string, dbDisplay: dragonBones.ArmatureDisplay, armatureName: string = "Armature") {
        return new Promise((resolve, reject) => {
            this.loadRemoteDragonBoneAssets(textureUrl, atlasJsonUrl, dragonboneJsonUrl).then((data: any) => {
                this.setDragonBoneDisplay(dbDisplay, data.texture, data.atlasJson, data.dragonBonesJson, armatureName).then((dbDisplay: dragonBones.ArmatureDisplay) => {
                    resolve(dbDisplay)
                }).catch(error => {
                    reject(error)
                })
            }).catch(error => {
                reject(error)
            })
        })
    }

    public loadRemotePlist(plistUrl: string, textureUrl: string, callback: (atlasSprite: cc.SpriteFrame[] | any) => void) {
        LoadRemotePlist(plistUrl, textureUrl, callback)
    }

    public replaceUrl(imgUrl: string): string {
        let tempUrl: string = ""

        let pos = imgUrl.indexOf('http://');
        if (pos < 0) {
            pos = imgUrl.indexOf('https://');
            if (pos < 0) {
                return '';
            } else {
                imgUrl = imgUrl.substring(8);
            }
        } else {
            imgUrl = imgUrl.substring(7);
        }
        pos = imgUrl.indexOf('/');
        if (pos < 0) return '';

        imgUrl = imgUrl.substring(pos);
        imgUrl = tempUrl + imgUrl

        return imgUrl;
    }

    public showLoading(main) {
        let loading: cc.Node = main.getChildByName("loading")
        loading.active = true
    }

    public hideLoading() {
        let loading: cc.Node = main.getChildByName("loading")
        loading.active = false
    }

    public addClick(button: cc.Button, callback: (data: any) => void, _data: any, _this) {
        let hasClick = button.node.hasEventListener("click")
        if (!hasClick) {
            button.node.on("click", callback.bind(_this, _data), this)
        }
    }

    public getUrlParam(url, name) {
        var params = url.split('?')[1];
        var param = new URLSearchParams('?' + params);
        return param.get(name) || ""
    }

    public getFormatDate() {//获取格式化时间
        var time = new Date();
        var y = String(time.getFullYear());
        var m = String(time.getMonth() + 1);
        var d = String(time.getDate());
        var h = String(time.getHours());
        var u = String(time.getMinutes());
        var s = String(time.getSeconds());
        return `${y}/${m}/${d}`;
    }

    public getFormatDate2(timer) {//获取格式化时间
        var time = new Date(timer);
        var y = String(time.getFullYear());
        var m = String(time.getMonth() + 1);
        var d = String(time.getDate());
        var h = String(time.getHours());
        var u = String(time.getMinutes());
        var s = String(time.getSeconds());
        return `${y}/${m}/${d} ${h}:${u}:${s}`;
    }

    public getNumberOfDays(date1, date2) {//获得天数
        //date1：开始日期，date2结束日期
        var a1 = Date.parse(new Date(date1));
        var a2 = Date.parse(new Date(date2));
        var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
        return day
    };

    public getDateDiff(start: number, end: number) {
        // start = 1625016195536;
        let date3 = end - start;
        //计算出相差天数 
        let days = Math.floor(date3 / (24 * 3600 * 1000));
        //计算出小时数 
        let leave1 = date3 % (24 * 3600 * 1000);  //计算天数后剩余的毫秒数 
        let hours = Math.floor(leave1 / (3600 * 1000));
        //计算相差分钟数 
        let leave2 = leave1 % (3600 * 1000);    //计算小时数后剩余的毫秒数 
        let minutes = Math.floor(leave2 / (60 * 1000));
        //计算相差秒数 
        let leave3 = leave2 % (60 * 1000);   //计算分钟数后剩余的毫秒数 
        let seconds = Math.round(leave3 / 1000);
        // console.log(" 相差 " + days + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒")

        let _hours = hours + days * 24;
        let str = _hours ? _hours + "小时 " + minutes + " 分钟" : minutes + " 分钟";
        return {
            str,
            hours: _hours,
            minutes,
            seconds
        }
    }

    public getTimeStrBySeconds(s: number) {
        let minutes = Math.floor(s / 60);
        let seconds = s % 60;
        let _seconds = ""
        if (seconds < 10) {
            _seconds = "0" + seconds;
        } else {
            _seconds = "" + seconds;
        }
        return minutes + ":" + _seconds;
    }

    public toFixed2(num: number) {
        return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
    }

    /**
     * 得到一个节点的世界坐标
     * node的原点在中心
     * @param {*} node 
     */
    public localConvertWorldPointAR(node) {
        if (node) {
            return node.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return null;
    }

    /**
     * 得到一个节点的世界坐标
     * node的原点在左下边
     * @param {*} node 
     */
    public localConvertWorldPoint(node) {
        if (node) {
            return node.convertToWorldSpace(cc.v2(0, 0));
        }
        return null;
    }


    /**
     * 把一个世界坐标的点，转换到某个节点下的坐标
     * 原点在node中心
     * @param {*} node 
     * @param {*} worldPoint 
     */
    public worldConvertLocalPointAR(node, worldPoint) {
        if (node) {
            return node.convertToNodeSpaceAR(worldPoint);
        }
        return null;
    }

    /**
     * 把一个世界坐标的点，转换到某个节点下的坐标
     * 原点在node左下角
     * @param {*} node 
     * @param {*} worldPoint 
     */
    public worldConvertLocalPoint(node, worldPoint) {
        if (node) {
            return node.convertToNodeSpace(worldPoint);
        }
        return null;
    }

    /**
     *  * 把一个节点的本地坐标转到另一个节点的本地坐标下
     * @param {*} node 
     * @param {*} targetNode 
     */
    public convetOtherNodeSpace(node, targetNode) {
        if (!node || !targetNode) {
            return null;
        }
        //先转成世界坐标
        let worldPoint = this.localConvertWorldPoint(node);
        return this.worldConvertLocalPoint(targetNode, worldPoint);
    }

    /**
     *  * 把一个节点的本地坐标转到另一个节点的本地坐标下
     * @param {*} node 
     * @param {*} targetNode 
     */
    public convetOtherNodeSpaceAR(node, targetNode) {
        if (!node || !targetNode) {
            return null;
        }
        //先转成世界坐标
        let worldPoint = this.localConvertWorldPointAR(node);
        return this.worldConvertLocalPointAR(targetNode, worldPoint);
    }

    public strfmt(fmt: string, ...args: any[]) {
        return fmt.replace(/\{(\d+)\}/g, (match: string, argIndex: number) => {
            return args[argIndex] || match;
        });
    }

    public getTimeStamp(): number {

        let timeStamp = Date.parse(new Date() + '') / 1000;
        return timeStamp;
    }

    public getRandom(start, end, fixed = 0) {
        let differ = end - start;
        let random = Math.random();
        return (start + differ * random).toFixed(fixed)
    }

    public playSpine(spineNode: cc.Node, name: string, loop = true, cb?: () => void, that?: any) {
        let skeleton = spineNode.getComponent(sp.Skeleton);
        let track = skeleton.setAnimation(0, name, loop);
        this.setSpineCompleteListener(skeleton, track, name, cb, that);
    }

    public setSpineCompleteListener(skeleton: sp.Skeleton, track, aniName: string, cb: () => void, that?: any) {
        if (track) {
            skeleton.setCompleteListener((trackEntry, loopCount) => {
                let name = trackEntry.animation ? trackEntry.animation.name : '';
                if (name === aniName) {
                    if (cb) {
                        if (that) {
                            cb.bind(that)();
                            return;
                        }
                        cb();
                    }
                }
            });
        }
    }

    public loadGameConfig(key, name: string, cb?: (data) => void) {
        let storeConfigName = name + "_store_tempdata";
        let updatetimeKey = name + "_updatetime_tempdata";
        let updatetime = GameStorage.getInt(updatetimeKey, this.getTimeStamp());
        // console.log("updatetime", updatetime);

        let loadLocal = () => {
        }

        loadLocal();

        return;
        Request2.getApp().open('setJsonStr', {}, res => {
            _LOG("getJsonStr" + "__" + name, res);

            let { data, code } = res;
            if (code === 0) {
                _LOG("没有远程配置数据：" + name);
                loadLocal();
            } else {
                if (code === 1) {
                    _LOG("有远程配置数据：" + name);
                    GameStorage.setInt(updatetimeKey, data.updatetime);
                    GameStorage.setJson(storeConfigName, data.res);
                    Global.localConfig[name] = data.res;
                } else if (code === 2) {
                    _LOG("有远程配置数据,但不需要更新：" + name);
                    let config = GameStorage.getJson(storeConfigName, null);
                    _LOG("读取本地缓存配置" + name, config);
                    if (config) {
                        Global.localConfig[name] = config;
                    } else {
                        loadLocal();
                    }
                }
            }
            if (cb) cb(Global.localConfig[name]);
        })

        return;

        let getJsonStrData = {
            name,
            updatetime,
        }
        Http.request_post("getconfig", getJsonStrData, res => {
            let { data, state } = res;
            _LOG("getconfig" + "__" + name, res);
            if (state === 3) {
                _LOG("没有远程配置数据：" + name);
                loadLocal();
            } else {
                if (state === 1) {
                    _LOG("有远程配置数据：" + name);
                    GameStorage.setInt(updatetimeKey, data.updatetime);
                    GameStorage.setJson(storeConfigName, data.res);
                    Global.localConfig[name] = data.res;
                } else if (state === 2) {
                    _LOG("有远程配置数据,但不需要更新：" + name);
                    let config = GameStorage.getJson(storeConfigName, null);
                    _LOG("读取本地缓存配置" + name, config);
                    if (config) {
                        Global.localConfig[name] = config;
                    } else {
                        loadLocal();
                    }
                }
            }
            if (cb) cb(Global.localConfig[name]);
        }, err => {
            // console.error("getconfig error");
        })
    }

    public loadLocalConfig(name: string, cb?: (data) => void) {
        resLoader.loadRes("data/" + name, cc.JsonAsset, (err, jsonAsset: cc.JsonAsset) => {
            if (cb) cb(jsonAsset.json);
            Global.localConfig[name] = jsonAsset.json;
        })
    }


    public getLocalConfigData(configName: string, key: string) {
        if (!Global.localConfig[configName]) return;

        let data = null;
        for (let i = 0; i < Global.localConfig[configName].length; i++) {
            const element = Global.localConfig[configName][i];
            if (element?.key == key) {
                data = element;
                break;
            }
        }
        return data;
    }

    public getLocalConfigValue(configName: string, key: string) {
        let data = this.getLocalConfigData(configName, key);
        return data?.value;
    }

    public checkMoney(num, callback) {
        _LOG("检查钞票数:", num);
        num = Number(num);
        let money = GameStorage.getInt(STORAGE_KEY.GAME_MONEY, 0);
        if (isNaN(num)) {
            return;
        }
        if (num <= money) {
            if (callback) {
                callback();
            }
        } else {
            uiManager.open(UIID.Toast, {
                title: "钞票数不足！"
            })
        }
    }

    public checkRedPack(num, callback) {
        _LOG("检查红包数:", num);
        num = Number(num);
        let redpack = GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK, 0);
        if (isNaN(num)) {
            return;
        }
        if (num <= redpack) {
            if (callback) {
                callback();
            }
        } else {
            uiManager.open(UIID.Toast, {
                title: "红包数数不足！"
            })
        }
    }

    public addMoney(num, callback) {
        _LOG("增加钞票数:", num);
        num = Number(num);
        let money = GameStorage.getInt(STORAGE_KEY.GAME_MONEY, 0);
        money += num;
        if (isNaN(money)) {
            return;
        }
        GameStorage.setInt(STORAGE_KEY.GAME_MONEY, money);
        if (callback) {
            callback();
        }
    }

    public addRedPack(num, callback) {
        _LOG("增加红包数:", num);
        num = Number(num);
        let redpack = GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK, 0);
        redpack += num;
        if (isNaN(redpack)) {
            return;
        }
        GameStorage.setInt(STORAGE_KEY.GAME_RED_PACK, redpack);
        if (callback) {
            callback();
        }

        // Http.request_post("addmoney", {
        //     userid: Global.userid,
        //     num
        // }, res => {
        //     _LOG("增加红包数上传服务器:", res);
        // }, err => {
        // })
    }

    public subMoney(num, callback) {
        _LOG("减少钞票数:", num);
        this.checkMoney(num, () => {
            num = Number(num);
            let money = GameStorage.getInt(STORAGE_KEY.GAME_MONEY, 0);
            if (money <= 0) {
                return;
            }
            money -= num;
            if (isNaN(money)) {
                return;
            }
            GameStorage.setInt(STORAGE_KEY.GAME_MONEY, money);
            if (callback) {
                callback();
            }
        })
    }

    public subRedpack(num, callback) {
        _LOG("减少红包数:", num);
        this.checkRedPack(num, () => {
            num = Number(num);
            let redpack = GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK, 0);
            if (redpack <= 0) {
                return;
            }
            redpack -= num;
            if (isNaN(redpack)) {
                return;
            }
            GameStorage.setInt(STORAGE_KEY.GAME_RED_PACK, redpack);
            if (callback) {
                callback();
            }
        })
    }

    public findRedPack() {
        return GameStorage.getInt(STORAGE_KEY.GAME_RED_PACK, 0);
    }

    public unlockTable(id) {
        let unlockTables: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES, []);
        if (!unlockTables.includes(id)) {
            unlockTables.push(id);
            GameStorage.setJson(STORAGE_KEY.UN_LOCK_TABLES, unlockTables);
        }
    }

    public useTable(type, id) {
        let useTable: number[] = GameStorage.getJson(STORAGE_KEY.USE_TABLE, []);
        useTable[type] = id;
        GameStorage.setJson(STORAGE_KEY.USE_TABLE, useTable);
    }

    public unlockDecoration(id) {
        let unDecoration: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []);
        if (!unDecoration.includes(id)) {
            unDecoration.push(id);
            GameStorage.setJson(STORAGE_KEY.UN_LOCK_DECORATION, unDecoration);
        }
    }

    public findTableById(id) {
        let Table: any[] = Global.localConfig[LOCAL_CONFIG.Table];
        for (let i = 0; i < Table.length; i++) {
            const element = Table[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public findUnlockTableById(id) {
        for (let i = 0; i < Global.unlockTables.length; i++) {
            const element = Global.unlockTables[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public findDecorationsById(id) {
        let DecorationUpgradeConfig: any[] = Global.localConfig[LOCAL_CONFIG.DecorationUpgradeConfig];
        for (let i = 0; i < DecorationUpgradeConfig.length; i++) {
            const element = DecorationUpgradeConfig[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public findUnlockDecorationsById(id) {
        for (let i = 0; i < Global.unlockDecoration.length; i++) {
            const element = Global.unlockDecoration[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public useDecoration(type, id) {
        let useDecoration: number[] = GameStorage.getJson(STORAGE_KEY.USE_DECORATION, []);
        useDecoration[type] = id;
        GameStorage.setJson(STORAGE_KEY.USE_DECORATION, useDecoration);
    }

    private foodMaxLvl = 2;
    public unlockFood(id) {
        let unlockFoods: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS, []);
        if (!unlockFoods.includes(id)) {
            unlockFoods.push(id);
            GameStorage.setJson(STORAGE_KEY.UN_LOCK_FOODS, unlockFoods);
            this.upgradeFood(id);
        }
    }

    public upgradeFood(id) {
        let upgradeFood: number[] = GameStorage.getJson(STORAGE_KEY.FOOD_LEVEL, {});
        let lvl = this.findFoodLvl(id);
        lvl += 1;
        if (lvl >= this.foodMaxLvl) {
            lvl = this.foodMaxLvl;
        }
        upgradeFood[id] = lvl;
        GameStorage.setJson(STORAGE_KEY.FOOD_LEVEL, upgradeFood);
    }

    public findFoodLvl(id) {
        let upgradeFood: number[] = GameStorage.getJson(STORAGE_KEY.FOOD_LEVEL, {});
        if (!upgradeFood[id]) {
            upgradeFood[id] = 0;
        }
        return upgradeFood[id]
    }

    public findFoodById(id) {
        let FoodConfig: any[] = Global.localConfig[LOCAL_CONFIG.FoodConfig];
        for (let i = 0; i < FoodConfig.length; i++) {
            const element = FoodConfig[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public findFoodUpgradeData(id, lvl) {
        let data = null;
        let FoodUpgradeConfig: any[] = Global.localConfig[LOCAL_CONFIG.FoodUpgradeConfig];
        FoodUpgradeConfig.forEach(fuc => {
            if (fuc.foodId == id && fuc.level == lvl) {
                data = fuc;
            }
        })
        return data;
    }

    public formatFoods() {
        let foodconfig: any[] = Global.localConfig[LOCAL_CONFIG.FoodConfig];
        let unlockFoods: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_FOODS, []);
        let upgradeFood: number[] = GameStorage.getJson(STORAGE_KEY.FOOD_LEVEL, []);

        for (let i = 0; i < foodconfig.length; i++) {
            let food = foodconfig[i];
            let lvl = upgradeFood[food.id] || 0;

            if (unlockFoods.includes(food.id)) {
                food["unlock"] = true;
                food["canUpgrade"] = lvl < this.foodMaxLvl ? true : false;
                if (!food["canUpgrade"]) {
                    food["upgradeData"] = this.findFoodUpgradeData(food.id, 2);
                } else {
                    food["lastUpgradeData"] = this.findFoodUpgradeData(food.id, 1);
                    food["upgradeData"] = this.findFoodUpgradeData(food.id, 2);
                }
            } else {
                food["unlock"] = false;
                food["upgradeData"] = this.findFoodUpgradeData(food.id, 1);
            }

        }

        let _data = []
        for (let i = 0; i < foodconfig.length; i += 4) {
            let item = foodconfig.slice(i, i + 4);
            if (i == 0) {
                for (let j = 0; j < item.length; j++) {
                    let food = item[j];
                    if (!food["unlock"]) {
                        food["showBuy"] = true;
                    }
                }
            }
            _data.push(item);
        }
        for (let i = 1; i < _data.length; i++) {
            let item = _data[i];
            let lastItem = _data[i - 1];
            if (lastItem[lastItem.length - 1]["unlock"]) {
                for (let j = 0; j < item.length; j++) {
                    let food = item[j];
                    if (!food["unlock"]) {
                        food["showBuy"] = true;
                    }
                }
            }
        }
        return _data;
    }

    private cookWomanMaxLvl = 10;
    public unlockCookWoman(id) {
        let unlockCookWoman: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_COOK_WOMAN, []);
        if (!unlockCookWoman.includes(id)) {
            unlockCookWoman.push(id);
            GameStorage.setJson(STORAGE_KEY.UN_LOCK_COOK_WOMAN, unlockCookWoman);
            this.upgradeCookWoman(id);
        }
    }

    public upgradeCookWoman(id) {
        let upgradeCookWoman: number[] = GameStorage.getJson(STORAGE_KEY.COOK_WOMAN_LEVEL, {});
        let lvl = this.findCookWomanLvl(id);
        lvl += 1;
        if (lvl >= this.cookWomanMaxLvl) {
            lvl = this.cookWomanMaxLvl;
        }
        upgradeCookWoman[id] = lvl;
        GameStorage.setJson(STORAGE_KEY.COOK_WOMAN_LEVEL, upgradeCookWoman);
    }

    public formatCookWoman() {
        let People = Global.localConfig[LOCAL_CONFIG.People];
        let unlockCookWomans: number[] = GameStorage.getJson(STORAGE_KEY.UN_LOCK_COOK_WOMAN);
        let upgradeCookWoman: number[] = GameStorage.getJson(STORAGE_KEY.COOK_WOMAN_LEVEL, {});

        let cookWomans = [];
        for (let i = 1; i < 5; i++) {
            let cookWoman = People[i];
            let lvl = upgradeCookWoman[cookWoman.id] || 1;

            cookWoman["upgradeData"] = this.findCookWomanUpgradeData(cookWoman.id, lvl);
            cookWoman["lastUpgradeData"] = this.findCookWomanUpgradeData(cookWoman.id, lvl);
            cookWoman["lvl"] = lvl;

            if (unlockCookWomans.includes(cookWoman.id)) {
                cookWoman["unlock"] = true;
                cookWoman["canUpgrade"] = lvl < this.cookWomanMaxLvl ? true : false;
                if (cookWoman["canUpgrade"]) {
                    cookWoman["upgradeData"] = this.findCookWomanUpgradeData(cookWoman.id, lvl + 1);
                }
            } else {
                cookWoman["unlock"] = false;
            }

            cookWomans.push(cookWoman);
        }
        return cookWomans;
    }

    public findCookWomanById(id) {
        let People: any[] = Global.localConfig[LOCAL_CONFIG.People];
        for (let i = 0; i < People.length; i++) {
            const element = People[i];
            if (element.id == id) {
                return element;
            }
        }
        return null;
    }

    public findCookWomanUpgradeData(id, lvl) {
        let data = null;
        let CookWomanUpgradeConfig: any[] = Global.localConfig[LOCAL_CONFIG.CookWomanUpgradeConfig];
        CookWomanUpgradeConfig.forEach(cuc => {
            if (cuc.cookWomanId == id && cuc.level == lvl) {
                data = cuc;
            }
        })
        return data;
    }

    public findCookWomanLvl(id) {
        let upgradeCookWoman: number[] = GameStorage.getJson(STORAGE_KEY.COOK_WOMAN_LEVEL, {});
        if (!upgradeCookWoman[id]) {
            upgradeCookWoman[id] = 0;
        }
        return upgradeCookWoman[id]
    }

    public getIncomeLimit() {
        let useTable = GameStorage.getJson(STORAGE_KEY.USE_TABLE, []);
        let tables = Global.localConfig[LOCAL_CONFIG.Table]
        let barId = useTable[0];
        if (barId) {
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                if (table.id == barId) {
                    return table.barMaxProfit || 0;
                }
            }
        }
        return 0;
    }

    public maxUnlockTable(arr: number[], total: number) {
        let maxArr = [];
        for (let i = 1; i <= total; i++) {
            let max = 0;
            for (let j = 1; j <= 10; j++) {
                let num = i * 10 + j;
                if (arr.includes(num) && num > max) {
                    max = num;
                }
            }
            if (max > 0) {
                maxArr.push(max);
            }
        }
        return maxArr;
    }

    public maxUnlockDecoration(arr: number[], total: number) {
        let maxArr = [];
        for (let i = 0; i <= total; i++) {
            let max = 0;
            for (let j = 1; j <= 10; j++) {
                let num = i * 10 + j;
                if (arr.includes(num) && num > max) {
                    max = num;
                }
            }
            if (max > 0) {
                maxArr.push(max);
            }
        }
        return maxArr;
    }

    public getPerSeconIncome() {
        let income = 0;
        let unlockTables = GameStorage.getJson(STORAGE_KEY.UN_LOCK_TABLES, []);
        let maxTableArr = this.maxUnlockTable(unlockTables, 6);
        maxTableArr.forEach(id => {
            let unlockTable = this.findUnlockTableById(id);
            if (unlockTable) {
                let tipAdd = unlockTable.tipAdd || 0;
                income += tipAdd;
            }
        })
        let unlockDecorations = GameStorage.getJson(STORAGE_KEY.UN_LOCK_DECORATION, []);
        let maxDecorationArr = this.maxUnlockDecoration(unlockDecorations, 5);
        maxDecorationArr.forEach(id => {
            let unlockDecoration = this.findUnlockDecorationsById(id);
            if (unlockDecoration) {
                let tipAdd = unlockDecoration.tipAdd || 0;
                income += tipAdd;
            }
        })

        // _LOG("每秒收入", income);
        return income;
    }

    public getTeshukerenConfig(idx: number) {
        let config = Global.localConfig[LOCAL_CONFIG.SpecialPeopleShopLevelConfig];
        if (!config) return;

        let _keys = ["keren_1", "keren_2", "keren_3"];

        let _config = null;
        for (let i = 0; i < config.length; i++) {
            const element = config[i];
            let _lvl = Global.shopLevel || 1;
            if (element["pictureName"] == _keys[idx] && element["shopLevel"] == _lvl) {
                _config = element;
            }
        }
        return _config;
    }

    public getOfflineConfig() {
        let config: any = Global.localConfig[LOCAL_CONFIG.ShopLevelOffline];
        if (!config) return;

        let _config = null;
        for (let i = 0; i < config.length; i++) {
            const element = config[i];
            if (element.id == Global.shopLevel) {
                _config = element;
                break;
            }
        }

        return _config;
    }

    public getYuanByWan(num: number) {
        return (num / 10000).toFixed(2) + "元"
    }

    public closeEvent(that) {
        Audioplayer.play_sound("btn_click");
        uiManager.close(that);
    }

    public showToast(text: string) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showToast", "(Ljava/lang/String;)V", text);
        } else {
            uiManager.open(UIID.Toast, {
                title: text,
            })
        }
    }

    public nowStr(){
        let now = new Date();
        return now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    }

    public randomUserName() {
        let userNamea = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
            "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
            "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
            "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章",
            "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦",
            "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳",
            "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺",
            "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常",
            "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余",
            "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹", "欧阳", "百万", "刘", "习", "除"
        ],
            userNameb = ["子璇", "淼淼", "国栋", "夫子", "瑞堂", "甜", "敏", "尚", "国贤", "贺祥", "晨涛",
                "昊轩", "易轩", "益辰", "益帆", "益冉", "瑾春", "瑾昆", "春齐", "杨", "文昊",
                "东东", "雄霖", "浩晨", "熙涵", "溶溶", "冰枫", "欣欣", "宜豪", "欣慧", "建政",
                "美欣", "淑慧", "文轩", "文杰", "欣源", "忠林", "榕润", "欣汝", "慧嘉", "新建",
                "建林", "亦菲", "林尼", "冰洁", "佳欣", "涵涵", "禹辰", "淳美", "泽惠", "伟洋",
                "涵越", "润丽", "翔龙", "淑华", "晶莹", "凌晶", "苒溪", "雨涵", "嘉怡", "佳毅",
                "子辰", "佳琪", "紫轩", "瑞辰", "昕蕊", "萌", "明远", "欣宜", "泽远", "欣怡",
                "佳怡", "佳惠", "晨茜", "晨璐", "运昊", "汝鑫", "淑君", "晶滢", "润莎", "榕汕",
                "佳钰", "佳玉", "晓庆", "一鸣", "语晨", "添池", "添昊", "雨泽", "雅晗", "雅涵",
                "清妍", "诗悦", "嘉乐", "晨涵", "天赫", "玥傲", "佳昊", "天昊", "萌萌", "若萌", "华", "明", "World", "coco"
            ],
            useNameC = ["JouleBlanche", "MarkMoore", "Hume", "Bevis", "BerthaElvira", "WalterWarner", "O'ConnorGreg", "LyndAnn", "LowellWard", "Isaiah", "Jo", "BackCleveland", "TomAndre", "LouiseAlvin", "WilliamSandy", "RockefellerBoyce", "Page", "MaxwellOmar", "RobinsonMag", "GreyRod", "EdieHilda", "GuntherMandy", "Vaughan", "Ada", "AdelaGloria", "RobbinsDolores", "VirginiaAlexander", "EleanorPenelope", "HooverJoanne", "Eliot", "Christian", "MeredithAnsel", "WinifredLuther", "ConnieOliver", "BirrellHedy", "LuciusCarey", "Austin", "Phil", "MurrayMandel", "Lucien", "PerkinReg", "IsabelSebastian", "KelloggHyman", "Arabella", "Robert", "Carl", "Scott", "Tom", "Eddy", "Kris", "Peter", "Johnson", "Bruce", "Robert", "Peter", "Bill", "Joseph", "John", "Nick", "Walt", "John", "Mark", "Sam", "Davis", "Neil", "Carl", "Lewis", "Billy", "Charles", "Mark", "Bill", "Vincent", "William", "Joseph", " James", "Henry", "Gary", " Martin", "Malcolm ", "Joan", "Niki", "Betty", "Linda", "Whitney", "Lily Barbara", "Elizabeth", "Helen", "Katharine", "Lee", "Ann", "Diana", "Fiona", " Bob", "John", "Thomas", "Dean", "Paul", "Jack", "Brooke", "Elizabeth", "Kelly", "May", "Julie", "Amanda", "Fiona"];

        let random = parseInt(Math.random() * (100 - 1) + 1),
            name = parseInt(Math.random() * (105 - 0) + 0),
            name2 = parseInt(Math.random() * (105 - 0) + 0),
            thisName = "";
        if (random > 20 && random <= 40) {
            thisName = userNamea[name] + userNameb[name2];
        } else if (random > 40 && random <= 60) {
            thisName = useNameC[name];
        } else if (random > 60 && random <= 70) {
            thisName = userNamea[name] + useNameC[name2];
        } else if (random > 70 && random <= 80) {
            let nameHou = ["~", "^*", "w┻┳|･ω･", "#", "+——", "❤", "☆"];
            thisName = userNamea[name] + useNameC[name2] + nameHou[parseInt(Math.random() * (8 - 0) + 0)];
        } else if (random > 80 && random < 100) {
            let nameddd = userNameb[name2].split(""),
                nameccc = '';
            if (nameddd.length > 1) {
                let namedddN = parseInt(Math.random() * (2 - 0) + 0)
                nameccc = nameddd[namedddN];
            } else nameccc = nameddd[0];

            thisName = userNamea[name] + nameccc;
        } else {
            thisName = useNameC[name] + userNamea[name2];
        }
        // console.log(thisName);
        // setTimeout(() => {
        //     randomUserName();
        // }, 1000)
        return thisName;
    }

}



export default Utils.inst
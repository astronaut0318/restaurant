
const { ccclass, property } = cc._decorator;

export const enum HotUpdateCode {
    NEED_TO_UPDATE = 0,//需要更新
    ALREADY_UP_TO_DATE = 1,//已经更新
    CHECK_UPDATE_ERROR = 2,//检查更新出错
    HOT_UPDATE_ERROR = 3,   //下载更新错误
    HOT_UPDATE_FAIL = 4,    //下载更新失败，重新下载
    HOT_MANIFEST_ERROR = 5, //更新配置出错
}

@ccclass
export class HotUpdateMgr extends cc.Component {

    @property({
        type: cc.Asset,
    })
    manifestUrl: cc.Asset = null;

    @property(cc.Label)
    hotUpdateDesc: cc.Label = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Label)
    percentText: cc.Label = null;

    private _storagePath: string = "";//本地缓存路径
    private _am: any;
    private _updating: boolean = false;
    private _canRetry: boolean = false;
    onLoad() {

    }

    start() {

    }

    init() {
        if (!cc.sys.isNative) {
            return;
        }
        this._updating = false;
        this._canRetry = false;
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'thegun-remote-asset');
        console.log("HotUpdate init", this._storagePath);
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);
        if (!this._am) return;
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._am.setMaxConcurrentTask(2);
        }

        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            // let data = jsb.fileUtils.getDataFromFile(path);
            let localmd5 = null;
            console.log("verify", localmd5, path, relativePath, expectedMD5);
            if (compressed) {
                return true;
            }
            else {
                return true;
            }
            // if (localmd5.toString() == expectedMD5) {
            //     return true;
            // } else return false;

        });
    }

    // update (dt) {}

    /**
     * 比较版本号大小，看是否需要更新
     * @param versionA 版本号A
     * @param versionB 版本号B
     */
    public versionCompareHandle(versionA, versionB) {
        console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
        var vA = versionA.split('.');
        var vB = versionB.split('.');
        for (var i = 0; i < vA.length; ++i) {
            var a = parseInt(vA[i]);
            var b = parseInt(vB[i] || 0);
            if (a === b) {
                continue;
            }
            else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        }
        else {
            return 0;
        }
    };

    public getLocalVersion() {
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            return "";
        }
        return this._am.getLocalManifest().getVersion() || "";
    }

    private _checkUpdateCb: Function = null;
    public checkUpdate(checkCb?: Function) {
        this._checkUpdateCb = checkCb;
        if (this._updating) {
            return false;
        }
        if (!this._am) return false;
        console.log("HotUpdate checkUpdate");
        this.hotUpdateDesc.string = "检查更新中...";
        console.log("HotUpdate checkUpdate", this._am.getState(), jsb.AssetsManager.State.UNINITED);
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            let url = this.manifestUrl.nativeUrl;
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            console.log("HotUpdate checkUpdate", url);
            this._am.loadLocalManifest(url);
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            checkCb && checkCb(HotUpdateCode.ALREADY_UP_TO_DATE);
            return false;
        }
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
        this._updating = true;
        console.log("HotUpdate checkUpdate true");
        return true;
    }

    public checkCb(event) {
        console.log('HotUpdate checkCb Code: ' + event.getEventCode());
        let isneedupdate: boolean = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST) {
                    console.log("----------" + "ERROR_NO_LOCAL_MANIFEST");
                }
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST) {
                    console.log("----------" + "ERROR_DOWNLOAD_MANIFEST");
                }
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_PARSE_MANIFEST) {
                    console.log("----------" + "ERROR_PARSE_MANIFEST");
                }
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.CHECK_UPDATE_ERROR);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                if (event.getEventCode() == jsb.EventAssetsManager.ALREADY_UP_TO_DATE) {
                    console.log("----------" + "ALREADY_UP_TO_DATE");
                }
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.ALREADY_UP_TO_DATE)
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                if (event.getEventCode() == jsb.EventAssetsManager.NEW_VERSION_FOUND) {
                    console.log("----------" + "NEW_VERSION_FOUND");
                }
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.NEED_TO_UPDATE);
                isneedupdate = true;
                break;
            default:
                return;
        }
        this._updating = false;
        if (isneedupdate) {
            this.hotUpdate();
        } else {
            this._am.setEventCallback(null);
        }
    }

    private _failCount = 0;
    public hotUpdate() {
        console.log("HotUpdate hotUpdate");
        if (this._am && !this._updating) {
            this._am.setEventCallback(this.updateCb.bind(this));
            console.log("HotUpdate hotUpdate", this._am.getState());
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                // Resolve md5 url
                var url = this.manifestUrl.nativeUrl;
                if (cc.loader.md5Pipe) {
                    url = cc.loader.md5Pipe.transformURL(url);
                }
                this._am.loadLocalManifest(url);
            }

            this._failCount = 0;
            this._am.update();
            this._updating = true;
        }
    }

    private _getStringPercent(curPer) {
        let kb = curPer / 1024;
        if (kb >= 1) {
            // let mb = kb / 1024;
            // if (mb >= 1) {
            // return mb.toFixed(1) + "mb";
            // } else {
            return kb.toFixed(1) + "kb";
            // }
        } else {
            return curPer + "b";
        }
    }
    public updateCb(event) {
        console.log("HotUpdate updateCb", event.getEventCode());
        let needRestart = false;
        let failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST) {
                    console.log("----------updateCb" + "ERROR_NO_LOCAL_MANIFEST");
                }
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.HOT_UPDATE_ERROR);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                if (event.getEventCode() == jsb.EventAssetsManager.UPDATE_PROGRESSION) {
                    console.log("----------updateCb" + "UPDATE_PROGRESSION");
                }
                let percent = event.getPercent();
                if (percent) {
                    this.progress.progress = percent;
                    this.percentText.string = (percent * 100).toFixed(1) + "%";
                }
                this.hotUpdateDesc.string = "正在下载:" + this._getStringPercent(event.getDownloadedBytes()) + ' / ' + this._getStringPercent(event.getTotalBytes());

                var msg = event.getMessage();
                if (msg) {
                    // this.panel.info.string = 'Updated file: ' + msg;
                    console.log(event.getPercent() * 100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST) {
                    console.log("----------updateCb" + "ERROR_DOWNLOAD_MANIFEST");
                }
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_PARSE_MANIFEST) {
                    console.log("----------updateCb" + "ERROR_PARSE_MANIFEST");
                }
                this.hotUpdateDesc.string = "更新配置出错";
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.HOT_MANIFEST_ERROR);
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                if (event.getEventCode() == jsb.EventAssetsManager.ALREADY_UP_TO_DATE) {
                    console.log("----------updateCb" + "ALREADY_UP_TO_DATE");
                }
                this.hotUpdateDesc.string = "";
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.ALREADY_UP_TO_DATE);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                if (event.getEventCode() == jsb.EventAssetsManager.UPDATE_FINISHED) {
                    console.log("----------updateCb" + "UPDATE_FINISHED");
                }
                this.hotUpdateDesc.string = "更新完成,即将重启!";
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                if (event.getEventCode() == jsb.EventAssetsManager.UPDATE_FAILED) {
                    console.log("----------updateCb" + "UPDATE_FAILED");
                }
                this.hotUpdateDesc.string = "update failed. " + event.getMessage();
                this._updating = false;
                this._canRetry = true;
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.HOT_UPDATE_FAIL);
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_UPDATING) {
                    console.log("----------updateCb" + "ERROR_UPDATING");
                }
                this.hotUpdateDesc.string = "Asset update error: " + event.getMessage();
                failed = true;
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.HOT_UPDATE_ERROR);
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                if (event.getEventCode() == jsb.EventAssetsManager.ERROR_DECOMPRESS) {
                    console.log("----------updateCb" + "ERROR_DECOMPRESS");
                }
                this._updating = false;
                this._canRetry = true;
                this._checkUpdateCb && this._checkUpdateCb(HotUpdateCode.HOT_UPDATE_FAIL);
                this.hotUpdateDesc.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null);
            this._updating = false;
        }

        if (needRestart) {
            this._am.setEventCallback(null);
            // Prepend the manifest's search path

            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    }

    public retry() {
        if (!this._updating && this._canRetry) {
            this._canRetry = false;
            this._am.downloadFailedAssets();
        }
    }
}

export function getDataFromFile(path: any) {
    throw new Error("Function not implemented.");
}


// import ResLoader, { resLoader, CompletedCallback, ProcessCallback } from "./ResLoader";

// /**
//  * ResPool，可提高资源缓存的效率，
//  * 当超过警戒水位时，每次加载新的资源都会自动检查可释放的资源进行释放
//  * 也可以手动调用releaseUnuseRes，自动释放可释放的资源
//  * 
//  */

// export class ResPool {
//     private _assets: cc.Asset[] = [];
//     private _waterMark: number = 32;

//     /**
//      * 开始加载资源
//      * @param url           资源url
//      * @param type          资源类型，默认为null
//      * @param onProgess     加载进度回调
//      * @param onCompleted   加载完成回调
//      * @param use           资源使用key，根据makeUseKey方法生成
//      */
//     public loadRes(url: string, use?: string);
//     public loadRes(url: string, onCompleted: CompletedCallback, use?: string);
//     public loadRes(url: string, onProgess: ProcessCallback, onCompleted: CompletedCallback, use?: string);
//     public loadRes(url: string, type: typeof cc.Asset, use?: string);
//     public loadRes(url: string, type: typeof cc.Asset, onCompleted: CompletedCallback, use?: string);
//     public loadRes(url: string, type: typeof cc.Asset, onProgess: ProcessCallback, onCompleted: CompletedCallback, use?: string);
//     public loadRes() {
//         this.autoCheck();
//         let resArgs: LoadResArgs = ResLoader.makeLoadResArgs.apply(this, arguments);
//         let SaveCompleted = resArgs.onCompleted;
//         resArgs.onCompleted = (error: Error, resource: cc.Asset) => {
//             if (!error && resource) {
//                 this.addNewResUrl(resource);
//             }
//             if (SaveCompleted) {
//                 SaveCompleted(error, resource);
//             }
//         };
//     }

//     /**
//      * 设置监控水位
//      * @param waterMakr 水位
//      */
//     public setWaterMark(waterMakr: number) {
//         this._waterMark = waterMakr;
//     }

//     /**
//      * 是否缓存了某url（这里的url为resloader的_resMap的key，可能不等于加载的url）
//      * @param url 
//      */
//     public hasResUrl(url: string) : boolean {
//         for (let i = 0; i < this._assets.length; ++i) {
//             if (url == this._assets[i]) {
//                 return true;
//             }
//         }
//         return false;
//     }

//     /**
//      * 加载完成后添加一个use
//      * @param url 
//      */
//     private addNewResUrl(url: string) {
//         if (!this.hasResUrl(url) && resLoader.addUse(url, this._useKey)) {
//             this._assets[this._assets.length] = url;
//         }
//     }

//     /**
//      * 自动检测是否需要释放资源，需要则自动释放资源
//      */
//     public autoCheck() {
//         if (this._assets.length > this._waterMark) {
//             this.autoReleaseUnuseRes();
//         }
//     }

//     /**
//      * 自动释放资源
//      */
//     public autoReleaseUnuseRes() {
//         for (let i = this._assets.length; i >= 0; --i) {
//             if (resLoader.canRelease(this._assets[i].re)) {
//                 resLoader.releaseAsset(this._assets[i]);
//                 this._assets.splice(i, 1);
//             }
//         }
//     }

//     /**
//      * 清空该ResPool
//      */
//     public destroy() {
//         for (let i = this._assets.length; i >= 0; --i) {
//             resLoader.releaseAsset(this._assets[i]);
//         }
//         this._assets.length = 0;
//     }
// }

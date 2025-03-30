import { Global } from "./Global";

let getDateSuffix = () => {
    let date = new Date();
    return date.getFullYear() + "" + date.getMonth() + "" + date.getDate();
}

export const DEBUG = !CC_DEBUG;

export const STORAGE_PREFIX = ""

/* 用户数据 */
export const STORAGE_KEY = {
    MUSIC_MUTE: "music_mute",  //静音
    SOUND_VOL: "sound_vol", // 音量大小
    MUSIC_VOL: "music_vol", // 音量大小

    GAME_TIME: "game_time", // 每次今日游戏时间
    GAME_MONEY: "game_money", //游戏货币
    GAME_RED_PACK: "game_red_packet", //红包
    SHOP_INCOME: "income", // 吧台收益
    AUTO_FUWU_OPEN: "auto_service_open", // 自动服务开启
    AUTO_FUWU_TIME: "auto_service_time", // 自动服务剩余时间
    CHIHUOJIE_OPEN: "foodie_festival_open", // 吃货节开启
    CHIHUOJIE_TIME: "foodie_festival_time", // 吃货节剩余时间
    FUWU_COUNT: "table_service_count", // 桌子服务次数
    // OFFLINE_COUNT: Global.uuid + "OFFLINE_COUNT" + getDateSuffix(),
    // AUTO_FUWU_COUNT: Global.uuid + "AUTO_FUWU_COUNT" + getDateSuffix(),
    // SHOW_SHOP_START: Global.uuid + "SHOW_SHOP_START" + getDateSuffix(),
    SHOW_SHOP_START: "show_shop_start", // 每日饭店天数是否显示

    UN_LOCK_FOODS: "un_lock_foods", //解锁食物列表
    FOOD_LEVEL: "food_level", // 解锁的食物对应等级
    UN_LOCK_TABLES: "un_lock_tables", //解锁桌子数
    USE_TABLE: "use_table", //使用的桌子数
    UN_LOCK_DECORATION: "un_lock_decoration", //解锁装饰
    USE_DECORATION: "use_decoration", //使用装饰
    UN_LOCK_COOK_WOMAN: "un_lock_cook_woman", //解锁厨娘
    COOK_WOMAN_LEVEL: "cook_woman_level", //厨娘等级
    NOW_TASK_GUIDE: "now_task_guide", //当前引导任务进度
    NOW_SHOP_LEVEL: "now_shop_level", //当前饭店等级
    SERVICE_COUNT: "service_count", //桌子用餐次数 ???
    // EVERY_DAY_SERVICE_COUNT: "EVERY_DAY_SERVICE_COUNT" + getDateSuffix(),
    EVERY_DAY_SERVICE_COUNT: "every_day_service_count", //每日自动服务 有限制
    TASK_GUIDE_QUIK: "task_guide_quick",  //快速揽客任务计数
    // EVERY_DAY_TASK_QUIK: "EVERY_DAY_TASK_QUIK" + getDateSuffix(),
    TASK_GUIDE_DOUBLE_INCOME: "foodie_festival_count", //吃货节次数
    CLOCK_MAKING_MONEY_CNT: "clock_making_money_count", //打卡赚钱次数
    LOGIN_DAY: "login_day", // 当日登录次数
    GET_CLOCK_MAKING_MONEY: "get_clock_making_money", //打卡赚钱 ???
    TASK_GUIDE_AUTO_SERVICE: "task_guide_auto_service", //自动服务任务计数
    ACHEVEMENT_GETED: "achievement_geted", //成就列表
    // EVERY_DAY_TASK_GETED: "EVERY_DAY_TASK_GETED" + getDateSuffix(),
    LOOK_VIDEO: "look_video", //看视频次数
    // EVERY_DAY_LOOK_VIDEO: "EVERY_DAY_LOOK_VIDEO" + getDateSuffix(),
    EVERY_DAY_LOOK_VIDEO: "every_day_look_video", //看视频每日详情
    // EVERY_DAY_TUHAO: "EVERY_DAY_TUHAO" + getDateSuffix(),
    EVERY_DAY_TUHAO: "every_day_tuhao", //每日土豪数量
    // EVERY_DAY_GET_INCOME: "EVERY_DAY_GET_INCOME" + getDateSuffix(),
    SHOP_LEVEL_REWARD_GETED: "shop_level_reward_geted", //饭店奖励等级
    SHOP_START_DAY_NUMBER: "shop_start_day_number", //饭店开张天数

    All_DAY_TEMP: "all_day_temp",  //每日新增的数据

    GET_W_D_BY_LVL: "get_w_d_by_lvl", //无限制提现通过等级
    GET_W_D_ONCE: "get_w_d_once",  // 仅一次提现通过等级
    GET_W_D_SHARE: "get_w_d_share", //分享提现通过等级
}

export const All_DAY_TEMP = {
    every_day_task_geted: "every_day_task_geted" + getDateSuffix(),
    every_day_task_quik: "every_day_task_quik" + getDateSuffix(),
    every_day_get_income: "every_day_get_income" + getDateSuffix(),
    every_day_tuhao: "every_day_tuhao" + getDateSuffix(), //
    every_day_look_viedo: "every_day_look_viedo" + getDateSuffix(), //
    every_day_service_count: "every_day_service_count" + getDateSuffix(),//
    show_shop_start: "show_shop_start" + getDateSuffix(),//
    auto_service_count: "auto_service_count" + getDateSuffix(),
    offline_count: "offline_count" + getDateSuffix(),
}

export const RESULT_CODE = {
    SUCCESS: 200,
}

export enum REMOTE_ASSETS_NAME {
    // HALL_BG = "wz_hall_bg-png",
}

export interface assetsData {
    name: string,
    pngAsset: cc.Texture2D,
    texAsset?: any,
    skeAsset?: any,
}

export const REMOTE_ASSET_TYPE = {
    PNG: "png",
    JPG: "jpg",
    PLIST: "plist",
    DRAGONBONE: "dragonbone"
}

export let remote_assets: assetsData[] = []

export let cc_game_config = {
    GameDomain: "",
}

export const EVENT_TAG = {
    ENTER_HALL: "ENTER_HALL",
    ADD_FLY_MONEY: "ADD_FLY_MONEY",
    ADD_MONEY: "ADD_MONEY",
    SUB_MONEY: "SUB_MONEY",
    ADD_FLY_RED_PACK: "ADD_FLY_RED_PACK",
    SUB_HONGBAO: "SUB_HONGBAO",
    UPDATE_UNLOCK_FOODS: "UPDATE_UNLOCK_FOODS",
    UPDATE_TABLE: "UPDATE_TABLE",
    UPDATE_DECORATION: "UPDATE_DECORATION",
    UPDATE_UN_LOCK_COOK_WOMAN: "UPDATE_UN_LOCK_COOK_WOMAN",
    UPDATE_SHOP_MANAGER_R: "UPDATE_SHOP_MANAGER_R",
    UPDATE_SHOP_MANAGER_C: "UPDATE_SHOP_MANAGER_C",
    UPDATE_SHOP_MANAGER_C_N: "UPDATE_SHOP_MANAGER_C_N",
    UPDATE_WALLET_DATA: "UPDATE_WALLET_DATA",
    AUTO_FUWU: "AUTO_FUWU",
    AUTO_GET_RMB: "AUTO_GET_RMB",
    AUTO_GET_HONGBAO: "AUTO_GET_HONGBAO",
    QUICK_GET_KEREN: "QUICK_GET_KEREN",
    CREATE_KEREN: "CREATE_KEREN",
    OPEN_CHIHUOJIE: "OPEN_CHIHUOJIE",
    CLEAR_TABLE: "CLEAR_TABLE",
    GET_DAKA_LIST: "GET_DAKA_LIST",
    UPDATE_SHOPUP_LIST: "UPDATE_SHOPUP_LIST",
    UPDATE_GUIDE: "UPDATE_GUIDE",
    UPDATE_EVERY_TASK: "UPDATE_EVERY_TASK",
    UPDATE_CHENGJIU: "UPDATE_CHENGJIU",
    UPDATE_ALL_TYPE: "UPDATE_ALL_TYPE",
    UPDATE_WALK_TO_VACANCY: "UPDATE_WALK_TO_VACANCY",
    DIAN_CAI: "DIAN_CAI",
    SET_CHAOCAI_TASK: "SET_CHAOCAI_TASK",
    GTE_SHARE_LAYER_DATA: "GTE_SHARE_LAYER_DATA",
}

export const LOCAL_CONFIG = {
    GamePlayConfig: "gamePlays",
    SpecialPeopleShopLevelConfig: "specialPeoples",
    ShopLevelOffline: "shopLevelOfflines",
    FoodConfig: "foods",
    FoodUpgradeConfig: "foodUpgrades",
    Table: "tables",
    DecorationUpgradeConfig: "decorations",
    People: "peoples",
    CookWomanUpgradeConfig: "cookWomanUpgrades",
    GuideTask: "guideTasks",
    CashOutConfig: "cashOuts",
    AchievementConfig: "achievements",
    EveryDayTaskConfig: "everyDays",
    ClockInMakingMoney: "clocks",
    Withdraw: "withDraws",
}

export const LOCAL_CONFIG_KEY = {
    init_money: "init_money",
    sort_people_max_count: "sort_people_max_count",
    people_move_speed: "people_move_speed",
    people_into_duration: "people_into_duration",
    video_add_waiter_timer: "video_add_waiter_timer",
    off_line_get_count: "off_line_get_count",
    waiter_max_video_count: "waiter_max_video_count",
    produce_trash_count: "produce_trash_count",
}
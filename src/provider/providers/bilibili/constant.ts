const homeHotType = [
  { name: '免费榜', value: 1 }, // 前7日人气最高的免费漫画作品排行
  { name: '飙升榜', value: 2 }, // 前7日新增追漫数最多的漫画作品排行
  { name: '日漫榜', value: 3 }, // 前7日人气最高的日漫作品排行
  { name: '国漫榜', value: 4 }, // 前7日人气最高的国漫作品排行
  { name: '新作榜', value: 5 }, // 前7日人气最高的三个月内上线漫画作品排行
  { name: '韩漫榜', value: 6 }, // 前7日人气最高的韩漫作品排行
  { name: '宝藏榜', value: 8 }, // 前7日人气最高的官方精选漫画作品排行
];

const homeFansType = [
  { name: '投喂榜', value: 0 }, // 每自然月累计粉丝值最高的漫画作品排行
  { name: '月票榜', value: 1 }, // 每自然月累计月票最高的漫画作品排行
];

const classStyle = [
  { name: '全部', value: -1 },
  { name: '正能量', value: 1028 },
  { name: '冒险', value: 1013 },
  { name: '热血', value: 999 },
  { name: '搞笑', value: 994 },
  { name: '恋爱', value: 995 },
  { name: '少女', value: 1026 },
  { name: '纯爱', value: 1022 },
  { name: '日常', value: 1020 },
  { name: '校园', value: 1001 },
  { name: '运动', value: 1010 },
  { name: '治愈', value: 1007 },
  { name: '橘味', value: 1006 },
  { name: '古风', value: 997 },
  { name: '玄幻', value: 1016 },
  { name: '奇幻', value: 998 },
  { name: '后宫', value: 1017 },
  { name: '惊奇', value: 996 },
  { name: '悬疑', value: 1023 },
  { name: '都市', value: 1002 },
  { name: '剧情', value: 1030 },
  { name: '总裁', value: 1004 },
];

const classArea = [
  { name: '全部', value: -1 },
  { name: '大陆', value: 1 },
  { name: '日本', value: 2 },
  { name: '韩国', value: 6 },
  { name: '其他', value: 5 },
];

const classIsFinish = [
  { name: '全部', value: -1 },
  { name: '连载', value: 0 },
  { name: '完结', value: 1 },
];

const classIsFree = [
  { name: '全部', value: -1 },
  { name: '免费', value: 1 },
  { name: '付费', value: 2 },
  { name: '等就免费', value: 3 },
];

const classOrder = [
  { name: '人气推荐', value: 0 },
  { name: '更新时间', value: 1 },
  { name: '追漫人数', value: 2 },
  { name: '上架时间', value: 3 },
];

export default {
  homeHotType,
  homeFansType,
  classStyle,
  classArea,
  classIsFinish,
  classIsFree,
  classOrder,
};

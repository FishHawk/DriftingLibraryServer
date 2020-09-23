const rankType = [
  { name: '人气榜', value: '0' },
  { name: '新番榜', value: '1' },
  { name: '收藏榜', value: '2' },
  { name: '吐槽榜', value: '3' },
];

const categoryType = [
  { name: '全部', subId: '0', subType: '0' },
  { name: '热血', subId: '0', subType: '31' },
  { name: '恋爱', subId: '0', subType: '26' },
  { name: '校园', subId: '0', subType: '1' },
  { name: '百合', subId: '0', subType: '3' },
  { name: '耽美', subId: '0', subType: '27' },
  { name: '伪娘', subId: '0', subType: '5' },
  { name: '冒险', subId: '0', subType: '2' },
  { name: '职场', subId: '0', subType: '6' },
  { name: '后宫', subId: '0', subType: '8' },
  { name: '治愈', subId: '0', subType: '9' },
  { name: '科幻', subId: '0', subType: '25' },
  { name: '励志', subId: '0', subType: '10' },
  { name: '生活', subId: '0', subType: '11' },
  { name: '战争', subId: '0', subType: '12' },
  { name: '悬疑', subId: '0', subType: '17' },
  { name: '推理', subId: '0', subType: '33' },
  { name: '搞笑', subId: '0', subType: '37' },
  { name: '奇幻', subId: '0', subType: '14' },
  { name: '魔法', subId: '0', subType: '15' },
  { name: '恐怖', subId: '0', subType: '29' },
  { name: '神鬼', subId: '0', subType: '20' },
  { name: '萌系', subId: '0', subType: '21' },
  { name: '历史', subId: '0', subType: '4' },
  { name: '美食', subId: '0', subType: '7' },
  { name: '同人', subId: '0', subType: '30' },
  { name: '运动', subId: '0', subType: '34' },
  { name: '绅士', subId: '0', subType: '36' },
  { name: '机甲', subId: '0', subType: '40' },
  { name: '限制级', subId: '0', subType: '61' },
  { name: '少年向', subId: '1', subType: '1' },
  { name: '少女向', subId: '1', subType: '2' },
  { name: '青年向', subId: '1', subType: '3' },
  { name: '港台', subId: '2', subType: '35' },
  { name: '日韩', subId: '2', subType: '36' },
  { name: '大陆', subId: '2', subType: '37' },
  { name: '欧美', subId: '2', subType: '52' },
];

const categorySort = [
  { name: '热门', value: '0' },
  { name: '更新', value: '1' },
  { name: '新作', value: '2' },
  { name: '完结', value: '3' },
];

export default {
  rankType,
  categoryType,
  categorySort,
};

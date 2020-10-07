const rankType = [
  { name: '人气榜', value: '0' },
  { name: '新番榜', value: '1' },
  { name: '收藏榜', value: '2' },
  { name: '吐槽榜', value: '3' },
];

const categoryType = [
  { name: '全部', subType: '0', subId: '0' },
  { name: '热血', subType: '0', subId: '31' },
  { name: '恋爱', subType: '0', subId: '26' },
  { name: '校园', subType: '0', subId: '1' },
  { name: '百合', subType: '0', subId: '3' },
  { name: '耽美', subType: '0', subId: '27' },
  { name: '伪娘', subType: '0', subId: '5' },
  { name: '冒险', subType: '0', subId: '2' },
  { name: '职场', subType: '0', subId: '6' },
  { name: '后宫', subType: '0', subId: '8' },
  { name: '治愈', subType: '0', subId: '9' },
  { name: '科幻', subType: '0', subId: '25' },
  { name: '励志', subType: '0', subId: '10' },
  { name: '生活', subType: '0', subId: '11' },
  { name: '战争', subType: '0', subId: '12' },
  { name: '悬疑', subType: '0', subId: '17' },
  { name: '推理', subType: '0', subId: '33' },
  { name: '搞笑', subType: '0', subId: '37' },
  { name: '奇幻', subType: '0', subId: '14' },
  { name: '魔法', subType: '0', subId: '15' },
  { name: '恐怖', subType: '0', subId: '29' },
  { name: '神鬼', subType: '0', subId: '20' },
  { name: '萌系', subType: '0', subId: '21' },
  { name: '历史', subType: '0', subId: '4' },
  { name: '美食', subType: '0', subId: '7' },
  { name: '同人', subType: '0', subId: '30' },
  { name: '运动', subType: '0', subId: '34' },
  { name: '绅士', subType: '0', subId: '36' },
  { name: '机甲', subType: '0', subId: '40' },
  { name: '限制级', subType: '0', subId: '61' },
  { name: '少年向', subType: '1', subId: '1' },
  { name: '少女向', subType: '1', subId: '2' },
  { name: '青年向', subType: '1', subId: '3' },
  { name: '港台', subType: '2', subId: '35' },
  { name: '日韩', subType: '2', subId: '36' },
  { name: '大陆', subType: '2', subId: '37' },
  { name: '欧美', subType: '2', subId: '52' },
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

const rankType = [
  { name: '人气排行', value: '0' },
  { name: '吐槽排行', value: '1' },
  { name: '订阅排行', value: '2' },
];

const rankRange = [
  { name: '日', value: '0' },
  { name: '周', value: '1' },
  { name: '月', value: '2' },
  { name: '总', value: '3' },
];

const latestType = [
  { name: '全部漫画', value: '0' },
  { name: '原创漫画', value: '1' },
  { name: '译制漫画', value: '2' },
];

const classifyGenre = [
  { name: '全部', value: '' },
  { name: '冒险', value: '4' },
  { name: '欢乐向', value: '5' },
  { name: '格斗', value: '6' },

  { name: '科幻', value: '7' },
  { name: '爱情', value: '8' },
  { name: '侦探', value: '9' },
  { name: '竞技', value: '10' },

  { name: '魔法', value: '11' },
  { name: '神鬼', value: '12' },
  { name: '校园', value: '13' },
  { name: '惊悚', value: '14' },

  { name: '其他', value: '16' },
  { name: '四格', value: '17' },
  { name: '生活', value: '3242' },
  { name: '百合', value: '3243' },

  { name: '伪娘', value: '3244' },
  { name: '悬疑', value: '3245' },
  { name: '耽美', value: '3246' },
  { name: '热血', value: '3248' },

  { name: '后宫', value: '3249' },
  { name: '历史', value: '3250' },
  { name: '战争', value: '3251' },
  { name: '萌系', value: '3252' },

  { name: '宅系', value: '3253' },
  { name: '治愈', value: '3254' },
  { name: '励志', value: '3255' },
  { name: '武侠', value: '3324' },

  { name: '机战', value: '3325' },
  { name: '音乐舞蹈', value: '3326' },
  { name: '美食', value: '3327' },
  { name: '职场', value: '3328' },

  { name: '西方魔幻', value: '3365' },
  { name: '高清单行', value: '4459' },
  { name: '性转换', value: '4518' },
  { name: '东方', value: '5077' },

  { name: '扶她', value: '5345' },
  { name: '魔幻', value: '5806' },
  { name: '奇幻', value: '5848' },
  { name: '节操', value: '6219' },

  { name: '轻小说', value: '6316' },
  { name: '颜艺', value: '6437' },
  { name: '搞笑', value: '7568' },
  { name: '仙侠', value: '7900' },
];

const classifyReader = [
  { name: '全部', value: '' },
  { name: '少年', value: '3262' },
  { name: '少女', value: '3263' },
  { name: '青年', value: '3264' },
];

const classifyStatus = [
  { name: '全部', value: '' },
  { name: '连载', value: '2309' },
  { name: '完结', value: '2310' },
];

const classifyArea = [
  { name: '全部', value: '' },
  { name: '日本', value: '2304' },
  { name: '韩国', value: '2305' },
  { name: '欧美', value: '2306' },
  { name: '港台', value: '2307' },
  { name: '内地', value: '2308' },
  { name: '其他', value: '8453' },
];

const classifySort = [
  { name: '人气', value: '0' },
  { name: '更新', value: '1' },
];

export default {
  rankType,
  rankRange,
  latestType,
  classifyGenre,
  classifyReader,
  classifyStatus,
  classifyArea,
  classifySort,
};

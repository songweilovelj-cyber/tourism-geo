import { ThemeKnowledgeBase } from '@/types/exhibition'
import { artifactPool } from './artifactPool'
import { matchArtifactsByTheme, getMustHaveArtifacts, generateCoreNarrative, generateCuratorialNotes, getRecommendedLiterature } from './artifactMatcher'

export const themeKnowledgeBase: Record<string, ThemeKnowledgeBase> = {
  '车马驰骋': {
    themeId: 'chariot',
    themeName: '车马驰骋',
    coreStory: {
      narrative:
        "从'奚仲造车'的传说，到秦始皇'车同轨'的政令，车轮不仅改变了战争形态，更定义了帝国的疆域。本展将以'权力的轮子'为主线，讲述车马如何从贵族玩具变为帝国的血管。",
      highlight:
        "秦陵铜车马出土时，考古学家发现其伞柄构造具有类似现代'千斤顶'的机械原理，这是秦代黑科技的实证。"
    },
    mustHaveArtifacts: ['tongchema', 'taoyaoche', 'muniuche', 'juyanhanjian', 'qinchidao'],
    recommendedArtifacts: ['jingzhangtielu', 'zhengqiche', 'chemawenhua'],
    spatialHint:
      '序厅设置巨大的车轮投影；驰道厅采用线性狭长空间，模拟古道行进感；地面可使用夯土肌理。',
    curatorialNotes:
      '为确保"车马驰骋"主题的说服力，我已为您锁定秦始皇陵铜车马（最高工艺代表）与居延汉简（制度实证）。建议您补充一件战国马车构件以体现演变过程。',
    artifactPool: [
      {
        id: 'tongchema',
        name: '秦始皇陵铜车马（一号车）',
        era: '秦代',
        category: '车马',
        level: '一级文物',
        origin: '陕西临潼秦始皇陵',
        description: '1980年出土于秦始皇陵封土西侧，两乘铜车马以实物二分之一比例铸造，由三千余部件组装而成。',
        significance: '中国古代青铜铸造的巅峰之作，秦帝国"车同轨"制度的具象见证',
        isMustHave: true,
        emoji: '🐴'
      },
      {
        id: 'taoyaoche',
        name: '东汉陶轺车',
        era: '东汉',
        category: '车马',
        level: '二级文物',
        origin: '甘肃武威',
        description: '汉代贵族出行用车的陶制明器，反映了汉代车马制度和贵族生活。',
        significance: '研究汉代车制和社会生活的重要实物资料',
        isMustHave: true,
        emoji: '🛒'
      },
      {
        id: 'muniuche',
        name: '汉代木牛车',
        era: '汉代',
        category: '车马',
        level: '三级文物',
        origin: '甘肃武威',
        description: '汉代民间运输车辆的实物遗存，反映了汉代陆路运输的发展水平。',
        significance: '研究汉代民间交通和经济的重要实物',
        isMustHave: true,
        emoji: '🐂'
      },
      {
        id: 'juyanhanjian',
        name: '汉代居延烽燧驿传简牍',
        era: '汉代',
        category: '驿传',
        level: '一级文物',
        origin: '内蒙古居延',
        description: '居延汉简中关于驿传制度的简牍，记载了汉代驿站的设置、管理制度和邮驿传递。',
        significance: '汉代驿传制度的直接文献证据',
        isMustHave: true,
        emoji: '📜'
      },
      {
        id: 'qinchidao',
        name: '秦驰道遗址考古报告',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '秦代驰道遗址的考古调查报告，详细记录了驰道的规模、形制和建造技术。',
        significance: '秦代交通工程的权威考古资料',
        isMustHave: true,
        emoji: '🔍'
      },
      {
        id: 'sancaituoluole',
        name: '唐三彩骆驼载乐俑',
        era: '唐代',
        category: '丝路',
        level: '一级文物',
        origin: '陕西西安',
        description: '唐三彩中的精品，展现了唐代丝绸之路上的文化交流景象。',
        significance: '唐代中外文化交流的生动写照',
        isRecommended: true,
        emoji: '🐫'
      },
      {
        id: 'yishituzhuan',
        name: '唐代驿使图壁画砖',
        era: '唐代',
        category: '驿传',
        level: '二级文物',
        origin: '甘肃敦煌',
        description: '敦煌壁画中描绘唐代驿使传递文书场景的画像砖。',
        significance: '唐代驿传制度的形象化资料',
        isRecommended: true,
        emoji: '🏇'
      },
      {
        id: 'jingzhangtielu',
        name: '京张铁路工程设计图',
        era: '清代',
        category: '铁路',
        level: '一级文物',
        origin: '北京',
        description: '詹天佑主持设计的京张铁路工程图纸，是中国铁路史上的重要文献。',
        significance: '中国人自主设计建造的第一条铁路的历史见证',
        isRecommended: true,
        emoji: '📏'
      },
      {
        id: 'zhengqiche',
        name: '中国早期蒸汽机车模型',
        era: '近代',
        category: '铁路',
        level: '三级文物',
        description: '中国近代铁路发展初期使用的蒸汽机车模型。',
        significance: '中国铁路现代化进程的实物见证',
        isRecommended: true,
        emoji: '🚂'
      },
      {
        id: 'chemawenhua',
        name: '中国车马文化通论',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '系统研究中国古代车马文化的学术专著。',
        significance: '车马文化研究的权威学术著作',
        isRecommended: true,
        emoji: '📚'
      },
      {
        id: 'yitonglucheng',
        name: '明代一统路程图记刻本',
        era: '明代',
        category: '驿传',
        level: '二级文物',
        description: '明代全国交通路线图的刻本，详细标注了各地驿站和路程。',
        significance: '明代交通地理的重要文献',
        emoji: '🗺'
      },
      {
        id: 'maqiaotu',
        name: '张骞出使西域图卷',
        era: '汉代',
        category: '丝路',
        level: '一级文物',
        description: '描绘张骞出使西域历史场景的画卷。',
        significance: '丝绸之路开辟的历史见证',
        emoji: '🐪'
      },
      {
        id: 'mawangduiditu',
        name: '马王堆汉墓地形图',
        era: '西汉',
        category: '地图',
        level: '一级文物',
        origin: '湖南长沙',
        description: '马王堆汉墓出土的帛书地图，是中国现存最早的实测地图。',
        significance: '中国古代地图测绘技术的杰出代表',
        emoji: '📐'
      },
      {
        id: 'qiaoliangshi',
        name: '中国桥梁建筑史纲',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '系统研究中国古代桥梁建筑历史的学术著作。',
        significance: '桥梁建筑史研究的重要参考',
        emoji: '🌉'
      },
      {
        id: 'qinzhidao',
        name: '数字复原·秦直道全线',
        era: '当代',
        category: '数字',
        description: '基于考古数据的秦直道全线数字复原成果。',
        significance: '数字复原技术在交通史研究中的应用范例',
        emoji: '🛤'
      }
    ]
  },

  '运河漕运': {
    themeId: 'canal',
    themeName: '运河漕运',
    coreStory: {
      narrative:
        '一条大运河，半部中国史。这不仅是水的故事，更是粮食、税收与王朝命脉的故事。我们将跟随一艘漕船，从杭州出发，历经数月，抵达元大都。',
      highlight:
        "万历年间，由于黄河改道导致漕运中断，朝廷内部爆发了激烈的'改道之争'，这直接影响了明朝的国运。"
    },
    mustHaveArtifacts: ['wuyazhanchuan', 'qingminghe', 'yunhequantu', 'dayunheyanjiu', 'qiaoliangshi'],
    recommendedArtifacts: ['quanzhouhaichuan', 'yitonglucheng'],
    spatialHint:
      '帆影厅需营造波光粼粼的水纹灯光效果；地面可做透明玻璃栈道，下方投影流水。',
    curatorialNotes:
      '为确保"运河漕运"主题的完整性，我已为您锁定五牙战船（造船技术巅峰）与运河全图（漕运体系实证）。建议补充漕运相关的票据和官印以增强制度层面的展示。',
    artifactPool: [
      {
        id: 'wuyazhanchuan',
        name: '隋代五牙战船复原模型',
        era: '隋代',
        category: '舟楫',
        level: '二级文物',
        description: '隋代大型战船五牙舰的复原模型，是隋代造船技术的代表。',
        significance: '隋代造船技术和水军建设的实物见证',
        isMustHave: true,
        emoji: '⛵'
      },
      {
        id: 'qingminghe',
        name: '北宋清明上河图（汴河漕运局部）',
        era: '北宋',
        category: '舟楫',
        level: '一级文物',
        origin: '故宫博物院',
        description: '张择端《清明上河图》中描绘汴河漕运繁忙景象的部分。',
        significance: '宋代漕运和城市经济的生动写照',
        isMustHave: true,
        emoji: '🏙'
      },
      {
        id: 'yunhequantu',
        name: '清代运河漕运全图',
        era: '清代',
        category: '舟楫',
        level: '一级文物',
        description: '清代京杭大运河全线漕运设施的详细地图。',
        significance: '清代漕运体系和运河工程的权威地图资料',
        isMustHave: true,
        emoji: '🌊'
      },
      {
        id: 'dayunheyanjiu',
        name: '大运河世界遗产研究',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '关于大运河世界文化遗产的系统研究著作。',
        significance: '大运河文化遗产研究的权威参考',
        isMustHave: true,
        emoji: '📖'
      },
      {
        id: 'qiaoliangshi',
        name: '中国桥梁建筑史纲',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '系统研究中国古代桥梁建筑历史的学术著作。',
        significance: '运河桥梁建筑研究的重要参考',
        isMustHave: true,
        emoji: '🌉'
      },
      {
        id: 'quanzhouhaichuan',
        name: '泉州湾宋代海船残骸',
        era: '宋代',
        category: '航海',
        level: '一级文物',
        origin: '福建泉州',
        description: '泉州湾出土的宋代海船残骸，是宋代造船技术的重要实物。',
        significance: '宋代海外贸易和造船技术的杰出代表',
        isRecommended: true,
        emoji: '🛶'
      },
      {
        id: 'yitonglucheng',
        name: '明代一统路程图记刻本',
        era: '明代',
        category: '驿传',
        level: '二级文物',
        description: '明代全国交通路线图的刻本，包含运河水路交通。',
        significance: '明代交通地理和漕运路线的重要文献',
        isRecommended: true,
        emoji: '🗺'
      },
      {
        id: 'zhenghebaochuan',
        name: '郑和下西洋宝船模型',
        era: '明代',
        category: '航海',
        level: '二级文物',
        description: '郑和下西洋所乘宝船的复原模型。',
        significance: '明代航海技术和海上丝绸之路的见证',
        emoji: '🚢'
      },
      {
        id: 'zaochuanjishu',
        name: '中国古代造船技术',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '系统研究中国古代造船技术发展的学术专著。',
        significance: '造船技术史研究的权威参考',
        emoji: '⚓'
      },
      {
        id: 'bianhechangjing',
        name: '3D重建·汴河漕运场景',
        era: '当代',
        category: '数字',
        description: '基于历史文献和考古数据的北宋汴河漕运场景3D重建。',
        significance: '数字复原技术在运河史研究中的应用范例',
        emoji: '🏗'
      }
    ]
  },

  '水利文明': {
    themeId: 'water',
    themeName: '水利文明',
    coreStory: {
      narrative:
        '从大禹治水的传说，到都江堰的千年守护，从大运河的南北贯通，到三峡工程的世纪壮举——水利，始终是中华文明的生命线。本展将以"治水·利水·乐水"为主线，讲述中国人与水共生的千年智慧。',
      highlight:
        '都江堰的"深淘滩，低作堰"六字诀，至今仍是水利工程的经典准则。李冰父子两千多年前的设计，让成都平原成为"天府之国"。'
    },
    mustHaveArtifacts: ['libingshixiang', 'dujiangyan', 'dayunhe', 'shuijingzhu', 'sangutianqi'],
    recommendedArtifacts: ['huanghegaitu', 'gongchengtu'],
    spatialHint:
      '序厅采用水帘投影营造"水"的氛围；都江堰厅采用环形展墙模拟鱼嘴分水；地面设置水流感应装置增强互动体验。',
    curatorialNotes:
      '为确保"水利文明"主题的学术高度，我已为您锁定李冰石像（水利精神象征）与都江堰（工程智慧典范）。建议补充一件民国时期的水利工程档案，以展现近代水利的转型。',
    artifactPool: [
      {
        id: 'libingshixiang',
        name: '李冰石像',
        era: '东汉',
        category: '水利',
        level: '一级文物',
        origin: '四川都江堰',
        description: '1974年出土于都江堰外江，是东汉时期为纪念李冰而造的石像。',
        significance: '都江堰水利工程的历史见证，中国水利精神的象征',
        isMustHave: true,
        emoji: '🗿'
      },
      {
        id: 'dujiangyan',
        name: '都江堰工程图',
        era: '清代',
        category: '水利',
        level: '二级文物',
        description: '清代绘制的都江堰水利工程全景图，详细标注了各工程设施。',
        significance: '都江堰水利工程技术的重要图志资料',
        isMustHave: true,
        emoji: '🏞'
      },
      {
        id: 'dayunhe',
        name: '京杭大运河全图',
        era: '清代',
        category: '水利',
        level: '一级文物',
        description: '清代京杭大运河全线的工程图，是世界文化遗产的重要图证。',
        significance: '世界最长人工运河的历史见证',
        isMustHave: true,
        emoji: '🌊'
      },
      {
        id: 'shuijingzhu',
        name: '水经注',
        era: '北魏',
        category: '文献',
        level: '一级文物',
        description: '郦道元所著《水经注》，是中国古代最全面、最系统的综合性地理著作。',
        significance: '中国古代水文地理的集大成之作',
        isMustHave: true,
        emoji: '📚'
      },
      {
        id: 'sangutianqi',
        name: '三顾茅庐·隆中对',
        era: '三国',
        category: '历史',
        level: '一级文物',
        description: '描绘刘备三顾茅庐与诸葛亮论天下的场景，涉及水利与军事战略。',
        significance: '水利与国家战略关系的历史典故',
        isMustHave: true,
        emoji: '🏠'
      },
      {
        id: 'huanghegaitu',
        name: '黄河改道图',
        era: '清代',
        category: '水利',
        level: '二级文物',
        description: '清代绘制的黄河历次改道示意图。',
        significance: '中国古代治黄历史的重要图志',
        isRecommended: true,
        emoji: '🗺'
      },
      {
        id: 'gongchengtu',
        name: '水利工程施工图',
        era: '近代',
        category: '水利',
        level: '三级文物',
        description: '近代水利工程的施工设计图纸。',
        significance: '中国水利工程近代化的实物见证',
        isRecommended: true,
        emoji: '📐'
      },
      {
        id: 'sanhuan',
        name: '郑国渠遗址考古报告',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '郑国渠遗址的考古调查报告。',
        significance: '秦代大型水利工程的考古实证',
        emoji: '🔍'
      },
      {
        id: 'nongzhengquanshu',
        name: '农政全书',
        era: '明代',
        category: '文献',
        level: '二级文物',
        description: '徐光启所著《农政全书》，包含大量水利论述。',
        significance: '明代农业水利技术的集大成之作',
        emoji: '🌾'
      },
      {
        id: 'shanxiashuili',
        name: '数字复原·三峡工程',
        era: '当代',
        category: '数字',
        description: '三峡水利枢纽工程的数字可视化成果。',
        significance: '当代中国水利工程的标志性成就',
        emoji: '💧'
      }
    ]
  },

  '丝路驿站': {
    themeId: 'silkroad2',
    themeName: '丝路驿站',
    coreStory: {
      narrative:
        "驼铃声声，旌旗猎猎。从长安到罗马，从敦煌到撒马尔罕，驿站是丝路上的坐标，也是文明的锚点。本展将以'驿站网络'为切入点，讲述丝绸之路上的人员往来、商品流通与文明互鉴。",
      highlight:
        '悬泉置遗址出土的汉简记载了一次西域使团的接待记录——仅一个使团就有300多人，消耗粮食以吨计，这让我们窥见了丝路交流的真实规模。'
    },
    mustHaveArtifacts: ['zhangqian', 'xuanquanzhi', 'yizhantu', 'sichouzhilu', 'rongxinjiang'],
    recommendedArtifacts: ['sutie', 'bosiyaoyin'],
    spatialHint:
      '采用驿站节点式空间布局，每个展厅对应一个重要驿站；走廊设计成"古道"形态，地面铺黄沙肌理；灯光模拟沙漠日出日落变化。',
    curatorialNotes:
      '为确保"丝路驿站"主题的叙事深度，我已为您锁定张骞出使（凿空西域）与悬泉置汉简（驿站制度实证）。建议补充粟特商人相关文物以体现民间贸易层面。',
    artifactPool: [
      {
        id: 'zhangqian',
        name: '张骞出使西域图卷',
        era: '汉代',
        category: '丝路',
        level: '一级文物',
        description: '描绘张骞出使西域历史场景的画卷。',
        significance: '丝绸之路开辟的历史见证',
        isMustHave: true,
        emoji: '🐪'
      },
      {
        id: 'xuanquanzhi',
        name: '悬泉置汉简',
        era: '汉代',
        category: '驿传',
        level: '一级文物',
        origin: '甘肃敦煌',
        description: '敦煌悬泉置遗址出土的汉代简牍，详细记载了驿站的运作制度。',
        significance: '汉代丝路驿站制度的直接文献证据',
        isMustHave: true,
        emoji: '📜'
      },
      {
        id: 'yizhantu',
        name: '西域驿站分布图',
        era: '唐代',
        category: '地图',
        level: '二级文物',
        description: '唐代西域地区驿站和交通线路的分布图。',
        significance: '唐代西域交通网络的重要图志',
        isMustHave: true,
        emoji: '🗺'
      },
      {
        id: 'sichouzhilu',
        name: '丝绸之路交通史',
        era: '跨时代',
        category: '文献',
        level: '文献',
        description: '系统研究丝绸之路交通历史的学术专著。',
        significance: '丝绸之路研究的权威参考',
        isMustHave: true,
        emoji: '📖'
      },
      {
        id: 'rongxinjiang',
        name: '荣新江·敦煌学论集',
        era: '当代',
        category: '文献',
        level: '文献',
        description: '荣新江教授关于敦煌学和丝路史的学术论文集。',
        significance: '当代丝路研究的重要学术成果',
        isMustHave: true,
        emoji: '📚'
      },
      {
        id: 'sutie',
        name: '粟特商人文书',
        era: '唐代',
        category: '丝路',
        level: '一级文物',
        description: '吐鲁番出土的粟特文商业文书。',
        significance: '丝路民间贸易和粟特商人活动的实物证据',
        isRecommended: true,
        emoji: '📝'
      },
      {
        id: 'bosiyaoyin',
        name: '波斯银币与东罗马金币',
        era: '唐代',
        category: '丝路',
        level: '一级文物',
        origin: '陕西西安',
        description: '唐代墓葬出土的波斯银币和东罗马金币。',
        significance: '丝绸之路国际贸易的实物见证',
        isRecommended: true,
        emoji: '🪙'
      },
      {
        id: 'dunhuangbihua',
        name: '敦煌壁画·商旅图',
        era: '唐代',
        category: '艺术',
        level: '一级文物',
        description: '敦煌莫高窟壁画中描绘丝路商旅的场景。',
        significance: '丝绸之路社会生活的形象化资料',
        emoji: '🎨'
      },
      {
        id: 'yutianyu',
        name: '于阗玉佩饰',
        era: '汉代',
        category: '工艺',
        level: '二级文物',
        description: '丝路南道于阗国出产的玉器。',
        significance: '丝路玉石贸易的实物见证',
        emoji: '💎'
      },
      {
        id: 'yuanzhengqi',
        name: '元青花·昭君出塞罐',
        era: '元代',
        category: '工艺',
        level: '一级文物',
        description: '元代青花瓷器，描绘昭君出塞故事。',
        significance: '元代丝路贸易和文化交流的瑰宝',
        emoji: '🏺'
      }
    ]
  }
}

export function getThemeKnowledge(themeId: string): ThemeKnowledgeBase | undefined {
  const baseTheme = themeKnowledgeBase[themeId]
  
  // 如果没有预设主题，使用智能匹配动态生成
  if (!baseTheme) {
    return generateDynamicThemeKnowledge(themeId)
  }

  // 使用智能匹配算法从统一文物库中匹配
  const matchedArtifacts = matchArtifactsByTheme(baseTheme.themeName, 20)
  const mustHaveIds = getMustHaveArtifacts(baseTheme.themeName, 5)
  const recommendedIds = getMustHaveArtifacts(baseTheme.themeName, 10).slice(5, 10)

  // 构建带优先级标记的文物池
  const enrichedArtifactPool = matchedArtifacts.map(m => ({
    ...m.artifact,
    isMustHave: mustHaveIds.includes(m.artifact.id),
    isRecommended: recommendedIds.includes(m.artifact.id) && !mustHaveIds.includes(m.artifact.id)
  }))

  // 生成深化版核心叙事
  const coreNarrative = generateCoreNarrative(baseTheme.themeName)

  // 生成策展人笔记
  const topArtifacts = enrichedArtifactPool.filter(a => a.isMustHave)
  const curatorialNotes = generateCuratorialNotes(baseTheme.themeName, topArtifacts)

  // 获取推荐文献
  const recommendedLiterature = getRecommendedLiterature(baseTheme.themeName)

  return {
    ...baseTheme,
    coreStory: coreNarrative,
    mustHaveArtifacts: mustHaveIds,
    recommendedArtifacts: recommendedIds,
    artifactPool: enrichedArtifactPool,
    curatorialNotes,
    recommendedLiterature,
    keyDimensions: getThemeDimensions(baseTheme.themeName)
  }
}

function generateDynamicThemeKnowledge(themeId: string): ThemeKnowledgeBase {
  const themeName = themeId
  
  // 使用智能匹配算法从统一文物库中匹配
  const matchedArtifacts = matchArtifactsByTheme(themeName, 20)
  const mustHaveIds = getMustHaveArtifacts(themeName, 5)
  const recommendedIds = getMustHaveArtifacts(themeName, 10).slice(5, 10)

  // 构建带优先级标记的文物池
  const enrichedArtifactPool = matchedArtifacts.map(m => ({
    ...m.artifact,
    isMustHave: mustHaveIds.includes(m.artifact.id),
    isRecommended: recommendedIds.includes(m.artifact.id) && !mustHaveIds.includes(m.artifact.id)
  }))

  // 生成深化版核心叙事
  const coreNarrative = generateCoreNarrative(themeName)

  // 生成策展人笔记
  const topArtifacts = enrichedArtifactPool.filter(a => a.isMustHave)
  const curatorialNotes = generateCuratorialNotes(themeName, topArtifacts)

  // 获取推荐文献
  const recommendedLiterature = getRecommendedLiterature(themeName)

  // 生成空间设计提示
  const spatialHint = generateSpatialHint(themeName)

  return {
    themeId: themeId.toLowerCase().replace(/\s+/g, '-'),
    themeName: themeName,
    coreStory: coreNarrative,
    mustHaveArtifacts: mustHaveIds,
    recommendedArtifacts: recommendedIds,
    spatialHint,
    curatorialNotes,
    artifactPool: enrichedArtifactPool,
    recommendedLiterature,
    keyDimensions: getThemeDimensions(themeName)
  }
}

function generateSpatialHint(themeName: string): string {
  const themeLower = themeName.toLowerCase()
  
  if (themeLower.includes('车马') || themeLower.includes('驰道')) {
    return '序厅设置巨大的车轮投影；驰道厅采用线性狭长空间，模拟古道行进感；地面可使用夯土肌理。'
  }
  if (themeLower.includes('运河') || themeLower.includes('漕运')) {
    return '帆影厅需营造波光粼粼的水纹灯光效果；地面可做透明玻璃栈道，下方投影流水；设置漕船剖面互动装置。'
  }
  if (themeLower.includes('丝路') || themeLower.includes('敦煌')) {
    return '采用驿站节点式空间布局；走廊设计成"古道"形态，地面铺黄沙肌理；灯光模拟沙漠日出日落变化。'
  }
  if (themeLower.includes('水利')) {
    return '序厅采用水帘投影营造"水"的氛围；都江堰厅采用环形展墙模拟鱼嘴分水；地面设置水流感应装置增强互动体验。'
  }
  if (themeLower.includes('航海') || themeLower.includes('海上')) {
    return '营造沉浸式海洋氛围；设置古船剖面互动展项；配合海浪声效增强沉浸感。'
  }
  if (themeLower.includes('铁路') || themeLower.includes('火车')) {
    return '采用工业风设计语言；设置蒸汽机车模拟驾驶互动；轨道元素贯穿空间设计。'
  }
  
  return '建议采用主题式空间布局，配合多媒体互动展项增强观众参与感。'
}

function getThemeDimensions(themeName: string): string[] {
  const themeLower = themeName.toLowerCase()
  
  if (themeLower.includes('车马') || themeLower.includes('驰道')) {
    return ['车马技术', '道路体系', '驿传制度', '等级礼制', '中外交流']
  }
  if (themeLower.includes('运河') || themeLower.includes('漕运')) {
    return ['运河工程', '漕运制度', '造船技术', '城市经济', '文化交流']
  }
  if (themeLower.includes('丝路') || themeLower.includes('敦煌')) {
    return ['丝路商贸', '驿传网络', '佛教东传', '文化互鉴', '物产流通']
  }
  if (themeLower.includes('水利')) {
    return ['治水智慧', '工程技术', '灌溉农业', '运河漕运', '水文化']
  }
  return ['起源与发展', '技术演进', '制度完善', '文化内涵', '当代价值']
}

export function getAllThemes(): string[] {
  return Object.keys(themeKnowledgeBase)
}

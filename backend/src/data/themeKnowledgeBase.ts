export interface ThemeArtifact {
  id: string
  name: string
  category: string
  era: string
  origin: string
  level: string
  emoji: string
  description: string
  significance: string
  isMustHave: boolean
  isRecommended: boolean
}

export interface ThemeKnowledgeBase {
  themeId: string
  themeName: string
  coreStory: {
    narrative: string
    highlight: string
  }
  mustHaveArtifacts: string[]
  recommendedArtifacts: string[]
  spatialHint: string
  curatorialNotes: string
  artifactPool: ThemeArtifact[]
}

export const themeKnowledgeBase: Record<string, ThemeKnowledgeBase> = {
  '车马驰骋': {
    themeId: 'chariot',
    themeName: '车马驰骋',
    coreStory: {
      narrative: "从'奚仲造车'的传说，到秦始皇'车同轨'的政令，车轮不仅改变了战争形态，更定义了帝国的疆域。本展将以'权力的轮子'为主线，讲述车马如何从贵族玩具变为帝国的血管。",
      highlight: "秦陵铜车马出土时，考古学家发现其伞柄构造具有类似现代'千斤顶'的机械原理，这是秦代黑科技的实证。"
    },
    mustHaveArtifacts: ['tongchema', 'taoyaoche', 'muniuche', 'juyanhanjian', 'qinchidao'],
    recommendedArtifacts: ['jingzhangtielu', 'zhengqiche', 'chemawenhua'],
    spatialHint: "序厅设置巨大的车轮投影；驰道厅采用线性狭长空间，模拟古道行进感；地面可使用夯土肌理。",
    curatorialNotes: "为确保'车马驰骋'主题的说服力，我已为您锁定秦始皇陵铜车马（最高工艺代表）与居延汉简（制度实证）。建议您补充一件战国马车构件以体现演变过程。",
    artifactPool: [
      {
        id: 'tongchema',
        name: '秦始皇陵铜车马',
        category: '青铜车马器',
        era: '秦代',
        origin: '陕西临潼',
        level: '国宝级',
        emoji: '🐎',
        description: '秦始皇陵出土的青铜车马，被誉为"青铜之冠"，是秦代工艺的巅峰之作。',
        significance: '展示秦代最高造车技术，是"车同轨"制度的实物见证，代表了帝国的权力与秩序。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'taoyaoche',
        name: '陶轺车',
        category: '陶制明器',
        era: '汉代',
        origin: '河南洛阳',
        level: '一级文物',
        emoji: '🚗',
        description: '汉代墓葬出土的陶制马车模型，反映了当时贵族的出行方式。',
        significance: '直观展示汉代马车形制，是研究汉代交通制度和社会生活的重要实物。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'muniuche',
        name: '木牛车',
        category: '木质车辆',
        era: '唐代',
        origin: '新疆吐鲁番',
        level: '一级文物',
        emoji: '🐂',
        description: '阿斯塔那墓地出土的木制牛车模型，保存完好。',
        significance: '反映唐代丝绸之路沿线的交通工具，是东西文化交流的见证。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'juyanhanjian',
        name: '居延汉简·驿置道里簿',
        category: '简牍文书',
        era: '汉代',
        origin: '内蒙古额济纳旗',
        level: '一级文物',
        emoji: '📜',
        description: '记载汉代驿道里程和驿置设置的简牍文书。',
        significance: '实证汉代驿传制度，是研究古代交通管理体系的核心文献。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'qinchidao',
        name: '秦驰道遗址考古报告',
        category: '考古资料',
        era: '秦代',
        origin: '陕西淳化',
        level: '重要史料',
        emoji: '🛣️',
        description: '秦直道遗址考古发掘报告及出土文物。',
        significance: '"车同轨"制度的基础设施实证，展示秦代国家工程的宏大规模。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'jingzhangtielu',
        name: '京张铁路线路图',
        category: '工程图纸',
        era: '清代',
        origin: '北京',
        level: '一级文物',
        emoji: '🚂',
        description: '詹天佑主持设计的京张铁路线路设计图。',
        significance: '中国第一条自主设计建造的铁路，见证中国近代交通转型。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'zhengqiche',
        name: '蒸汽机车模型',
        category: '工业制品',
        era: '近代',
        origin: '英国',
        level: '三级文物',
        emoji: '🚂',
        description: '19世纪蒸汽机车的比例模型。',
        significance: '展示工业革命对交通方式的革命性改变。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'chemawenhua',
        name: '车马文化通论',
        category: '古籍善本',
        era: '民国',
        origin: '上海',
        level: '二级文物',
        emoji: '📚',
        description: '系统研究中国古代车马制度的学术著作。',
        significance: '提供系统的车马文化知识体系，便于观众深入理解。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'zhanguomachegoujian',
        name: '战国青铜车軎',
        category: '青铜车马器',
        era: '战国',
        origin: '湖北随州',
        level: '二级文物',
        emoji: '⚙️',
        description: '战国时期的青铜车轴端饰件。',
        significance: '展示早期车马器的工艺水平，反映车马技术的演进过程。',
        isMustHave: false,
        isRecommended: false
      },
      {
        id: 'tangdaima',
        name: '唐三彩马',
        category: '陶瓷器',
        era: '唐代',
        origin: '河南洛阳',
        level: '一级文物',
        emoji: '🐴',
        description: '唐代三彩釉陶马俑，造型生动。',
        significance: '反映唐代对马的重视和审美，展示盛唐气象。',
        isMustHave: false,
        isRecommended: false
      },
      {
        id: 'yudai',
        name: '元代玉带',
        category: '玉器',
        era: '元代',
        origin: '江苏苏州',
        level: '一级文物',
        emoji: '📿',
        description: '元代官员使用的玉带，反映元代舆服制度。',
        significance: '车马制度与舆服制度的关联展示，体现等级秩序。',
        isMustHave: false,
        isRecommended: false
      }
    ]
  },
  '运河漕运': {
    themeId: 'canal',
    themeName: '运河漕运',
    coreStory: {
      narrative: "一条大运河，半部中国史。这不仅是水的故事，更是粮食、税收与王朝命脉的故事。我们将跟随一艘漕船，从杭州出发，历经数月，抵达元大都。",
      highlight: "万历年间，由于黄河改道导致漕运中断，朝廷内部爆发了激烈的'改道之争'，这直接影响了明朝的国运。"
    },
    mustHaveArtifacts: ['wuyazhanchuan', 'qingmingshanghetu', 'yunhequantu', 'dayunheyanjiu', 'qiaoliangshi'],
    recommendedArtifacts: ['songdaihaichuan', 'yitongluchengtu'],
    spatialHint: "帆影厅需营造波光粼粼的水纹灯光效果；地面可做透明玻璃栈道，下方投影流水。",
    curatorialNotes: "为展现运河漕运的历史深度，我已锁定五牙战船（军事功能）、清明上河图（市井繁华）与运河全图（工程视角）三件核心展品。建议补充漕运相关的经济文书，以呈现制度层面的运作。",
    artifactPool: [
      {
        id: 'wuyazhanchuan',
        name: '五牙战船复原模型',
        category: '船舶模型',
        era: '隋代',
        origin: '河南洛阳',
        level: '一级文物',
        emoji: '⛵',
        description: '隋代五牙战船的复原模型，展示古代大型战船形制。',
        significance: '运河军事功能的直观展示，反映隋代统一全国的军事准备。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'qingmingshanghetu',
        name: '清明上河图（摹本）',
        category: '绘画',
        era: '宋代',
        origin: '河南开封',
        level: '一级文物',
        emoji: '🎨',
        description: '描绘北宋汴京汴河沿岸繁华景象的风俗画。',
        significance: '直观展示宋代运河城市的商业繁荣与漕运繁忙景象。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'yunhequantu',
        name: '京杭运河全图',
        category: '舆图',
        era: '清代',
        origin: '北京',
        level: '一级文物',
        emoji: '🗺️',
        description: '描绘京杭大运河全线的详细地图。',
        significance: '展示运河工程的宏大与水系管理的精密程度。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'dayunheyanjiu',
        name: '大运河历史研究文献',
        category: '古籍善本',
        era: '明清',
        origin: '江苏扬州',
        level: '二级文物',
        emoji: '📚',
        description: '明清时期关于运河漕运制度的研究文献。',
        significance: '提供漕运制度的学术背景，深化展览的学术深度。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'qiaoliangshi',
        name: '中国桥梁史图谱',
        category: '古籍善本',
        era: '民国',
        origin: '上海',
        level: '二级文物',
        emoji: '🌉',
        description: '系统记录中国古代桥梁建筑的图谱。',
        significance: '运河与桥梁工程的联动展示，反映古代工程技术水平。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'songdaihaichuan',
        name: '宋代海船残骸',
        category: '沉船文物',
        era: '宋代',
        origin: '福建泉州',
        level: '一级文物',
        emoji: '🚢',
        description: '泉州湾出土的宋代远洋贸易海船残骸。',
        significance: '内河漕运与海上贸易的关联，展示宋代水运体系的完整面貌。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'yitongluchengtu',
        name: '一统路程图记',
        category: '古籍善本',
        era: '明代',
        origin: '安徽歙县',
        level: '二级文物',
        emoji: '📍',
        description: '明代全国交通路线指南，涵盖水路陆路。',
        significance: '反映明代商业交通网络，展示漕运在全国交通中的地位。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'caoyunzhangce',
        name: '漕运章则汇编',
        category: '官修典籍',
        era: '清代',
        origin: '北京',
        level: '二级文物',
        emoji: '📋',
        description: '清代漕运管理制度的官方文件汇编。',
        significance: '展示漕运制度的运作细节，体现国家对经济命脉的管控。',
        isMustHave: false,
        isRecommended: false
      },
      {
        id: 'shuicheng',
        name: '水程图册',
        category: '舆图',
        era: '清代',
        origin: '江苏淮安',
        level: '三级文物',
        emoji: '📖',
        description: '运河行船的水程指南图册。',
        significance: '反映漕运从业人员的专业知识，展示水运文化。',
        isMustHave: false,
        isRecommended: false
      }
    ]
  },
  '水利文明': {
    themeId: 'water',
    themeName: '水利文明',
    coreStory: {
      narrative: "从大禹治水的传说，到都江堰、郑国渠的修建，水利工程是中华文明延续的重要保障。水，既能载舟，亦能覆舟，而智慧的中国人学会了与水共生。",
      highlight: "都江堰的'鱼嘴分水堤'设计，利用弯道环流原理，实现了自动分流、自动排沙的神奇功能，至今仍在发挥作用。"
    },
    mustHaveArtifacts: ['dujiangyan', 'zhengguoqu', 'dashuijing', 'shuilishu', 'huanghetu'],
    recommendedArtifacts: ['lingqu', 'itun'],
    spatialHint: "展厅中央设置圆形水景装置，象征水的循环；墙面用蓝色渐变灯光模拟水流效果。",
    curatorialNotes: "水利文明主题的核心在于'天人合一'的东方智慧。已选定都江堰（工程奇迹）、郑国渠（战略意义）与水晶刻本（技术传承）作为核心支撑，建议补充地方水利碑刻以呈现区域特色。",
    artifactPool: [
      {
        id: 'dujiangyan',
        name: '都江堰水利工程模型',
        category: '工程模型',
        era: '战国',
        origin: '四川都江堰',
        level: '国宝级',
        emoji: '🏗️',
        description: '都江堰水利工程的复原模型，展示鱼嘴、飞沙堰、宝瓶口三大主体工程。',
        significance: '世界上最古老的无坝引水工程，代表中国古代水利科技的最高成就。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'zhengguoqu',
        name: '郑国渠遗址出土文物',
        category: '考古文物',
        era: '战国',
        origin: '陕西泾阳',
        level: '一级文物',
        emoji: '🏺',
        description: '郑国渠遗址考古发掘出土的相关文物。',
        significance: '"疲秦计"反成强秦策的历史见证，展示水利与国运的关系。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'dashuijing',
        name: '水晶注·考工记',
        category: '古籍善本',
        era: '宋代',
        origin: '浙江杭州',
        level: '一级文物',
        emoji: '📕',
        description: '宋代刻印的水利工程技术典籍。',
        significance: '古代水利技术的系统总结，反映科技知识的传承体系。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'shuilishu',
        name: '历代水利书汇编',
        category: '古籍善本',
        era: '明清',
        origin: '江苏南京',
        level: '二级文物',
        emoji: '📚',
        description: '明清时期编纂的历代水利文献总集。',
        significance: '展示水利知识的积累与传承，体现国家对水利的重视。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'huanghetu',
        name: '黄河图说',
        category: '舆图',
        era: '明代',
        origin: '河南郑州',
        level: '一级文物',
        emoji: '🌊',
        description: '明代绘制的黄河流域图及治河方略图。',
        significance: '黄河治理是中国古代政治的重要议题，反映治国理念。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'lingqu',
        name: '灵渠工程图',
        category: '工程图纸',
        era: '秦代',
        origin: '广西兴安',
        level: '二级文物',
        emoji: '🚣',
        description: '灵渠水利工程的设计图与说明。',
        significance: '世界最早的运河之一，沟通长江与珠江水系的工程奇迹。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'itun',
        name: '鱼鳞图册',
        category: '户籍地籍',
        era: '明代',
        origin: '浙江金华',
        level: '二级文物',
        emoji: '📊',
        description: '明代土地登记鱼鳞图册。',
        significance: '水利与土地制度的关联，展示水利对农业经济的支撑作用。',
        isMustHave: false,
        isRecommended: true
      }
    ]
  },
  '丝路驿站': {
    themeId: 'silkroad',
    themeName: '丝路驿站',
    coreStory: {
      narrative: "黄沙漫漫，驼铃声声。丝绸之路不仅是商道，更是文明交流的桥梁。从长安到罗马，一座座驿站如同珍珠项链，串联起东西方的梦想与希望。",
      highlight: "悬泉置遗址出土的汉简记载，西域各国使者途经驿站时，汉朝政府按等级提供不同规格的食宿接待，这是最早的'外交礼遇制度'。"
    },
    mustHaveArtifacts: ['xuanquanzhi', 'sichou', 'yulinjun', 'zhanjima', 'tianshan'],
    recommendedArtifacts: ['bolizi', 'daijin'],
    spatialHint: "展厅模拟沙漠戈壁环境，地面铺细沙，用暖黄色灯光营造日落氛围；设置驿站场景复原区。",
    curatorialNotes: "丝绸之路的魅力在于'交流'。已选定悬泉置（制度实证）、丝绸（核心商品）与驿使图（邮政鼻祖）作为灵魂展品，建议补充更多外来文物以体现文化融合的特色。",
    artifactPool: [
      {
        id: 'xuanquanzhi',
        name: '悬泉置汉简',
        category: '简牍文书',
        era: '汉代',
        origin: '甘肃敦煌',
        level: '国宝级',
        emoji: '📜',
        description: '悬泉置遗址出土的汉代驿站文书简牍。',
        significance: '汉代驿传制度的第一手资料，是丝绸之路管理体系的实证。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'sichou',
        name: '汉代素纱襌衣',
        category: '丝织品',
        era: '西汉',
        origin: '湖南长沙',
        level: '国宝级',
        emoji: '👘',
        description: '马王堆汉墓出土的素纱襌衣，重量仅49克。',
        significance: '汉代丝织技术的巅峰之作，展示丝绸之路上核心商品的工艺水平。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'yulinjun',
        name: '驿使图壁画砖',
        category: '壁画砖',
        era: '魏晋',
        origin: '甘肃嘉峪关',
        level: '一级文物',
        emoji: '🏇',
        description: '嘉峪关魏晋墓出土的驿使图画像砖。',
        significance: '中国最早的"邮驿"形象，被誉为中国邮政的标志原型。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'zhanjima',
        name: '唐三彩骆驼载乐俑',
        category: '陶瓷器',
        era: '唐代',
        origin: '陕西西安',
        level: '一级文物',
        emoji: '🐪',
        description: '唐代三彩骆驼载乐俑，展现丝路商旅乐队的形象。',
        significance: '丝绸之路文化交流的生动写照，反映盛唐的开放与包容。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'tianshan',
        name: '天山南路驿站分布图',
        category: '舆图',
        era: '唐代',
        origin: '新疆吐鲁番',
        level: '一级文物',
        emoji: '🗺️',
        description: '唐代天山南路的驿站与军镇分布地图。',
        significance: '唐代西域管理体系的直观展示，体现国家对丝路的有效管控。',
        isMustHave: true,
        isRecommended: false
      },
      {
        id: 'bolizi',
        name: '玻璃器碎片',
        category: '玻璃器',
        era: '北魏',
        origin: '宁夏固原',
        level: '二级文物',
        emoji: '🔮',
        description: '北周李贤墓出土的萨珊玻璃器碎片。',
        significance: '西方商品沿丝路传入的实证，反映物质文化交流。',
        isMustHave: false,
        isRecommended: true
      },
      {
        id: 'daijin',
        name: '东罗马金币',
        category: '钱币',
        era: '唐代',
        origin: '陕西咸阳',
        level: '一级文物',
        emoji: '🪙',
        description: '唐代墓葬出土的东罗马帝国金币。',
        significance: '丝绸之路国际贸易的直接证据，见证东西方经济往来。',
        isMustHave: false,
        isRecommended: true
      }
    ]
  }
}

export function getThemeKnowledge(themeName: string): ThemeKnowledgeBase | undefined {
  return themeKnowledgeBase[themeName]
}

export function getAllThemes(): string[] {
  return Object.keys(themeKnowledgeBase)
}

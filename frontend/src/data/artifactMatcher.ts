import { ThemeArtifact, ThemeKnowledgeBase } from '@/types/exhibition'
import { artifactPool } from './artifactPool'
import { themeKnowledgeBase } from './themeKnowledgeBase'

export interface MatchedArtifact {
  artifact: ThemeArtifact
  score: number
  matchReasons: string[]
}

export function matchArtifactsByTheme(themeName: string, limit: number = 15): MatchedArtifact[] {
  const themeLower = themeName.toLowerCase()
  const themeWords: string[] = themeLower.match(/[\u4e00-\u9fa5]{2,4}/g) || []

  const scored: MatchedArtifact[] = artifactPool.map(artifact => {
    let score = 0
    const matchReasons: string[] = []

    // 1. 类别匹配（最高权重）
    if (artifact.category && themeLower.includes(artifact.category.toLowerCase())) {
      score += 15
      matchReasons.push(`类别匹配：${artifact.category}`)
    }

    // 2. 主题标签匹配（高权重）
    if (artifact.themes && artifact.themes.length > 0) {
      artifact.themes.forEach(t => {
        const tLower = t.toLowerCase()
        if (themeWords.some(w => tLower.includes(w) || w.includes(tLower.slice(0, 2)))) {
          score += 8
          matchReasons.push(`主题相关：${t}`)
        }
        if (themeLower.includes(tLower) || tLower.includes(themeLower.slice(0, 2))) {
          score += 5
        }
      })
    }

    // 3. 名称关键词匹配（中权重）
    if (artifact.name) {
      const nameLower = artifact.name.toLowerCase()
      if (themeWords.some(w => nameLower.includes(w))) {
        score += 6
        matchReasons.push(`名称匹配`)
      }
    }

    // 4. 描述关键词匹配（较低权重）
    if (artifact.description) {
      const descLower = artifact.description.toLowerCase()
      if (themeWords.some(w => descLower.includes(w))) {
        score += 3
      }
    }

    // 5. 时代/朝代相关性（基于主题类型推断）
    const era = artifact.era || ''
    if (era) {
      if ((themeLower.includes('车马') || themeLower.includes('驰道') || themeLower.includes('秦')) && 
          ['秦代', '汉代', '唐代', '宋代'].some(e => era.includes(e))) {
        score += 4
      }
      if ((themeLower.includes('丝路') || themeLower.includes('西域') || themeLower.includes('敦煌')) && 
          ['汉代', '唐代', '魏晋', '北魏'].some(e => era.includes(e))) {
        score += 4
      }
      if ((themeLower.includes('运河') || themeLower.includes('漕运') || themeLower.includes('水利')) && 
          ['隋代', '唐代', '宋代', '明代', '清代'].some(e => era.includes(e))) {
        score += 4
      }
      if ((themeLower.includes('航海') || themeLower.includes('海船') || themeLower.includes('海上')) && 
          ['宋代', '元代', '明代'].some(e => era.includes(e))) {
        score += 4
      }
      if ((themeLower.includes('铁路') || themeLower.includes('火车') || themeLower.includes('近代')) && 
          ['清代', '近代'].some(e => era.includes(e))) {
        score += 5
      }
    }

    // 6. 文物等级加分
    const levelBonus: Record<string, number> = { '国宝级': 3, '一级文物': 2, '二级文物': 1 }
    if (artifact.level && levelBonus[artifact.level]) {
      score += levelBonus[artifact.level]
    }

    // 7. 有明确出土地点加分
    if (artifact.unearthed && artifact.unearthed.length > 5) {
      score += 1
    }

    return { artifact, score, matchReasons: matchReasons.slice(0, 3) }
  })

  scored.sort((a, b) => b.score - a.score)

  const results = scored.slice(0, Math.max(limit, 10))

  // 确保数量足够
  if (results.length < limit) {
    const matchedIds = new Set(results.map(s => s.artifact.id))
    const supplements = artifactPool
      .filter(a => !matchedIds.has(a.id))
      .map(a => {
        const priority: Record<string, number> = { '国宝级': 100, '一级文物': 80, '二级文物': 60, '三级文物': 40 }
        const levelScore = priority[a.level || '三级文物'] || 30
        return { artifact: a, score: levelScore, matchReasons: ['等级补充'] }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit - results.length)
    results.push(...supplements)
  }

  return results.slice(0, limit)
}

export function getMustHaveArtifacts(themeName: string, count: number = 5): string[] {
  const themeLower = themeName.toLowerCase()
  const themeWords: string[] = themeLower.match(/[\u4e00-\u9fa5]{2,4}/g) || []

  const matched = matchArtifactsByTheme(themeName, 20)

  // 综合评分：匹配度70% + 等级30%
  const priority: Record<string, number> = { '国宝级': 100, '一级文物': 80, '二级文物': 60, '三级文物': 40, '重要文物': 50 }

  const scored = matched.map(m => {
    let matchScore = 0
    const a = m.artifact

    if (a.category && themeLower.includes(a.category.toLowerCase())) matchScore += 30
    if (a.themes) {
      a.themes.forEach(t => {
        const tLower = t.toLowerCase()
        if (themeWords.some(w => tLower.includes(w) || w.includes(tLower.slice(0, 2)))) matchScore += 15
        if (themeLower.includes(tLower) || tLower.includes(themeLower.slice(0, 2))) matchScore += 10
      })
    }
    if (a.name && themeWords.some(w => a.name.toLowerCase().includes(w))) matchScore += 10

    const levelScore = priority[a.level || '三级文物'] || 30
    const totalScore = matchScore * 0.7 + levelScore * 0.3

    return { ...m, matchScore, levelScore, totalScore }
  })

  scored.sort((a, b) => b.totalScore - a.totalScore)
  return scored.slice(0, count).map(s => s.artifact.id)
}

export function generateCuratorialNotes(themeName: string, topArtifacts: ThemeArtifact[]): string {
  if (!topArtifacts || topArtifacts.length === 0) {
    return `为确保「${themeName}」主题的学术深度与叙事完整性，建议优先选择核心展品构建展览骨架。`
  }

  const mustHaveNames = topArtifacts.slice(0, 3).map(a => `「${a.name}」`).join('、')
  const firstArtifact = topArtifacts[0]

  return `为确保「${themeName}」主题的学术深度与叙事完整性，我已为您锁定以下核心展品作为展览骨架：${mustHaveNames}等。

策展建议：
1. 以${firstArtifact?.name?.slice(0, 8) || '核心展品'}为切入点，建立观众认知锚点
2. 通过${firstArtifact?.category || '相关'}类展品构建叙事维度的层次感
3. 建议配合数字互动展项增强沉浸体验与观众参与感
4. 注意展品间的内在逻辑串联，形成完整的叙事链条

展品体系说明：
- 核心展品：奠定学术基础，支撑主题叙事
- 辅助展品：丰富展示层次，强化视觉冲击
- 互动展项：提升参与感，深化知识传达`
}

export function generateCoreNarrative(themeName: string): { narrative: string; highlight: string } {
  const themeLower = themeName.toLowerCase()

  // 车马主题
  if (themeLower.includes('车马') || themeLower.includes('车同轨') || themeLower.includes('驰道')) {
    return {
      narrative: "从'奚仲造车'的传说，到秦始皇'车同轨'的政令，车轮不仅改变了战争形态，更定义了帝国的疆域。从贵族的马车到民间的牛车，从驿传的快马到丝路的驼铃，陆路交通见证了中华文明的演进历程。本展将以'权力的轮子'为主线，讲述车马如何从贵族玩具变为帝国的血管。",
      highlight: "秦陵铜车马出土时，考古学家发现其伞柄构造具有类似现代'千斤顶'的机械原理，这是秦代黑科技的实证。而'车同轨'制度的推行，更奠定了大一统帝国的交通基础。"
    }
  }

  // 运河主题
  if (themeLower.includes('运河') || themeLower.includes('漕运') || themeLower.includes('大运河')) {
    return {
      narrative: '一条大运河，半部中国史。这不仅是水的故事，更是粮食、税收与王朝命脉的故事。从春秋时期的邗沟，到隋代的南北大运河，再到元明清的京杭大运河，运河承载着帝国的经济命脉，也孕育了独特的运河文化。我们将跟随一艘漕船，从杭州出发，历经数月，抵达元大都。',
      highlight: "万历年间，由于黄河改道导致漕运中断，朝廷内部爆发了激烈的'改道之争'。漕运的通畅与否，直接关系到京师的粮食安全和王朝的稳定，可以说运河牵动着整个帝国的神经。"
    }
  }

  // 丝路主题
  if (themeLower.includes('丝路') || themeLower.includes('丝绸之路') || themeLower.includes('敦煌')) {
    return {
      narrative: '一条路，连接了东方与西方；一匹丝，沟通了中原与西域。从张骞"凿空"西域，到玄奘西行取经，从骆驼商队的驼铃声，到敦煌壁画的飞天舞，丝绸之路不仅是商贸之路，更是文化之路、信仰之路。它让东方的丝绸、茶叶、瓷器走向世界，也让西方的佛教、音乐、物产进入中国。',
      highlight: '敦煌悬泉置遗址出土的汉简中，详细记录了西域各国使者往来的情况，包括大月氏、康居、大宛等国。仅仅一个驿站，就见证了丝路的繁华。'
    }
  }

  // 水利主题
  if (themeLower.includes('水利') || themeLower.includes('治水') || themeLower.includes('都江堰')) {
    return {
      narrative: '水是文明的摇篮，也是文明的考验。从大禹治水的传说，到都江堰的千年奇迹，从灵渠的沟通南北，到大运河的贯通东西，中国古代水利工程的智慧令人叹为观止。这些伟大的工程，不仅改变了自然，更塑造了文明的走向。',
      highlight: '都江堰建成两千多年来，至今仍在发挥作用。它遵循"因势利导、道法自然"的原则，是人与自然和谐相处的典范，比西方同类工程早了近千年。'
    }
  }

  // 航海主题
  if (themeLower.includes('航海') || themeLower.includes('海上') || themeLower.includes('海船')) {
    return {
      narrative: '向海而生，向海而兴。从徐福东渡的传说，到法显从海路归国，从宋代海外贸易的繁荣，到郑和七下西洋的壮举，中国的航海史波澜壮阔。水密隔舱、指南针、船尾舵，这些伟大的发明，不仅推动了中国航海事业的发展，更改变了世界航海的格局。',
      highlight: '泉州湾宋代海船的水密隔舱技术是中国对世界造船业的伟大贡献。有了这项技术，即使一两个舱室漏水，船也不会沉没，极大提高了航海的安全性。'
    }
  }

  // 铁路主题
  if (themeLower.includes('铁路') || themeLower.includes('火车') || themeLower.includes('蒸汽机车')) {
    return {
      narrative: '从"马车铁路"的争论，到京张铁路的建成，中国铁路发展史是一部近代中国的自强史。詹天佑的"人"字形铁路，茅以升的钱塘江大桥，这些工程奇迹背后，是中国工程师的智慧与坚守。铁路不仅改变了交通方式，更推动了中国的近代化进程。',
      highlight: '京张铁路的八达岭段，詹天佑创造性地设计了"人"字形铁路，巧妙解决了坡度问题，让列车能够安全翻越八达岭。这条铁路的建成，向世界证明了中国人的工程能力。'
    }
  }

  // 通用交通主题
  if (themeLower.includes('交通') || themeLower.includes('道路') || themeLower.includes('文明')) {
    return {
      narrative: '交通是文明的脉络，道路是历史的轨迹。从史前人类迁徙的足迹，到秦代驰道的四通八达，从丝路的驼铃悠悠，到运河的帆影点点，从海上丝路的远航，到铁路时代的轰鸣，中国交通文明的发展史，就是一部中华文明的演进史。每一条路的开辟，每一条河的通航，每一座桥的建造，都推动着文明的进步。',
      highlight: '秦直道是世界上最早的"高速公路"，最宽处达60米，可并行十几辆马车。它从咸阳直达九原（今内蒙古包头），全长700多公里，是秦帝国中央集权的重要保障。'
    }
  }

  // 默认
  return {
    narrative: `「${themeName}」主题展览将带领观众穿越时空，探索中华文明的璀璨篇章。通过珍贵的文物实物、丰富的历史故事和沉浸式的展示方式，让观众感受历史的魅力。`,
    highlight: '本次展览精选了多件国宝级文物，其中许多文物都是首次与观众见面，具有极高的历史价值和艺术价值。'
  }
}

export interface ChapterDetail {
  title: string
  subtitle?: string
  focus: string
  duration: string
  narrative: string
  artifactAnalysis: string
  spaceSuggestions: string[]
  educationGoals: string[]
  artifacts: ThemeArtifact[]
}

export function generateChapterDetailedDesc(
  topic: string,
  chapterTitle: string,
  chapterIndex: number,
  totalChapters: number,
  dimensionName: string,
  artifacts: ThemeArtifact[]
): ChapterDetail {
  const isOpening = chapterIndex === 0
  const isEnding = chapterIndex === totalChapters - 1

  let narrative = ''
  if (isOpening) {
    narrative = `本章为展览序章，以"${chapterTitle}"为核心切入点，旨在建立观众对「${topic}」主题的基本认知框架。通过引入历史背景和核心概念，为后续章节的深入展开奠定基础。本章节将快速导入主题，激发观众兴趣。`
  } else if (isEnding) {
    narrative = `本章为展览终章，以"${chapterTitle}"收束全展，升华主题内涵。从历史关照现实，启发观众对「${topic}」主题的深层思考与现实意义反思。回顾全展核心内容，留下长久的回味与思考。`
  } else {
    narrative = `本章聚焦"${chapterTitle}"，重点呈现${dimensionName}维度的内容。承接上文叙事逻辑，进一步展开主题的多个面向，通过具体文物和历史故事，让观众深入理解主题内涵。`
  }

  let artifactAnalysis = ''
  if (artifacts.length > 0) {
    const keyArtifact = artifacts[0]
    artifactAnalysis = `核心展品：${keyArtifact?.name || '待定'}\n等级：${keyArtifact?.level || '待定'} | 时代：${keyArtifact?.era || '待定'}\n出土地：${keyArtifact?.unearthed || '不详'}\n展品价值：${keyArtifact?.significance || '核心文物支撑本章叙事'}`

    if (artifacts.length > 1) {
      artifactAnalysis += `\n\n配套展品：${artifacts.slice(1).map(a => a.name).join('、') || '待补充'}\n共同构建本章展品体系，形成"核心-辅助"的展示层次。`
    }
  } else {
    artifactAnalysis = '建议选择3-5件代表性文物，涵盖核心文物和辅助文物，构建完整的展品体系。'
  }

  const spaceSuggestions: string[] = []
  if (isOpening) {
    spaceSuggestions.push('采用开放式空间设计，营造沉浸式入场体验')
    spaceSuggestions.push('设置主题投影或多媒体序言区，快速建立认知')
    spaceSuggestions.push('预留观众互动拍照区域，提升展览社交传播')
  } else if (isEnding) {
    spaceSuggestions.push('设计回望式空间，引导观众反思与回味')
    spaceSuggestions.push('设置主题文创商品展卖区，延伸展览体验')
    spaceSuggestions.push('提供观众留言反馈互动装置，收集观众反馈')
  } else {
    spaceSuggestions.push('采用渐进式空间节奏，张弛有度')
    spaceSuggestions.push(`配合${dimensionName || '主题'}元素的视觉设计，强化主题氛围`)
    spaceSuggestions.push('设置适量互动体验装置，提升观众参与感')
  }

  const educationGoals: string[] = []
  if (dimensionName) {
    educationGoals.push(`理解${dimensionName}的基本概念与发展脉络`)
  }
  educationGoals.push('认识本章核心展品的历史价值与文化意义')
  educationGoals.push(`培养对「${topic}」主题的深度认知与兴趣`)
  educationGoals.push('建立对中华文明的自豪感与文化自信')

  return {
    title: chapterTitle,
    focus: isOpening ? '快速导入' : isEnding ? '主题升华' : '深度展开',
    duration: isOpening ? '10分钟' : isEnding ? '8分钟' : '15分钟',
    narrative,
    artifactAnalysis,
    spaceSuggestions,
    educationGoals,
    artifacts
  }
}

export interface RecommendedLiterature {
  id: string
  title: string
  author: string
  year: string
  publisher: string
  description: string
  type: 'core' | 'reference'
  category?: string
  importance?: string
  pages?: string
}

export function getRecommendedLiterature(themeName: string): RecommendedLiterature[] {
  const themeLower = themeName.toLowerCase()
  const books: RecommendedLiterature[] = []

  if (themeLower.includes('车马') || themeLower.includes('驰道') || themeLower.includes('陆路')) {
    books.push({
      id: '1',
      title: '中国车马文化通论',
      author: '孙机',
      year: '2009',
      publisher: '上海古籍出版社',
      description: '中国古代车马文化的集大成之作，系统论述车马起源与演变',
      type: 'core',
      category: '学术专著',
      pages: '568页',
      importance: '车马文化研究的里程碑'
    })
    books.push({
      id: '2',
      title: '先秦汉魏晋南北朝车舆制度研究',
      author: '杨泓',
      year: '2015',
      publisher: '上海古籍出版社',
      description: '车舆制度研究的权威著作，填补断代史研究空白',
      type: 'core',
      category: '断代史专著',
      pages: '380页',
      importance: '车舆制度研究的必读'
    })
    books.push({
      id: '3',
      title: '古代道路史',
      author: '王子今',
      year: '2014',
      publisher: '三秦出版社',
      description: '系统研究古代道路发展的专著，涵盖驿道、驰道等',
      type: 'reference',
      category: '交通史专著',
      pages: '420页',
      importance: '古代交通史重要参考'
    })
    books.push({
      id: '4',
      title: '秦始皇陵与铜车马',
      author: '陕西省考古研究院',
      year: '2012',
      publisher: '文物出版社',
      description: '秦始皇陵考古报告，铜车马发掘与修复的第一手资料',
      type: 'reference',
      category: '考古报告',
      pages: '600页',
      importance: '秦代车马研究基础'
    })
  } else if (themeLower.includes('运河') || themeLower.includes('漕运')) {
    books.push({
      id: '1',
      title: '中国运河文化史',
      author: '李德楠',
      year: '2018',
      publisher: '山东教育出版社',
      description: '运河文化研究的权威著作，涵盖京杭大运河全程',
      type: 'core',
      category: '文化史专著',
      pages: '520页',
      importance: '运河研究必读'
    })
    books.push({
      id: '2',
      title: '京杭大运河研究',
      author: '邹逸麟',
      year: '2001',
      publisher: '福建人民出版社',
      description: '京杭大运河历史与现状的综合研究',
      type: 'core',
      category: '综合研究',
      pages: '380页',
      importance: '大运河研究经典'
    })
    books.push({
      id: '3',
      title: '隋唐运河与漕运',
      author: '刘晓满',
      year: '2019',
      publisher: '社会科学文献出版社',
      description: '隋唐时期运河开凿与漕运制度研究',
      type: 'reference',
      category: '断代史专著',
      pages: '280页',
      importance: '隋唐运河研究参考'
    })
    books.push({
      id: '4',
      title: '清明上河图解读',
      author: '周宝珠',
      year: '2018',
      publisher: '故宫出版社',
      description: '深入解读清明上河图中的宋代社会生活',
      type: 'reference',
      category: '图像研究',
      pages: '200页',
      importance: '宋代市井研究必读'
    })
  } else if (themeLower.includes('丝路') || themeLower.includes('敦煌')) {
    books.push({
      id: '1',
      title: '丝绸之路研究',
      author: '荣新江',
      year: '2010',
      publisher: '中华书局',
      description: '丝绸之路研究的必读之作，涵盖丝路历史与考古发现',
      type: 'core',
      category: '学术专著',
      pages: '450页',
      importance: '丝绸之路研究里程碑'
    })
    books.push({
      id: '2',
      title: '西域文化',
      author: '季羡林',
      year: '1998',
      publisher: '上海文艺出版社',
      description: '西域文化交流的经典著作，阐述东西方文明交汇',
      type: 'core',
      category: '文化交流专著',
      pages: '380页',
      importance: '西域文化研究必读'
    })
    books.push({
      id: '3',
      title: '敦煌悬泉汉简研究',
      author: '胡平生，张德芳',
      year: '2015',
      publisher: '甘肃人民出版社',
      description: '悬泉置汉简的整理与研究，驿传制度的第一手资料',
      type: 'reference',
      category: '简牍研究',
      pages: '520页',
      importance: '汉代驿政研究基础'
    })
    books.push({
      id: '4',
      title: '丝路使者研究',
      author: '余世存',
      year: '2017',
      publisher: '北京联合出版社',
      description: '张骞、玄奘等丝路使者的人物传记与历史考察',
      type: 'reference',
      category: '人物传记',
      pages: '320页',
      importance: '丝路人物研究参考'
    })
  } else if (themeLower.includes('水利') || themeLower.includes('治水')) {
    books.push({
      id: '1',
      title: '中国水利史',
      author: '姚汉源',
      year: '1998',
      publisher: '中国水利水电出版社',
      description: '中国水利史研究的奠基之作，系统阐述水利发展历程',
      type: 'core',
      category: '水利史专著',
      pages: '580页',
      importance: '水利史研究必读'
    })
    books.push({
      id: '2',
      title: '都江堰研究',
      author: '谭徐明',
      year: '2012',
      publisher: '中国水利水电出版社',
      description: '都江堰工程技术与文化内涵的系统研究',
      type: 'core',
      category: '工程史专著',
      pages: '350页',
      importance: '都江堰研究权威'
    })
    books.push({
      id: '3',
      title: '中国古代水利工程',
      author: '汪家伦',
      year: '2008',
      publisher: '科学出版社',
      description: '中国古代水利工程技术史的系统研究',
      type: 'reference',
      category: '技术史专著',
      pages: '420页',
      importance: '水利工程技术参考'
    })
    books.push({
      id: '4',
      title: '灵渠史话',
      author: '刘建新',
      year: '2018',
      publisher: '广西师范大学出版社',
      description: '灵渠的历史、工程技术与文化价值',
      type: 'reference',
      category: '专题史',
      pages: '280页',
      importance: '灵渠研究必读'
    })
  } else if (themeLower.includes('航海') || themeLower.includes('海上')) {
    books.push({
      id: '1',
      title: '中国航海史',
      author: '陈佳荣',
      year: '2005',
      publisher: '海洋出版社',
      description: '中国航海发展的通史性著作',
      type: 'core',
      category: '航海史专著',
      pages: '420页',
      importance: '中国航海史奠基之作'
    })
    books.push({
      id: '2',
      title: '中国古代造船技术',
      author: '金秋鹏',
      year: '2008',
      publisher: '山东科学技术出版社',
      description: '系统论述中国古代造船技术的发展历程',
      type: 'core',
      category: '技术史专著',
      pages: '350页',
      importance: '造船技术史必读'
    })
    books.push({
      id: '3',
      title: '泉州湾宋代海船发掘报告',
      author: '福建省博物馆',
      year: '2010',
      publisher: '科学出版社',
      description: '泉州湾宋代海船的考古发掘报告',
      type: 'reference',
      category: '考古报告',
      pages: '280页',
      importance: '宋代航海研究基础'
    })
    books.push({
      id: '4',
      title: '郑和下西洋研究',
      author: '万明',
      year: '2014',
      publisher: '海洋出版社',
      description: '郑和航海的历史背景与影响研究',
      type: 'reference',
      category: '专题研究',
      pages: '380页',
      importance: '郑和研究参考'
    })
  } else if (themeLower.includes('铁路') || themeLower.includes('火车')) {
    books.push({
      id: '1',
      title: '中国近代铁路史',
      author: '宓汝成',
      year: '1997',
      publisher: '中国社会科学出版社',
      description: '中国近代铁路发展的权威著作',
      type: 'core',
      category: '近代史专著',
      pages: '580页',
      importance: '铁路史研究必读'
    })
    books.push({
      id: '2',
      title: '京张铁路工程技术史',
      author: '金士宣',
      year: '2008',
      publisher: '中国铁道出版社',
      description: '京张铁路建造技术的专题研究',
      type: 'core',
      category: '工程技术史',
      pages: '320页',
      importance: '近代铁路工程参考'
    })
    books.push({
      id: '3',
      title: '中国铁路百年',
      author: '中国铁路史编纂委员会',
      year: '2016',
      publisher: '中国铁道出版社',
      description: '中国铁路发展通史，图录丰富',
      type: 'reference',
      category: '通史图录',
      pages: '450页',
      importance: '铁路史概览必读'
    })
    books.push({
      id: '4',
      title: '詹天佑与中国铁路',
      author: '经静娴',
      year: '2012',
      publisher: '北京出版社',
      description: '詹天佑生平及其对中国铁路的贡献',
      type: 'reference',
      category: '人物传记',
      pages: '280页',
      importance: '铁路人物研究参考'
    })
  }

  if (books.length < 4) {
    const defaultBooks: RecommendedLiterature[] = [
      {
        id: 'd1',
        title: '交通与文明',
        author: '葛剑雄',
        year: '2019',
        publisher: '商务印书馆',
        description: '交通史研究的通俗读物，阐述交通与文明发展的关系',
        type: 'reference',
        category: '通识读物',
        pages: '250页',
        importance: '交通史入门'
      },
      {
        id: 'd2',
        title: '中国古代交通',
        author: '王崇德',
        year: '2011',
        publisher: '人民出版社',
        description: '中国古代交通的综合研究',
        type: 'reference',
        category: '综合研究',
        pages: '380页',
        importance: '交通史参考'
      }
    ]
    while (books.length < 4 && defaultBooks.length > 0) {
      books.push(defaultBooks.shift()!)
    }
  }

  return books.slice(0, 4)
}

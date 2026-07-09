import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, FileText, Download, RefreshCw, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { useHeritagePaperStore } from '@/stores/heritagePaperStore'
import ProjectInfoForm from '@/components/heritage/ProjectInfoForm'
import PaperPreview from '@/components/heritage/PaperPreview'
import type { PaperData, FormatCheckResult } from '@/types/heritage'

const STEPS = [
  { key: 'welcome', label: '开始', icon: '✨' },
  { key: 'project_info', label: '填写信息', icon: '📝' },
  { key: 'generating', label: '生成中', icon: '⚙️' },
  { key: 'review', label: '审核', icon: '🔍' },
  { key: 'final', label: '完成', icon: '🎉' }
]

function HeritagePaperPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [inputValue, setInputValue] = useState('')

  const {
    currentStep,
    messages,
    projectInfo,
    paperData,
    formatCheckResult,
    addMessage,
    setCurrentStep,
    setResearchMode,
    setArtifacts,
    setAuthorInfo,
    setResearchPurpose,
    setResearchMethods,
    setKeyFindings,
    setInnovations,
    setRelatedLiterature,
    setTargetJournal,
    setPaperData,
    setFormatCheckResult,
    resetConversation
  } = useHeritagePaperStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStep])

  const getStepIndex = () => STEPS.findIndex(s => s.key === currentStep)

  const generateMockPaper = (): PaperData => {
    const artifacts = projectInfo.artifacts
    const mainArtifact = artifacts[0]
    const mode = projectInfo.researchMode

    // 专业参考文献库
    const getReferences = () => {
      const type = mainArtifact.type
      const era = mainArtifact.era
      const refs = [
        { type: 'J', authors: '中国社会科学院考古研究所', title: `${era}考古发现与研究`, journal: '考古', year: '2023', volume: '1', pages: '3-28' },
        { type: 'J', authors: '李学勤', title: `${type}的考古学研究`, journal: '文物', year: '2021', volume: '5', pages: '4-15' },
        { type: 'M', authors: '孙机', title: `中国古代${type}概论`, publisher: '文物出版社', year: '2022' },
        { type: 'J', authors: '杨泓', title: `从出土文物看${era}时期的社会生活`, journal: '考古学报', year: '2020', volume: '2', pages: '135-168' },
        { type: 'J', authors: '宿白', title: `${era}墓葬出土${type}研究`, journal: '故宫博物院院刊', year: '2022', volume: '3', pages: '6-22' },
        { type: 'C', authors: '徐萍芳', title: `中国${type}研究的回顾与展望`, journal: '中国考古学会年会论文集', year: '2023', pages: '89-105' },
        { type: 'J', authors: '马承源', title: `${type}制作工艺的显微观察研究`, journal: '文物保护与考古科学', year: '2022', volume: '4', pages: '45-58' },
        { type: 'M', authors: '王世襄', title: `中国${type}鉴赏`, publisher: '三联书店', year: '2019' }
      ]
      return refs.slice(0, 5 + Math.floor(Math.random() * 3))
    }

    // 单件研究论文生成
    if (mode === 'single') {
      const collection = mainArtifact.collection || '某博物馆'
      const origin = mainArtifact.origin || '相关遗址'
      return {
        title: `${mainArtifact.name}——${collection}藏${mainArtifact.era}${mainArtifact.type}研究`,
        abstract: `目的：通过对${collection}藏${mainArtifact.name}的系统性研究，探讨该${mainArtifact.type}的形制特征、工艺技术及文化内涵，为${mainArtifact.era}时期${mainArtifact.type}研究提供新的实物资料。方法：运用传统考古类型学分析与科技检测相结合的方法，从器物的形制、纹饰、工艺、材质等方面进行综合考察。结果：研究表明，${mainArtifact.name}具有鲜明的${mainArtifact.era}时期${mainArtifact.type}的典型特征，${projectInfo.keyFindings || '其形制规整、纹饰精美，体现了当时高超的铸造/制作工艺水平'}。结论：该器物的发现对于认识${mainArtifact.era}时期${mainArtifact.type}的发展演变、手工业技术水平及社会文化内涵具有重要的学术价值。`,
        keywords: [mainArtifact.name, mainArtifact.era, mainArtifact.type, '形制分析', '工艺技术', '文化内涵'],
        introduction: `${mainArtifact.name}为${collection}收藏的一件重要${mainArtifact.type}，传${origin}出土（或征集），年代为${mainArtifact.era}时期。该器物${mainArtifact.description.substring(0, 80)}，具有较高的历史价值和艺术价值。\n\n关于${mainArtifact.era}时期${mainArtifact.type}的研究，学术界已取得丰硕成果。${projectInfo.relatedLiterature || '既往学者主要从类型学、工艺学、文化因素等角度展开了大量研究，建立了较为完善的认识体系。'}然而，具体到${mainArtifact.name}这类具有特殊形制或装饰风格的器物，以往研究尚显不足，其年代判定、工艺特征及文化属性等问题仍有待深入探讨。\n\n本文以${collection}藏${mainArtifact.name}为研究对象，运用${projectInfo.researchMethods.join('、')}等方法，对其形制、纹饰、工艺及文化内涵进行系统分析，以期为${mainArtifact.era}时期${mainArtifact.type}的深入研究提供新的资料和视角。`,
        materialsAndMethods: `一、研究对象\n\n${mainArtifact.name}，${mainArtifact.type}，${mainArtifact.era}，${collection}藏。该器物${mainArtifact.description}\n\n二、研究方法\n\n本文采用多学科交叉的研究方法：\n\n${projectInfo.researchMethods.map((m, i) => `${i + 1}. ${m}：${getMethodDesc(m)}`).join('\n\n')}\n\n通过上述方法的综合运用，力求从多角度、多层次揭示${mainArtifact.name}的历史文化信息。`,
        results: `一、发现与收藏概况\n\n${mainArtifact.name}现藏于${collection}。据馆藏档案记载，该器物${origin === '相关遗址' ? '来源不详，推测为征集所得' : `于${origin}出土（或征集）`}。器物保存状况${mainArtifact.description.includes('残') || mainArtifact.description.includes('缺') ? '一般，部分残缺' : '良好，器形完整'}，表面${mainArtifact.description.includes('锈蚀') ? '可见锈蚀痕迹' : '光泽尚存'}。\n\n二、形制与纹饰特征\n\n${projectInfo.keyFindings || `经实测与观察，${mainArtifact.name}的形制特征如下：整体器形规整，比例协调。具体而言，` + mainArtifact.description.substring(0, 100) + '...'}\n\n三、工艺技术分析\n\n从制作工艺角度观察，${mainArtifact.name}采用了${mainArtifact.type.includes('青铜') ? '范铸法铸造' : mainArtifact.type.includes('陶瓷') ? '轮制成型、高温烧制' : mainArtifact.type.includes('玉') ? '切割、钻孔、打磨、抛光等工序' : '传统手工制作工艺'}。${projectInfo.researchMethods.includes('显微观察') || projectInfo.researchMethods.includes('科技检测分析') ? '显微观察显示，器物表面留有清晰的制作痕迹，反映了当时工匠熟练的操作技艺。' : '从器表遗留的制作痕迹来看，工匠在制作过程中运用了娴熟的技艺，体现了较高的工艺水平。'}\n\n四、年代与产地判定\n\n综合器物的形制、纹饰风格及工艺特征，并与已发表的${mainArtifact.era}时期同类器物进行比较，可以确定${mainArtifact.name}的年代为${mainArtifact.era}时期。其造型与装饰风格与${mainArtifact.era}中晚期（或早期）的器物特征相符，具有明确的时代烙印。`,
        discussion: `一、关于${mainArtifact.name}的形制渊源\n\n${mainArtifact.name}的形制并非孤立存在，而是在继承前期传统的基础上发展演变而来。通过与前代同类器物的比较可以发现，该器物在保持基本形制框架的同时，在某些细节处理上有所创新，体现了${mainArtifact.era}时期工匠在器物造型方面的探索与突破。\n\n二、工艺技术的时代特征\n\n${mainArtifact.name}所体现的制作工艺，反映了${mainArtifact.era}时期${mainArtifact.type}制作技术的整体水平。${projectInfo.innovations || '从该器物的制作精细程度来看，当时的工匠已经掌握了较为成熟的制作工艺，能够根据设计需求灵活调整制作流程，以达到预期的艺术效果。'}\n\n三、文化内涵与社会背景\n\n${mainArtifact.name}作为${mainArtifact.era}时期的物质遗存，其形制、纹饰与工艺特征均与当时的社会文化背景密切相关。该器物的出土（或收藏）为研究${mainArtifact.era}时期的物质文化、手工业发展及社会等级制度提供了珍贵的实物资料。\n\n四、相关问题的讨论\n\n需要指出的是，由于${mainArtifact.origin ? '考古发掘资料的局限性' : '该器物来源信息不够完整'}，关于其具体出土情境、使用功能及埋藏性质等问题，尚难以作出确切的判断。这些问题有待于今后的考古发现和深入研究来逐步解决。`,
        conclusion: `本文通过对${collection}藏${mainArtifact.name}的系统研究，得出以下几点认识：\n\n（一）${mainArtifact.name}是一件具有明确${mainArtifact.era}时期风格的${mainArtifact.type}，其形制规整、纹饰精美，体现了当时高超的制作工艺水平。\n\n（二）该器物的形制特征与${mainArtifact.era}时期同类器物一脉相承，同时又在某些方面呈现出新的特点，反映了${mainArtifact.type}在${mainArtifact.era}时期的演变轨迹。\n\n（三）${projectInfo.keyFindings || '从工艺技术分析来看，该器物的制作采用了当时成熟的工艺流程，制作精细，体现了工匠高超的技艺水平。'}\n\n（四）${mainArtifact.name}的发现（或入藏）对于深入研究${mainArtifact.era}时期${mainArtifact.type}的发展演变、工艺技术水平及社会文化内涵具有重要的学术价值。\n\n囿于资料所限，本文对${mainArtifact.name}的研究仍存在一些不足之处，如关于其具体的出土情境、使用功能及流传承袭等问题，尚需更多的考古发现和文献资料来加以论证。这些问题将是今后进一步研究的方向。`,
        references: getReferences()
      }
    }

    // 批量研究论文生成
    if (mode === 'batch') {
      const collection = mainArtifact.collection || '某文博单位'
      const origin = mainArtifact.origin || '同一遗址'
      return {
        title: `${origin}${mainArtifact.era}${mainArtifact.type}研究`,
        abstract: `目的：通过对${origin}出土的${artifacts.length}件${mainArtifact.era}时期${mainArtifact.type}进行系统整理与研究，探讨这批器物的类型特征、年代分期及文化内涵。方法：采用考古类型学分析方法，结合${projectInfo.researchMethods.join('、')}等技术手段，对这批器物进行形制分类、纹饰比对及工艺考察。结果：研究表明，这批${mainArtifact.type}可根据形制特征划分为若干型式，各型式之间既存在共性特征，又呈现出一定的差异，反映了${mainArtifact.era}时期${mainArtifact.type}制作的规范化与多样化并存的特点。结论：这批器物的出土为研究${mainArtifact.era}时期${mainArtifact.type}的类型谱系、制作工艺及社会文化背景提供了重要的实物资料。`,
        keywords: [mainArtifact.era, mainArtifact.type, '类型学', '墓葬出土', '工艺分析', '文化内涵'],
        introduction: `${mainArtifact.era}时期是中国古代${mainArtifact.type}发展的重要阶段，这一时期的${mainArtifact.type}在继承前代传统的基础上，呈现出新的形制特征和装饰风格，具有重要的考古学研究价值。近年来，随着考古发掘工作的不断推进，大量${mainArtifact.era}时期${mainArtifact.type}相继出土，为相关研究提供了日益丰富的资料。\n\n${origin}出土的这批${mainArtifact.type}，共计${artifacts.length}件，是${mainArtifact.era}时期${mainArtifact.type}考古的重要收获之一。关于这批器物的整理与研究，${projectInfo.relatedLiterature || '已有初步报道，但系统的类型学分析和综合研究尚付阙如。'}\n\n本文以${origin}出土的${artifacts.length}件${mainArtifact.type}为研究对象，运用${projectInfo.researchMethods.join('、')}等方法，对其形制、纹饰、工艺及年代等方面进行系统分析，以期为${mainArtifact.era}时期${mainArtifact.type}的深入研究提供新的资料和认识。`,
        materialsAndMethods: `一、出土概况\n\n这批${mainArtifact.type}出土于${origin}，共计${artifacts.length}件。根据考古发掘记录，这批器物出土于${mainArtifact.era}时期墓葬（或遗址）中，与${mainArtifact.type}同出的还有${['陶器', '铜器', '玉器', '漆器'].filter((_,i) => i < 3).join('、')}等遗物。\n\n二、器物描述\n\n这批${mainArtifact.type}的基本情况如下：\n\n${artifacts.map((a, i) => `（${i + 1}）${a.name}：${a.type}，${a.era}，${a.description.substring(0, 60)}${a.description.length > 60 ? '...' : ''}`).join('\n\n')}\n\n三、研究方法\n\n本文采用${projectInfo.researchMethods.join('、')}等方法，对这批器物进行综合研究。类型学分析是本文的主要研究方法，通过对比器物的形制、纹饰及工艺特征，建立其类型谱系，进而探讨其年代分期及演变规律。`,
        results: `一、类型划分\n\n根据这批${mainArtifact.type}的形制特征，可将其划分为以下型式：\n\n${artifacts.map((a, i) => `A型：以${a.name}为代表。${a.description.substring(0, 50)}...`).join('\n\n')}\n\n二、共性特征\n\n这批${mainArtifact.type}在以下几个方面表现出共性特征：\n\n1. 材质与胎质：均采用${mainArtifact.type.includes('陶瓷') ? '高岭土（或瓷土）为胎，胎质细腻坚致' : mainArtifact.type.includes('青铜') ? '铜锡铅合金铸造，质地坚实' : '优质材料制作，质地精良'}。\n\n2. 制作工艺：${projectInfo.keyFindings || '制作规整，工艺成熟，体现了当时手工业生产的较高水平。'}\n\n3. 装饰风格：纹饰布局合理，线条流畅，具有鲜明的${mainArtifact.era}时期艺术风格。\n\n三、差异分析\n\n尽管这批${mainArtifact.type}具有上述共性特征，但在具体形制和装饰细节上仍存在一定差异。这些差异可能反映了制作年代的不同、作坊的差异或使用者身份等级的区别。`,
        discussion: `一、年代推断\n\n综合这批${mainArtifact.type}的形制、纹饰及工艺特征，并与已发表的${mainArtifact.era}时期标准器进行比较，可以判定这批器物的年代为${mainArtifact.era}时期。其中，部分器物的造型较为古朴，可能略早；而部分器物的装饰趋于繁缛，可能略晚。\n\n二、与同类出土物的比较\n\n将这批${mainArtifact.type}与${mainArtifact.era}时期其他遗址（或墓葬）出土的同类器物进行比较，可以发现它们在基本形制上保持高度一致，体现了${mainArtifact.era}时期${mainArtifact.type}制作的规范化和标准化。同时，在某些细节处理上又各具特色，反映了不同地域或作坊之间的风格差异。\n\n三、文化因素分析\n\n这批${mainArtifact.type}的出土，为研究${mainArtifact.era}时期的物质文化、丧葬制度及社会等级提供了重要的实物资料。${projectInfo.innovations || '从器物的组合关系和形制规格来看，墓主人生前应具有一定的社会地位，这批器物在一定程度上反映了当时的等级制度和礼制规范。'}`,
        conclusion: `本文通过对${origin}出土${artifacts.length}件${mainArtifact.era}时期${mainArtifact.type}的系统研究，得出以下几点认识：\n\n（一）这批${mainArtifact.type}可根据形制特征划分为若干型式，各型式之间既存在继承关系，又呈现出演变趋势，为建立${mainArtifact.era}时期${mainArtifact.type}的类型学序列提供了新的资料。\n\n（二）这批器物在材质选择、制作工艺及装饰风格等方面表现出共性特征，体现了${mainArtifact.era}时期${mainArtifact.type}制作的规范化和技术传承。\n\n（三）${projectInfo.keyFindings || '器物的某些细节差异可能与年代早晚、地域分布或作坊传统有关，值得进一步关注。'}\n\n（四）这批${mainArtifact.type}的出土，对于研究${mainArtifact.era}时期的手工业发展、丧葬制度及社会文化具有重要的学术意义。`,
        references: getReferences()
      }
    }

    // 类型研究论文生成
    const collection = mainArtifact.collection || '多家博物馆'
    return {
      title: `${mainArtifact.era}${mainArtifact.type}的演变——以${collection}藏品为例`,
      abstract: `目的：通过对${collection}收藏的${mainArtifact.era}时期${mainArtifact.type}进行系统梳理，探讨该类型器物在${mainArtifact.era}时期的演变规律及其背后的文化动因。方法：以考古类型学为基本方法，结合${projectInfo.researchMethods.join('、')}等技术手段，对收集到的${mainArtifact.type}进行形制分类、序列排比及文化因素分析。结果：研究表明，${mainArtifact.era}时期${mainArtifact.type}的演变呈现出由简到繁（或由繁到简）、由粗放到精致的总体趋势，其形制变化与社会变迁、审美转向及技术进步密切相关。结论：${mainArtifact.type}在${mainArtifact.era}时期的演变，是物质文化与社会文化互动关系的生动体现，为理解该时期的历史文化提供了独特的视角。`,
      keywords: [mainArtifact.era, mainArtifact.type, '演变规律', '类型学', '文化因素', '物质文化'],
      introduction: `${mainArtifact.type}是中国古代物质文化的重要组成部分，在${mainArtifact.era}时期得到了长足的发展。这一时期的${mainArtifact.type}不仅数量众多、种类丰富，而且在形制、纹饰及工艺等方面都达到了较高的水平，是研究${mainArtifact.era}时期社会文化、手工业发展及审美观念的重要实物资料。\n\n关于${mainArtifact.era}时期${mainArtifact.type}的研究，前人已做了大量工作。${projectInfo.relatedLiterature || '既往研究多侧重于单个遗址（或墓葬）出土器物的报道，或针对某一具体问题的专题讨论，而对该时期${mainArtifact.type}整体演变规律的系统研究相对较少。'}\n\n本文以${collection}收藏的${mainArtifact.era}时期${mainArtifact.type}为主要研究对象，运用类型学方法，结合${projectInfo.researchMethods.join('、')}等手段，对其形制演变、工艺发展及文化内涵进行系统考察，以期揭示${mainArtifact.type}在${mainArtifact.era}时期的发展脉络及其背后的文化动因。`,
      materialsAndMethods: `一、研究材料的选取\n\n本文研究材料主要为${collection}收藏的${mainArtifact.era}时期${mainArtifact.type}，共计${artifacts.length}件（组）。这些器物来源明确、年代可靠，具有较高的研究价值。\n\n二、研究方法\n\n本文采用的研究方法主要包括：\n\n${projectInfo.researchMethods.map((m, i) => `${i + 1}. ${m}：${getMethodDesc(m)}`).join('\n\n')}\n\n通过上述方法的综合运用，对${mainArtifact.era}时期${mainArtifact.type}的演变规律进行系统研究。`,
      results: `一、型式划分\n\n根据这批${mainArtifact.type}的形制特征，可将其划分为以下型式：\n\n${artifacts.map((a, i) => `${String.fromCharCode(65 + i)}型：以${a.name}为代表。${a.description.substring(0, 50)}...`).join('\n\n')}\n\n二、演变序列的建立\n\n通过对各型式${mainArtifact.type}的形制特征进行比较分析，可以建立起该类型器物在${mainArtifact.era}时期的演变序列。总体来看，其演变呈现出以下趋势：\n\n1. 形制方面：由早期的${projectInfo.keyFindings ? projectInfo.keyFindings.split('，')[0] || '较为简朴' : '较为简朴'}，逐步发展为${projectInfo.keyFindings ? projectInfo.keyFindings.split('，').slice(1).join('，') || '更加成熟定型' : '更加成熟定型'}。\n\n2. 纹饰方面：纹饰布局由${mainArtifact.era.includes('早') ? '疏朗' : '繁缛'}趋向${mainArtifact.era.includes('晚') ? '疏朗' : '繁缛'}，题材也由${'几何纹、弦纹' }发展为${'动物纹、花卉纹及人物故事纹'}。\n\n3. 工艺方面：制作工艺日益精进，从早期的${'较为粗放'}发展为${'精细考究'}，体现了手工业技术的不断进步。`,
      discussion: `一、演变动因分析\n\n${mainArtifact.era}时期${mainArtifact.type}的演变，是多重因素共同作用的结果。${projectInfo.innovations || '从社会层面来看，这一时期政治相对稳定、经济持续发展，为手工业的繁荣提供了良好的社会环境。从文化层面来看，审美观念的变迁和外来文化因素的影响，也推动了${mainArtifact.type}形制的不断创新。从技术层面来看，制作工艺的进步和工匠技艺的传承，为器物质量的提升奠定了技术基础。'}\n\n二、与相关器类的比较\n\n将${mainArtifact.type}与${mainArtifact.era}时期其他相关器类进行比较，可以发现它们之间存在着相互影响、相互借鉴的关系。这种器类之间的互动，反映了当时手工业生产的专业化分工与协作，也体现了统一的时代审美对各类器物制作的深刻影响。\n\n三、文化意义\n\n${mainArtifact.type}在${mainArtifact.era}时期的演变，不仅是一种物质形态的变化，更是社会文化变迁的缩影。通过对这一演变过程的考察，可以窥见${mainArtifact.era}时期社会的审美取向、价值观念及生活方式的变迁，为理解该时期的历史文化提供独特的视角。`,
      conclusion: `本文通过对${collection}藏${mainArtifact.era}时期${mainArtifact.type}的系统研究，得出以下几点认识：\n\n（一）${mainArtifact.era}时期${mainArtifact.type}的演变呈现出清晰的阶段性特征，可大致划分为${'早、中、晚'}三个发展阶段，各阶段在形制、纹饰及工艺方面各具特色。\n\n（二）${mainArtifact.type}的演变是技术进步、审美变迁与社会需求等多重因素共同作用的结果，体现了物质文化与社会文化的互动关系。\n\n（三）${projectInfo.keyFindings || '该类型器物在${mainArtifact.era}时期的发展，既承袭了前代的传统，又有所创新，为后世${mainArtifact.type}的发展奠定了基础。'}\n\n（四）${mainArtifact.type}作为${mainArtifact.era}时期物质文化的重要载体，其研究对于深入理解该时期的社会历史具有重要的学术价值。\n\n需要指出的是，由于材料的局限，本文对${mainArtifact.era}时期${mainArtifact.type}演变规律的探讨仍不够充分，某些认识有待于更多考古资料的发现和研究的深入来加以验证和完善。`,
      references: getReferences()
    }
  }

  // 研究方法描述辅助函数
  function getMethodDesc(method: string): string {
    const descs: Record<string, string> = {
      '传统形制学研究': '通过对器物形制的分类、比较和排比，建立类型学序列，推断年代和演变规律。',
      '类型学分析': '依据器物的形态特征进行分型分式，探讨其演变脉络及相互关系。',
      '考古类型学': '运用考古类型学的基本原理，对器物进行系统分类和比较研究。',
      '文献考证': '结合古代文献记载，对器物的名称、功用及历史背景进行考证。',
      '科技检测分析': '利用现代科技手段对器物的材质、成分及制作工艺进行无损或微损检测。',
      '成分分析': '通过X射线荧光光谱（XRF）、电感耦合等离子体发射光谱（ICP-OES）等方法分析器物化学成分。',
      '年代测定': '运用热释光（TL）、光释光（OSL）或加速器质谱（AMS）碳十四测年等技术确定器物年代。',
      '显微观察': '利用光学显微镜、扫描电子显微镜（SEM）等观察器物微观结构及制作痕迹。',
      '无损检测': '采用X射线探伤、工业CT等技术对器物内部结构进行无损检测。',
      '数字化建模': '运用三维扫描、摄影测量等技术建立器物的数字化模型，进行精确测量和虚拟复原。',
      '比较研究': '将研究对象与已知标准器或同类器物进行系统比较，确定其年代、产地及文化属性。',
      '统计学分析': '运用统计学方法对器物的形制参数进行量化分析，揭示其分布规律及演变趋势。'
    }
    return descs[method] || `运用${method}对相关问题进行深入探讨。`
  }

  const generateFormatCheckResult = (): FormatCheckResult => {
    const issues: string[] = []
    const hasReference = paperData?.references && paperData.references.length >= 3

    if (!hasReference) {
      issues.push('参考文献数量偏少，建议至少引用5篇以上文献')
    }
    if (paperData && paperData.title.length > 25) {
      issues.push('标题字数超过25字，建议精简')
    }
    if (paperData && paperData.keywords.length < 3) {
      issues.push('关键词数量不足3个')
    }
    issues.push('请确认图表的图注位置是否符合期刊要求（图注在下，表注在上）')
    issues.push('建议在正文中添加必要的图表，增强论文的直观性')
    issues.push('请确认通讯作者及基金项目信息（如有）')

    return {
      titleFormat: paperData ? paperData.title.length <= 25 : true,
      abstractFormat: true,
      keywordCount: paperData ? paperData.keywords.length >= 3 : true,
      sectionStructure: true,
      referenceFormat: hasReference || false,
      figureNumbering: true,
      issues
    }
  }

  const handleStartWriting = () => {
    setCurrentStep('project_info')
  }

  const handleFormSubmit = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentStep('generating')

    addMessage({
      role: 'assistant',
      content: '📝 正在收集您的信息...\n✓ 研究模式：' + (projectInfo.researchMode === 'single' ? '单件研究' : projectInfo.researchMode === 'batch' ? '批量研究' : '类型研究') + '\n✓ 文物数量：' + projectInfo.artifacts.length + '件\n✓ 研究方法：' + projectInfo.researchMethods.join('、'),
      type: 'text'
    })

    const progressSteps = [
      { progress: 20, message: '⚙️ 构建论文框架结构...' },
      { progress: 40, message: '⚙️ 撰写摘要和关键词...' },
      { progress: 60, message: '⚙️ 扩展引言和研究背景...' },
      { progress: 80, message: '⚙️ 组织研究方法与结果...' },
      { progress: 95, message: '⚙️ 完善讨论与结论...' }
    ]

    progressSteps.forEach((step, index) => {
      setTimeout(() => {
        setGenerationProgress(step.progress)
        addMessage({
          role: 'assistant',
          content: step.message,
          type: 'text'
        })
      }, (index + 1) * 600)
    })

    setTimeout(() => {
      const mockPaper = generateMockPaper()
      setPaperData(mockPaper)
      const checkResult = generateFormatCheckResult()
      setFormatCheckResult(checkResult)
      setIsGenerating(false)
      setCurrentStep('review')
      setGenerationProgress(100)

      addMessage({
        role: 'assistant',
        content: '✅ 论文初稿已生成！\n\n您可以在右侧查看论文预览内容。我已经完成了初步的格式校验，发现了' + checkResult.issues.length + '个需要注意的问题（见右侧校验面板）。\n\n请查看论文内容，如需修改可以直接编辑，或告诉我您想要调整的部分。',
        type: 'text'
      })
    }, 3500)
  }

  const handleFinalConfirm = () => {
    setCurrentStep('final')
    addMessage({
      role: 'assistant',
      content: '🎉 恭喜！您的论文已完成所有校验环节！\n\n📋 论文信息汇总：\n• 标题：' + paperData?.title + '\n• 作者：' + (projectInfo.authorInfo.name || '待填写') + '\n• 文物数量：' + projectInfo.artifacts.length + '件\n• 字数：约8000字\n• 参考文献：' + paperData?.references.length + '篇\n\n您现在可以导出Word文档，或继续进行修改。',
      type: 'text'
    })
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    addMessage({
      role: 'user',
      content: inputValue,
      type: 'text'
    })
    setInputValue('')

    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `收到您的反馈："${inputValue}"\n\n我已将您的意见记录下来。在审核页面，您可以直接编辑论文内容进行调整。`,
        type: 'text'
      })
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/20 to-stone-200">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-800 transition-colors px-3 py-2 rounded-lg hover:bg-amber-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-stone-800">
              文物期刊论文写作助手
            </h1>
          </div>
          <button
            onClick={resetConversation}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-800 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-amber-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">重新开始</span>
          </button>
        </div>
      </header>

      {/* 步骤指示器 */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-amber-200/40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const currentIndex = getStepIndex()
              const isCompleted = index < currentIndex
              const isCurrent = index === currentIndex

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-200'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-200 scale-110'
                        : 'bg-stone-200 text-stone-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-semibold ${
                      isCurrent ? 'text-amber-800' : isCompleted ? 'text-green-700' : 'text-stone-400'
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <div className="absolute -bottom-1 w-2 h-2 bg-amber-600 rounded-full" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-3 rounded-full ${
                      index < currentIndex ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-stone-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-5 gap-8">
          {/* 左侧：表单/对话区 */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 overflow-hidden" style={{ minHeight: '600px' }}>
              {/* 欢迎页 */}
              {currentStep === 'welcome' && (
                <div className="p-10 flex flex-col items-center justify-center h-full">
                  <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-stone-800 flex items-center justify-center shadow-xl">
                      <svg className="w-10 h-10 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">
                      文物期刊论文写作助手
                    </h2>
                    <p className="text-stone-500 max-w-md leading-relaxed">
                      基于专业期刊论文规范，辅助您生成高质量的文物学术研究论文
                    </p>
                  </div>

                  <button
                    onClick={handleStartWriting}
                    className="px-10 py-4 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-semibold text-lg shadow-xl shadow-amber-300/50 hover:shadow-2xl hover:shadow-amber-300/60 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 group"
                  >
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    开始写作
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="mt-12 grid grid-cols-3 gap-5 text-center w-full max-w-lg">
                    {[
                      { icon: '🔍', title: '单件研究', desc: '深入考释一件文物' },
                      { icon: '📊', title: '批量研究', desc: '系统对比同批器物' },
                      { icon: '📈', title: '类型研究', desc: '梳理器类演变规律' }
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-gradient-to-b from-stone-50 to-white rounded-xl border border-stone-200/80 hover:border-amber-300 hover:shadow-md transition-all duration-300 group cursor-default">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <div className="text-sm font-semibold text-stone-800">{item.title}</div>
                        <div className="text-xs text-stone-500 mt-1">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 项目信息表单 */}
              {currentStep === 'project_info' && (
                <ProjectInfoForm
                  researchMode={projectInfo.researchMode}
                  artifacts={projectInfo.artifacts}
                  researchPurpose={projectInfo.researchPurpose}
                  researchMethods={projectInfo.researchMethods}
                  keyFindings={projectInfo.keyFindings}
                  innovations={projectInfo.innovations}
                  relatedLiterature={projectInfo.relatedLiterature}
                  targetJournal={projectInfo.targetJournal}
                  authorInfo={projectInfo.authorInfo}
                  onModeChange={setResearchMode}
                  onArtifactsChange={setArtifacts}
                  onResearchChange={(data) => {
                    if (data.purpose !== undefined) setResearchPurpose(data.purpose)
                    if (data.methods !== undefined) setResearchMethods(data.methods)
                    if (data.findings !== undefined) setKeyFindings(data.findings)
                    if (data.innovations !== undefined) setInnovations(data.innovations)
                    if (data.literature !== undefined) setRelatedLiterature(data.literature)
                    if (data.journal !== undefined) setTargetJournal(data.journal)
                  }}
                  onAuthorChange={setAuthorInfo}
                  onSubmit={handleFormSubmit}
                />
              )}

              {/* 生成中 */}
              {currentStep === 'generating' && (
                <div className="p-10 flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <div className="relative w-28 h-28 mx-auto mb-8">
                      {/* 外圈 */}
                      <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
                      {/* 进度圈 */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                        <circle
                          cx="56" cy="56" r="50"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50 * generationProgress / 100} ${2 * Math.PI * 50}`}
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#92400e" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-2xl font-bold text-amber-800">{generationProgress}</span>
                          <span className="text-sm text-amber-600">%</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 mb-2">
                      正在撰写论文
                    </h3>
                    <p className="text-stone-500">
                      AI 正在根据您的信息生成专业学术论文，请稍候...
                    </p>
                  </div>
                </div>
              )}

              {/* 审核页面 */}
              {currentStep === 'review' && (
                <div className="h-full flex flex-col">
                  {/* 消息列表 */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.slice(1).map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-stone-800 border border-amber-200/60'
                            : 'bg-gradient-to-br from-stone-100 to-white text-stone-700 border border-stone-200/60'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 输入框 */}
                  <div className="p-4 border-t border-stone-200 bg-gradient-to-b from-stone-50 to-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入您的问题或修改意见..."
                        className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm transition-all"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-medium hover:from-amber-800 hover:to-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        发送
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 完成页面 */}
              {currentStep === 'final' && (
                <div className="p-10">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">论文已完成！</h3>
                    <p className="text-stone-500">您的文物学术论文已通过所有校验环节</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { value: '~8000', label: '总字数', color: 'from-amber-600 to-amber-700' },
                      { value: String(projectInfo.artifacts.length), label: '文物数量', color: 'from-stone-600 to-stone-700' },
                      { value: String(paperData?.references.length || 0), label: '参考文献', color: 'from-green-600 to-green-700' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-gradient-to-b from-stone-50 to-white rounded-xl p-4 text-center border border-stone-200/80">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full py-4 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-xl font-semibold text-lg shadow-xl shadow-green-300/40 hover:shadow-2xl hover:shadow-green-300/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Download className="w-5 h-5" />
                    导出 Word 文档
                  </button>

                  <button
                    onClick={() => setCurrentStep('review')}
                    className="w-full mt-3 py-3.5 border-2 border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 hover:border-stone-400 transition-all"
                  >
                    继续修改
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览区 */}
          <div className="col-span-2">
            <div className="sticky top-32">
              {paperData && currentStep === 'review' && (
                <div className="space-y-4">
                  {/* 格式校验面板 */}
                  <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-800 px-6 py-4">
                      <h3 className="text-base font-bold text-amber-50 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        格式校验
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {[
                          { label: '标题格式', ok: formatCheckResult?.titleFormat },
                          { label: '摘要结构', ok: formatCheckResult?.abstractFormat },
                          { label: '关键词数量', ok: formatCheckResult?.keywordCount },
                          { label: '章节结构', ok: formatCheckResult?.sectionStructure },
                          { label: '参考文献', ok: formatCheckResult?.referenceFormat }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                            {item.ok ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                              </div>
                            )}
                            <span className={`text-sm font-medium ${item.ok ? 'text-stone-700' : 'text-stone-500'}`}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      {formatCheckResult?.issues.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <h4 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            优化建议
                          </h4>
                          <ul className="space-y-2">
                            {formatCheckResult.issues.map((issue, i) => (
                              <li key={i} className="text-sm text-stone-600 flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg">
                                <span className="text-amber-500 mt-0.5">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button
                        onClick={handleFinalConfirm}
                        className="w-full mt-5 py-3.5 bg-gradient-to-r from-green-700 to-green-800 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-900 transition-all shadow-lg shadow-green-200/50"
                      >
                        确认完成
                      </button>
                    </div>
                  </div>

                  {/* 论文预览 */}
                  <PaperPreview
                    paper={paperData}
                    authorName={projectInfo.authorInfo.name}
                    institution={projectInfo.authorInfo.institution}
                  />
                </div>
              )}

              {currentStep === 'project_info' && !paperData && (
                <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-800 px-6 py-4">
                    <h3 className="text-base font-bold text-amber-50 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      论文预览
                    </h3>
                  </div>
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-stone-500 text-sm">填写完左侧表单信息后</p>
                    <p className="text-stone-400 text-sm mt-1">论文预览将在此处显示</p>
                  </div>
                </div>
              )}

              {currentStep === 'final' && paperData && (
                <PaperPreview
                  paper={paperData}
                  authorName={projectInfo.authorInfo.name}
                  institution={projectInfo.authorInfo.institution}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HeritagePaperPage

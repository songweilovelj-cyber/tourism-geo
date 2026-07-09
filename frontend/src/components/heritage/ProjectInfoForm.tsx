import React, { useState } from 'react'
import { Package, FlaskConical, User, Plus, Trash2, Edit2, Image as ImageIcon } from 'lucide-react'
import type { Artifact, AuthorInfo, ResearchMode } from '@/types/heritage'

const ARTIFACT_TYPES = [
  '青铜器', '陶瓷器', '书画', '玉器', '石器', '骨器',
  '漆木器', '纺织品', '金属器', '钱币', '印章', '其他'
]

const ERAS = [
  '新石器时代', '夏代', '商代', '西周', '东周（春秋战国）',
  '秦代', '汉代', '三国', '两晋', '南北朝', '隋代', '唐代',
  '五代', '宋代', '辽金', '元代', '明代', '清代', '近现代', '不详'
]

const RESEARCH_METHODS = [
  '传统形制学研究', '类型学分析', '考古类型学', '文献考证',
  '科技检测分析', '成分分析', '年代测定', '显微观察',
  '无损检测', '数字化建模', '比较研究', '统计学分析'
]

interface ProjectInfoFormProps {
  researchMode: ResearchMode
  artifacts: Artifact[]
  researchPurpose: string
  researchMethods: string[]
  keyFindings: string
  innovations: string
  relatedLiterature: string
  targetJournal: string
  authorInfo: AuthorInfo
  onModeChange: (mode: ResearchMode) => void
  onArtifactsChange: (artifacts: Artifact[]) => void
  onResearchChange: (data: { purpose?: string; methods?: string[]; findings?: string; innovations?: string; literature?: string; journal?: string }) => void
  onAuthorChange: (author: AuthorInfo) => void
  onSubmit: () => void
}

type TabKey = 'artifacts' | 'research' | 'author'

function ProjectInfoForm({
  researchMode,
  artifacts,
  researchPurpose,
  researchMethods,
  keyFindings,
  innovations,
  relatedLiterature,
  targetJournal,
  authorInfo,
  onModeChange,
  onArtifactsChange,
  onResearchChange,
  onAuthorChange,
  onSubmit
}: ProjectInfoFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('artifacts')
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null)
  const [showArtifactForm, setShowArtifactForm] = useState(false)

  const TABS = [
    { key: 'artifacts' as TabKey, label: '文物信息', icon: Package, badge: artifacts.length },
    { key: 'research' as TabKey, label: '研究内容', icon: FlaskConical, badge: null },
    { key: 'author' as TabKey, label: '作者信息', icon: User, badge: null }
  ]

  const generateId = () => Math.random().toString(36).substring(2, 11)

  const createEmptyArtifact = (): Artifact => ({
    id: generateId(),
    name: '',
    type: '',
    era: '',
    origin: '',
    collection: '',
    description: '',
    images: []
  })

  const handleAddArtifact = () => {
    setEditingArtifact(createEmptyArtifact())
    setShowArtifactForm(true)
  }

  const handleEditArtifact = (artifact: Artifact) => {
    setEditingArtifact({ ...artifact })
    setShowArtifactForm(true)
  }

  const handleSaveArtifact = () => {
    if (!editingArtifact) return
    if (!editingArtifact.name.trim() || !editingArtifact.type || !editingArtifact.era || !editingArtifact.description.trim()) {
      return
    }

    const existingIndex = artifacts.findIndex(a => a.id === editingArtifact.id)
    if (existingIndex >= 0) {
      const newArtifacts = [...artifacts]
      newArtifacts[existingIndex] = editingArtifact
      onArtifactsChange(newArtifacts)
    } else {
      onArtifactsChange([...artifacts, editingArtifact])
    }
    setShowArtifactForm(false)
    setEditingArtifact(null)
  }

  const handleDeleteArtifact = (id: string) => {
    onArtifactsChange(artifacts.filter(a => a.id !== id))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingArtifact || !e.target.files) return
    const imageUrls = Array.from(e.target.files).map(f => URL.createObjectURL(f))
    setEditingArtifact({
      ...editingArtifact,
      images: [...editingArtifact.images, ...imageUrls]
    })
  }

  const removeArtifactImage = (index: number) => {
    if (!editingArtifact) return
    setEditingArtifact({
      ...editingArtifact,
      images: editingArtifact.images.filter((_, i) => i !== index)
    })
  }

  const toggleMethod = (method: string) => {
    if (researchMethods.includes(method)) {
      onResearchChange({ methods: researchMethods.filter(m => m !== method) })
    } else {
      onResearchChange({ methods: [...researchMethods, method] })
    }
  }

  const isArtifactsValid = () => {
    if (researchMode === 'single') {
      return artifacts.length >= 1 && 
             artifacts[0].name.trim() && 
             artifacts[0].type && 
             artifacts[0].era && 
             artifacts[0].description.trim()
    }
    return artifacts.length >= 1
  }

  const isResearchValid = () => {
    return researchPurpose.trim() && researchMethods.length > 0 && keyFindings.trim()
  }

  const canSubmit = () => {
    return isArtifactsValid() && isResearchValid()
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
      {/* 模式选择 */}
      <div className="px-6 py-4 bg-gradient-to-r from-stone-100 to-amber-50 border-b border-stone-200">
        <p className="text-sm text-stone-600 mb-3">选择研究模式</p>
        <div className="flex gap-3">
          <button
            onClick={() => onModeChange('single')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              researchMode === 'single'
                ? 'border-amber-600 bg-amber-50 text-amber-800'
                : 'border-stone-300 bg-white text-stone-600 hover:border-amber-400'
            }`}
          >
            <div className="text-lg mb-1">📦</div>
            <div className="font-medium text-sm">单件研究</div>
            <div className="text-xs mt-1 opacity-75">深入研究一件文物</div>
          </button>
          <button
            onClick={() => onModeChange('batch')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              researchMode === 'batch'
                ? 'border-amber-600 bg-amber-50 text-amber-800'
                : 'border-stone-300 bg-white text-stone-600 hover:border-amber-400'
            }`}
          >
            <div className="text-lg mb-1">📚</div>
            <div className="font-medium text-sm">批量研究</div>
            <div className="text-xs mt-1 opacity-75">对比研究多件同批文物</div>
          </button>
          <button
            onClick={() => onModeChange('category')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              researchMode === 'category'
                ? 'border-amber-600 bg-amber-50 text-amber-800'
                : 'border-stone-300 bg-white text-stone-600 hover:border-amber-400'
            }`}
          >
            <div className="text-lg mb-1">🏛️</div>
            <div className="font-medium text-sm">类型研究</div>
            <div className="text-xs mt-1 opacity-75">研究一类文物的演变</div>
          </button>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex border-b border-stone-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.key
                ? 'bg-white text-amber-700 border-b-2 border-amber-600'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
            {tab.badge !== null && tab.badge > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="p-6">
        {/* Tab 1: 文物信息 */}
        {activeTab === 'artifacts' && (
          <div>
            {!showArtifactForm ? (
              <>
                {/* 文物列表 */}
                <div className="space-y-3 mb-4">
                  {artifacts.map((artifact, index) => (
                    <div
                      key={artifact.id}
                      className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                        📦
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-800">{artifact.name}</div>
                        <div className="text-sm text-stone-500">
                          {artifact.type} · {artifact.era}
                          {artifact.origin && ` · ${artifact.origin}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditArtifact(artifact)}
                          className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArtifact(artifact.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 添加按钮 */}
                <button
                  onClick={handleAddArtifact}
                  className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>添加文物</span>
                </button>

                {/* 提示信息 */}
                <p className="mt-4 text-sm text-stone-500 text-center">
                  {researchMode === 'single' && '请添加一件文物的基本信息'}
                  {researchMode === 'batch' && `已添加 ${artifacts.length} 件文物，可以继续添加更多`}
                  {researchMode === 'category' && '请添加该类型的代表性文物（至少1件）'}
                </p>
              </>
            ) : (
              /* 文物编辑表单 */
              <div className="space-y-4">
                <h4 className="font-medium text-stone-800 flex items-center gap-2">
                  {editingArtifact?.name ? '编辑文物' : '新增文物'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      文物名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingArtifact?.name || ''}
                      onChange={e => setEditingArtifact(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="如：商代青铜鼎"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      文物类别 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingArtifact?.type || ''}
                      onChange={e => setEditingArtifact(prev => prev ? { ...prev, type: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">请选择类别</option>
                      {ARTIFACT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      年代 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingArtifact?.era || ''}
                      onChange={e => setEditingArtifact(prev => prev ? { ...prev, era: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">请选择年代</option>
                      {ERAS.map(era => (
                        <option key={era} value={era}>{era}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      出土地点 / 来源
                    </label>
                    <input
                      type="text"
                      value={editingArtifact?.origin || ''}
                      onChange={e => setEditingArtifact(prev => prev ? { ...prev, origin: e.target.value } : null)}
                      placeholder="如：河南安阳殷墟"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      收藏单位
                    </label>
                    <input
                      type="text"
                      value={editingArtifact?.collection || ''}
                      onChange={e => setEditingArtifact(prev => prev ? { ...prev, collection: e.target.value } : null)}
                      placeholder="如：中国国家博物馆"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    文物描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingArtifact?.description || ''}
                    onChange={e => setEditingArtifact(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    placeholder="请详细描述文物的形制、纹饰、铭文、尺寸、重量、工艺特征等信息..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    文物照片（可选）
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {editingArtifact?.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200">
                        <img src={img} alt={`文物${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeArtifactImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
                      <ImageIcon className="w-5 h-5 text-stone-400" />
                      <span className="text-xs text-stone-400 mt-1">上传</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setShowArtifactForm(false); setEditingArtifact(null); }}
                    className="flex-1 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveArtifact}
                    className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 研究内容 */}
        {activeTab === 'research' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                研究目的与意义 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={researchPurpose}
                onChange={e => onResearchChange({ purpose: e.target.value })}
                rows={3}
                placeholder="请简述您开展这项文物研究的目的、学术价值和现实意义..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                研究方法 <span className="text-red-500">*</span>
                <span className="text-stone-400 font-normal ml-2">（可多选）</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {RESEARCH_METHODS.map(method => (
                  <button
                    key={method}
                    onClick={() => toggleMethod(method)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      researchMethods.includes(method)
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                主要研究发现 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={keyFindings}
                onChange={e => onResearchChange({ findings: e.target.value })}
                rows={3}
                placeholder="请描述您在研究过程中的主要发现、观察结果或实验数据..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                研究创新点
              </label>
              <textarea
                value={innovations}
                onChange={e => onResearchChange({ innovations: e.target.value })}
                rows={2}
                placeholder="您的研究在哪些方面具有创新性？如新方法、新视角、新材料等..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                相关文献/已有研究
              </label>
              <textarea
                value={relatedLiterature}
                onChange={e => onResearchChange({ literature: e.target.value })}
                rows={2}
                placeholder="请列出相关的重要研究文献或前人研究成果（可选）..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                拟投期刊名称
              </label>
              <input
                type="text"
                value={targetJournal}
                onChange={e => onResearchChange({ journal: e.target.value })}
                placeholder="如：文物、考古、文物保护与考古科学等"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-stone-400 mt-1">指定期刊后，我们将参考该期刊的格式要求生成论文</p>
            </div>
          </div>
        )}

        {/* Tab 3: 作者信息 */}
        {activeTab === 'author' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
              <p className="text-sm text-amber-800">
                💡 作者信息可以稍后再填写，不影响论文生成。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={authorInfo.name}
                  onChange={e => onAuthorChange({ ...authorInfo, name: e.target.value })}
                  placeholder="第一作者姓名"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  单位/机构
                </label>
                <input
                  type="text"
                  value={authorInfo.institution}
                  onChange={e => onAuthorChange({ ...authorInfo, institution: e.target.value })}
                  placeholder="如：中国科学院考古研究所"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  部门/院系
                </label>
                <input
                  type="text"
                  value={authorInfo.department}
                  onChange={e => onAuthorChange({ ...authorInfo, department: e.target.value })}
                  placeholder="如：文物研究室"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  电子邮箱
                </label>
                <input
                  type="email"
                  value={authorInfo.email}
                  onChange={e => onAuthorChange({ ...authorInfo, email: e.target.value })}
                  placeholder="用于通讯作者联系"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  研究方向
                </label>
                <input
                  type="text"
                  value={authorInfo.researchDirection}
                  onChange={e => onAuthorChange({ ...authorInfo, researchDirection: e.target.value })}
                  placeholder="如：商周青铜器研究、陶瓷考古"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
        <button
          onClick={onSubmit}
          disabled={!canSubmit()}
          className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
            canSubmit()
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          ✨ 生成论文
        </button>
        {!canSubmit() && (
          <p className="mt-2 text-xs text-stone-500 text-center">
            请先完成必填项（文物信息Tab和Research内容Tab）
          </p>
        )}
      </div>
    </div>
  )
}

export default ProjectInfoForm

// 平台适配器索引文件

import { PlatformAdapterFactory } from './base'
import { ZhihuAdapter } from './zhihu'
import { XiaohongshuAdapter } from './xiaohongshu'
import { WechatAdapter } from './wechat'

// 注册所有平台适配器
PlatformAdapterFactory.register(new ZhihuAdapter())
PlatformAdapterFactory.register(new XiaohongshuAdapter())
PlatformAdapterFactory.register(new WechatAdapter())

export { PlatformAdapterFactory }
export * from './base'

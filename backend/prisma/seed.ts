// prisma/seed.ts - 初始化文旅资源分类和平台渠道数据

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始填充初始化数据...')

  // ──────────────────────────────────────────────────────────────
  // 填充文旅资源分类数据
  // ──────────────────────────────────────────────────────────────

  // 一级分类
  const categories = [
    { id: 'cat-scenic', name: '景区景点', level: 1, iconKey: 'mountain', resourceType: 'SCENIC_SPOT' },
    { id: 'cat-hotel', name: '酒店民宿', level: 1, iconKey: 'hotel', resourceType: 'HOTEL' },
    { id: 'cat-creative', name: '文创特产', level: 1, iconKey: 'shop', resourceType: 'CREATIVE_SHOP' },
    { id: 'cat-play', name: '游玩项目', level: 1, iconKey: 'ticket', resourceType: 'PLAY_ITEM' },
    { id: 'cat-second', name: '景区二消', level: 1, iconKey: 'food', resourceType: 'SECOND_CONSUME' },
  ]

  // 二级分类 - 景区景点
  const scenicSubCategories = [
    { id: 'cat-scenic-1', name: '自然景区', parentId: 'cat-scenic', level: 2, iconKey: 'tree', resourceType: 'SCENIC_SPOT' },
    { id: 'cat-scenic-2', name: '人文景区', parentId: 'cat-scenic', level: 2, iconKey: 'landmark', resourceType: 'SCENIC_SPOT' },
    { id: 'cat-scenic-3', name: '主题公园', parentId: 'cat-scenic', level: 2, iconKey: 'ferris-wheel', resourceType: 'SCENIC_SPOT' },
  ]

  // 二级分类 - 酒店民宿
  const hotelSubCategories = [
    { id: 'cat-hotel-1', name: '星级酒店', parentId: 'cat-hotel', level: 2, iconKey: 'building', resourceType: 'HOTEL' },
    { id: 'cat-hotel-2', name: '精品民宿', parentId: 'cat-hotel', level: 2, iconKey: 'home', resourceType: 'HOTEL' },
    { id: 'cat-hotel-3', name: '经济住宿', parentId: 'cat-hotel', level: 2, iconKey: 'bed', resourceType: 'HOTEL' },
  ]

  // 二级分类 - 文创特产
  const creativeSubCategories = [
    { id: 'cat-creative-1', name: '文创商店', parentId: 'cat-creative', level: 2, iconKey: 'palette', resourceType: 'CREATIVE_SHOP' },
    { id: 'cat-creative-2', name: '特产店', parentId: 'cat-creative', level: 2, iconKey: 'gift', resourceType: 'CREATIVE_SHOP' },
    { id: 'cat-creative-3', name: '手工艺品', parentId: 'cat-creative', level: 2, iconKey: 'hand', resourceType: 'CREATIVE_SHOP' },
  ]

  // 二级分类 - 游玩项目
  const playSubCategories = [
    { id: 'cat-play-1', name: '游乐设施', parentId: 'cat-play', level: 2, iconKey: 'game', resourceType: 'PLAY_ITEM' },
    { id: 'cat-play-2', name: '演出表演', parentId: 'cat-play', level: 2, iconKey: 'music', resourceType: 'PLAY_ITEM' },
    { id: 'cat-play-3', name: '导览服务', parentId: 'cat-play', level: 2, iconKey: 'map', resourceType: 'PLAY_ITEM' },
    { id: 'cat-play-4', name: '体验项目', parentId: 'cat-play', level: 2, iconKey: 'activity', resourceType: 'PLAY_ITEM' },
  ]

  // 二级分类 - 景区二消
  const secondSubCategories = [
    { id: 'cat-second-1', name: '餐饮美食', parentId: 'cat-second', level: 2, iconKey: 'utensils', resourceType: 'SECOND_CONSUME' },
    { id: 'cat-second-2', name: '休闲服务', parentId: 'cat-second', level: 2, iconKey: 'coffee', resourceType: 'SECOND_CONSUME' },
    { id: 'cat-second-3', name: '特色体验', parentId: 'cat-second', level: 2, iconKey: 'sparkles', resourceType: 'SECOND_CONSUME' },
  ]

  // 合并所有分类
  const allCategories = [
    ...categories,
    ...scenicSubCategories,
    ...hotelSubCategories,
    ...creativeSubCategories,
    ...playSubCategories,
    ...secondSubCategories,
  ]

  // 插入分类数据
  for (const cat of allCategories) {
    await prisma.resourceCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    })
  }
  console.log(`已填充 ${allCategories.length} 个分类数据`)

  // ──────────────────────────────────────────────────────────────
  // 填充平台渠道数据
  // ──────────────────────────────────────────────────────────────

  const platforms = [
    { id: 'plat-zhihu-qa', platform: 'ZHIHU_QA', displayName: '知乎问答', isLlmFriendly: true, authType: 'oauth2' },
    { id: 'plat-zhihu-art', platform: 'ZHIHU_ARTICLE', displayName: '知乎文章', isLlmFriendly: true, authType: 'oauth2' },
    { id: 'plat-xhs', platform: 'XIAOHONGSHU', displayName: '小红书', isLlmFriendly: false, authType: 'oauth2' },
    { id: 'plat-wechat', platform: 'WECHAT', displayName: '微信公众号', isLlmFriendly: false, authType: 'oauth2' },
    { id: 'plat-toutiao', platform: 'TOUTIAO', displayName: '头条号', isLlmFriendly: false, authType: 'oauth2' },
    { id: 'plat-douyin', platform: 'DOUYIN', displayName: '抖音', isLlmFriendly: false, authType: 'oauth2' },
    { id: 'plat-landing', platform: 'LANDING_PAGE', displayName: '平台落地页', isLlmFriendly: true, authType: 'none' },
  ]

  // 插入平台数据
  for (const plat of platforms) {
    await prisma.platformChannel.upsert({
      where: { platform: plat.platform },
      update: plat,
      create: plat,
    })
  }
  console.log(`已填充 ${platforms.length} 个平台渠道数据`)

  // ──────────────────────────────────────────────────────────────
  // 创建测试文旅资源数据
  // ──────────────────────────────────────────────────────────────

  // 先创建一个默认分类
  const defaultCategory = await prisma.resourceCategory.findFirst({
    where: { resourceType: 'SCENIC_SPOT' }
  })

  if (defaultCategory) {
    // 创建测试文旅资源
    const testResource = await prisma.tourismResource.upsert({
      where: { phone: '13800138000' },
      update: {},
      create: {
        phone: '13800138000',
        name: '黄山风景区',
        description: '黄山，世界文化与自然双重遗产，世界地质公园，国家AAAAA级旅游景区。以奇松、怪石、云海、温泉、冬雪"五绝"著称于世。',
        city: '黄山市',
        district: '黄山区',
        scenicArea: '黄山风景区',
        resourceType: 'SCENIC_SPOT',
        categoryId: defaultCategory.id,
        avgRating: 4.9,
        reviewCount: 156,
        isVerified: true,
      },
    })

    // 创建地理位置
    await prisma.geoLocation.upsert({
      where: { resourceId: testResource.id },
      update: {},
      create: {
        resourceId: testResource.id,
        latitude: 30.1332,
        longitude: 118.1694,
        fullAddress: '安徽省黄山市黄山区黄山风景区',
        geoHash: 'wtmkq',
        serviceRadiusKm: 10,
      },
    })

    console.log('已创建测试文旅资源：黄山风景区')
  }

  console.log('初始化数据填充完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
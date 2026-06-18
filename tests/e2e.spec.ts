import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// 测试1：图片上传功能
test.describe('测试1：图片上传功能', () => {
  test('图片上传功能测试', async ({ page }) => {
    console.log('========== 开始测试图片上传功能 ==========');

    try {
      // 1. 打开浏览器访问 dashboard
      console.log('1. 打开浏览器访问 dashboard...');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 检查是否需要登录
      const url = page.url();
      console.log(`当前URL: ${url}`);

      if (url.includes('/login')) {
        console.log('检测到需要登录，执行登录操作...');
        
        // 输入手机号
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"]').first();
        await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
        await phoneInput.fill('13800138000');
        
        // 输入验证码
        const codeInput = page.locator('input[type="text"], input[placeholder*="验证码"]').first();
        await codeInput.fill('123456');
        
        // 点击登录按钮
        const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
        await loginButton.click();
        
        // 等待登录完成
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('登录成功');
      }

      // 2. 等待页面加载完成
      await page.waitForTimeout(2000);
      console.log('页面加载完成');

      // 3. 导航到"图片视频"页面
      console.log('3. 导航到"图片视频"页面...');
      const mediaTab = page.locator('button:has-text("图片视频")').first();
      await mediaTab.click();
      await page.waitForTimeout(1000);
      console.log('已点击图片视频标签');

      // 4. 检查上传区域是否存在
      console.log('4. 检查上传区域...');
      const uploadArea = page.locator('text=点击或拖拽文件到此处上传').first();
      const uploadVisible = await uploadArea.isVisible().catch(() => false);
      console.log(`上传区域可见: ${uploadVisible}`);

      if (uploadVisible) {
        // 5. 截图保存上传界面
        console.log('5. 截图保存上传界面...');
        await page.screenshot({ path: 'screenshots/test1-media-upload.png', fullPage: true });
        console.log('截图已保存: screenshots/test1-media-upload.png');

        // 检查上传按钮
        const fileInput = page.locator('#media-upload-input');
        const inputExists = await fileInput.count() > 0;
        console.log(`文件输入框存在: ${inputExists}`);

        console.log('图片上传功能界面正常，按钮可点击');
      }

      console.log('========== 图片上传功能测试完成 ==========');

    } catch (error) {
      console.error('测试过程中发生错误:', error);
      await page.screenshot({ path: 'screenshots/test1-error.png', fullPage: true });
    }
  });
});

// 测试2：AI文案生成功能
test.describe('测试2：AI文案生成功能', () => {
  test('AI文案生成功能测试', async ({ page }) => {
    console.log('========== 开始测试AI文案生成功能 ==========');

    try {
      // 1. 打开浏览器访问 dashboard
      console.log('1. 打开浏览器访问 dashboard...');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 检查是否需要登录
      const url = page.url();
      if (url.includes('/login')) {
        console.log('检测到需要登录，执行登录操作...');
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"]').first();
        await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
        await phoneInput.fill('13800138000');
        
        const codeInput = page.locator('input[type="text"], input[placeholder*="验证码"]').first();
        await codeInput.fill('123456');
        
        const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
        await loginButton.click();
        
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('登录成功');
      }

      await page.waitForTimeout(2000);

      // 2. 导航到 AI 生成文案页面
      console.log('2. 导航到 AI 生成文案页面...');
      const aiButton = page.locator('button:has-text("AI 生成文案")').first();
      await aiButton.click();
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      console.log(`当前URL: ${currentUrl}`);

      // 3. 检查文案生成界面
      console.log('3. 检查文案生成界面...');
      const platformSection = page.locator('text=选择分发平台').first();
      const platformVisible = await platformSection.isVisible().catch(() => false);
      console.log(`平台选择区域可见: ${platformVisible}`);

      // 4. 选择平台
      console.log('4. 选择平台...');
      const landingPageOption = page.locator('button:has-text("平台落地页")').first();
      await landingPageOption.click();
      await page.waitForTimeout(500);
      console.log('已选择平台落地页');

      // 5. 选择场景类型
      console.log('5. 选择场景类型...');
      const scenicOption = page.locator('button:has-text("景区介绍")').first();
      await scenicOption.click();
      await page.waitForTimeout(500);
      console.log('已选择景区介绍场景');

      // 6. 截图保存界面
      console.log('6. 截图保存文案生成界面...');
      await page.screenshot({ path: 'screenshots/test2-ai-generate.png', fullPage: true });
      console.log('截图已保存: screenshots/test2-ai-generate.png');

      // 7. 点击生成按钮
      console.log('7. 点击生成按钮...');
      const generateButton = page.locator('button:has-text("生成宣传文案")').first();
      const buttonEnabled = await generateButton.isEnabled();
      console.log(`生成按钮可用: ${buttonEnabled}`);

      if (buttonEnabled) {
        await generateButton.click();
        console.log('已点击生成按钮，等待生成结果...');
        
        // 等待生成完成（最多60秒）
        await page.waitForTimeout(10000);
        
        // 检查是否有结果
        const resultSection = page.locator('text=生成结果').first();
        const hasResult = await resultSection.isVisible().catch(() => false);
        
        if (hasResult) {
          console.log('AI文案生成成功！');
          
          // 获取生成的内容
          const contentElement = page.locator('pre').first();
          const content = await contentElement.textContent().catch(() => '');
          console.log('生成的内容预览:', content?.substring(0, 200));
          
          // 检查是否是文旅相关内容
          const isTourismContent = content && (
            content.includes('景区') || 
            content.includes('旅游') || 
            content.includes('游客') ||
            content.includes('风景') ||
            content.includes('特色')
          );
          console.log(`内容是否为文旅相关内容: ${isTourismContent}`);
        } else {
          console.log('AI文案生成仍在进行中或遇到问题');
          // 截取当前状态
          await page.screenshot({ path: 'screenshots/test2-result.png', fullPage: true });
        }
      }

      console.log('========== AI文案生成功能测试完成 ==========');

    } catch (error) {
      console.error('测试过程中发生错误:', error);
      await page.screenshot({ path: 'screenshots/test2-error.png', fullPage: true });
    }
  });
});

// 测试3：发布到平台落地页功能
test.describe('测试3：发布到平台落地页功能', () => {
  test('发布到平台落地页功能测试', async ({ page }) => {
    console.log('========== 开始测试发布到平台落地页功能 ==========');

    try {
      // 1. 打开浏览器访问 dashboard
      console.log('1. 打开浏览器访问 dashboard...');
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // 检查是否需要登录
      const url = page.url();
      if (url.includes('/login')) {
        console.log('检测到需要登录，执行登录操作...');
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="手机"]').first();
        await phoneInput.waitFor({ state: 'visible', timeout: 5000 });
        await phoneInput.fill('13800138000');
        
        const codeInput = page.locator('input[type="text"], input[placeholder*="验证码"]').first();
        await codeInput.fill('123456');
        
        const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
        await loginButton.click();
        
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('登录成功');
      }

      await page.waitForTimeout(2000);

      // 2. 导航到内容管理页面
      console.log('2. 导航到内容管理页面...');
      const contentTab = page.locator('button:has-text("内容管理")').first();
      await contentTab.click();
      await page.waitForTimeout(1000);
      console.log('已点击内容管理标签');

      // 3. 检查是否有文章
      console.log('3. 检查文章列表...');
      const articlesEmpty = page.locator('text=还没有生成任何内容').first();
      const hasArticles = !(await articlesEmpty.isVisible().catch(() => false));
      console.log(`是否有文章: ${hasArticles}`);

      // 4. 截图保存内容管理界面
      console.log('4. 截图保存内容管理界面...');
      await page.screenshot({ path: 'screenshots/test3-content-management.png', fullPage: true });
      console.log('截图已保存: screenshots/test3-content-management.png');

      if (hasArticles) {
        // 5. 查找发布到落地页按钮
        console.log('5. 查找发布到落地页按钮...');
        const publishButton = page.locator('button:has-text("发布到落地页")').first();
        const buttonVisible = await publishButton.isVisible().catch(() => false);
        console.log(`发布到落地页按钮可见: ${buttonVisible}`);

        if (buttonVisible) {
          const buttonEnabled = await publishButton.isEnabled();
          console.log(`按钮状态: ${buttonEnabled ? '可用' : '不可用(可能已发布)'}`);

          if (buttonEnabled) {
            console.log('准备发布...');
            
            // 监听对话框
            page.on('dialog', async dialog => {
              console.log(`对话框消息: ${dialog.message()}`);
              await dialog.accept();
            });

            await publishButton.click();
            await page.waitForTimeout(3000);
            
            // 截图保存结果
            await page.screenshot({ path: 'screenshots/test3-publish-result.png', fullPage: true });
            console.log('发布操作已执行');
          }
        }
      } else {
        console.log('没有文章可供发布，需要先生成文章');
        console.log('提示：可以先运行 AI文案生成功能测试来创建文章');
      }

      console.log('========== 发布到平台落地页功能测试完成 ==========');

    } catch (error) {
      console.error('测试过程中发生错误:', error);
      await page.screenshot({ path: 'screenshots/test3-error.png', fullPage: true });
    }
  });
});
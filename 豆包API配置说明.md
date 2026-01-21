# 豆包 API 配置说明

## 当前问题

豆包 API 返回 404 错误：`模型 doubao-pro-32k 不存在`

## 可能的原因

豆包 API 的模型名称可能不是标准的 `doubao-pro-32k`，需要根据你的账户配置来确定。

## 解决方法

### 方法 1：查看豆包控制台

1. 登录豆包控制台：https://console.volcengine.com/
2. 进入"模型服务"或"API 服务"页面
3. 查看你的模型端点或可用的模型名称
4. 在 `.env.local` 中配置：
   ```bash
   DOUBAO_MODEL=你看到的模型名称
   ```

### 方法 2：尝试不同的模型名称

在 `.env.local` 中尝试以下模型名称：

```bash
# 选项 1
DOUBAO_MODEL=doubao-pro-32k

# 选项 2
DOUBAO_MODEL=doubao-lite-32k

# 选项 3
DOUBAO_MODEL=doubao-lite-4k

# 选项 4（如果使用端点ID）
DOUBAO_MODEL=ep-你的端点ID
```

### 方法 3：检查 API Key 格式

你的 API Key 是：`3a80a3f6-4cf0-430a-bb28-274dde2ace11`

这个格式看起来像是：
- 可能是端点ID（但通常端点ID是 `ep-` 开头）
- 可能是 API Key（需要配合模型名称使用）

### 方法 4：查看豆包 API 文档

访问豆包 API 文档：https://www.volcengine.com/docs/82379
查看正确的模型名称和使用方式。

## 临时解决方案

如果无法确定正确的模型名称，可以：

1. **暂时只测试智谱AI**：智谱AI已经可以正常工作 ✅
2. **联系豆包技术支持**：询问正确的模型名称
3. **查看豆包控制台的API调用示例**：可能有模型名称的示例

## 测试建议

目前可以：
1. ✅ **智谱AI** - 已经成功，可以正常使用
2. ❌ **DeepSeek** - 需要充值
3. ⚠️ **豆包** - 需要配置正确的模型名称

建议先使用智谱AI进行测试和评估，等豆包配置好后再对比。



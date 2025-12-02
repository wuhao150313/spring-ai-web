/**
 * 图片分析（通过URL）- 流式响应
 * 返回 Promise，会随着流式数据更新回调
 */
export function analyzeImageByUrl(
  prompt: string,
  imageUrl: string,
  onChunk?: (chunk: string) => void,
  onComplete?: (fullContent: string) => void,
  onError?: (error: Error) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 对两个参数分别进行URL编码
      const encodedPrompt = encodeURIComponent(prompt);
      const encodedImageUrl = encodeURIComponent(imageUrl);
      // 拼接包含两个参数的接口URL
      const url = `http://localhost:8081/ai/qna/image/analyze/url?prompt=${encodedPrompt}&imageUrl=${encodedImageUrl}`;

      // 使用 fetch API 处理流式响应（逻辑与你的代码完全一致）
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/plain",
          "Cache-Control": "no-cache",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = "";
          if (!reader) {
            throw new Error("无法获取响应流");
          }
          // 读取流式数据（复用你的流处理逻辑）
          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  if (onComplete) onComplete(fullContent);
                  resolve(fullContent);
                  break;
                }
                // 解码数据块
                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                // 调用回调函数
                if (onChunk) onChunk(chunk);
              }
            } catch (error) {
              console.error("读取流数据失败:", error);
              const err =
                error instanceof Error ? error : new Error("读取流数据失败");
              if (onError) onError(err);
              reject(err);
            }
          };
          readStream();
        })
        .catch((error) => {
          console.error("流式请求失败:", error);
          if (onError) onError(error);
          reject(error);
        });
    } catch (error) {
      console.error("创建流式请求失败:", error);
      if (onError) onError(error as Error);
      reject(error);
    }
  });
}

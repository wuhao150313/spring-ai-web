import axios, { type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import type { Result } from "../types";

const service = axios.create({
  baseURL: "", // 使用相对路径，通过 Vite 代理
  timeout: 60000,
});

// 请求拦截器 - 添加 Token
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 调试：打印POST请求的数据
    if (config.method === 'post' && config.data) {
      console.log('请求URL:', config.url);
      console.log('请求数据:', JSON.stringify(config.data, null, 2));
      console.log('请求数据中的model字段:', config.data.model);
    }
    
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result<any>>) => {
    const res: Result<any> = response.data;

    if (res.code === 200) {
      // 保持 AxiosResponse 结构，将数据封装回 response.data
      return {
        ...response,
        data: res.data,
      };
    } else {
      // 打印详细的错误信息
      console.error("业务错误:", {
        code: res.code,
        message: res.message,
        data: res.data,
        fullResponse: res
      });
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message || "请求失败"));
    }
  },
  (error) => {
    console.error("响应错误:", error);
    // 打印详细的错误响应信息
    if (error.response) {
      console.error("错误响应详情:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      ElMessage.error("登录已过期，请重新登录");
    } else {
      // 尝试从响应数据中获取错误信息
      const errorMessage = error.response?.data?.message || error.message || "网络错误";
      ElMessage.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default service;

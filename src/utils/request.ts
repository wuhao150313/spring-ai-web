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
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result<any> | string | any>) => {
    // 如果是 text 响应，直接返回
    if (typeof response.data === "string") {
      return response;
    }

    // 检查是否是 Result 格式（有 code 字段）
    const res = response.data as any;
    if (res && typeof res === 'object' && 'code' in res) {
      // 这是 Result 格式的响应
      if (res.code === 200) {
        // 保持 AxiosResponse 结构，将数据封装回 response.data
        return {
          ...response,
          data: res.data,
        };
      } else {
        ElMessage.error(res.message || "请求失败");
        return Promise.reject(new Error(res.message || "请求失败"));
      }
    } else {
      // 不是 Result 格式，直接返回（如 8082 端口的 API）
      return response;
    }
  },
  (error) => {
    console.error("响应错误:", error);
    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      ElMessage.error("登录已过期，请重新登录");
    } else {
      ElMessage.error(error.message || "网络错误");
    }
    return Promise.reject(error);
  }
);

export default service;

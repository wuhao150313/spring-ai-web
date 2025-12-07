import request from "../utils/request";
import type {
  Result,
  UserVO,
  UserDTO,
  PageRequest,
  PageResult,
} from "../types";

/**
 * 分页查询用户列表
 */
export function getUserPage(
  params?: PageRequest
): Promise<Result<PageResult<UserVO>>> {
  return request({
    url: "/api/user/page",
    method: "get",
    params,
  });
}

/**
 * 根据 ID 查询用户详情
 */
export function getUserById(id: number): Promise<Result<UserVO>> {
  return request({
    url: `/api/user/${id}`,
    method: "get",
  });
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUserInfo(): Promise<Result<UserVO>> {
  return request({
    url: "/api/user/user-info",
    method: "get",
  });
}

/**
 * 用户注册
 */
export function register(data: UserDTO): Promise<Result<string>> {
  return request({
    url: "/api/user",
    method: "post",
    data,
  });
}

/**
 * 更新个人资料
 */
export function updateProfile(data: Partial<UserDTO>): Promise<Result<string>> {
  return request({
    url: "/api/user/update-profile",
    method: "put",
    data,
  });
}





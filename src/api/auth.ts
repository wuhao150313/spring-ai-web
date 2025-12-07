import request from "../utils/request";
import type {
  Result,
  TokenVO,
  LoginDTO,
  SmsLoginDTO,
  WechatLoginDTO,
  BindMobileDTO,
  ChangeMobileDTO,
} from "../types";

/**
 * 账号密码登录
 */
export function login(data: LoginDTO): Promise<Result<TokenVO>> {
  return request({
    url: "/api/auth/login",
    method: "post",
    data,
  });
}

/**
 * 发送短信验证码
 */
export function sendSmsCode(mobile: string): Promise<Result<string>> {
  return request({
    url: "/api/auth/send-sms-code",
    method: "get",
    params: { mobile },
  });
}

/**
 * 短信验证码登录
 */
export function smsLogin(data: SmsLoginDTO): Promise<Result<TokenVO>> {
  return request({
    url: "/api/auth/sms-login",
    method: "post",
    data,
  });
}

/**
 * 微信登录
 */
export function wechatLogin(data: WechatLoginDTO): Promise<Result<TokenVO>> {
  return request({
    url: "/api/auth/wechat-login",
    method: "post",
    data,
  });
}

/**
 * 退出登录
 */
export function logout(): Promise<Result<string>> {
  return request({
    url: "/api/auth/logout",
    method: "post",
  });
}

/**
 * 绑定手机号
 */
export function bindMobile(data: BindMobileDTO): Promise<Result<string>> {
  return request({
    url: "/api/auth/bind-mobile",
    method: "post",
    data,
  });
}

/**
 * 更换手机号
 */
export function changeMobile(
  data: ChangeMobileDTO
): Promise<Result<string>> {
  return request({
    url: "/api/auth/change-mobile",
    method: "post",
    data,
  });
}




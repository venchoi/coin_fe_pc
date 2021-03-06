export default {
  /**
   * 工具类相关
   */
  // 获取图像验证码
  GET_CHECK_IMG: '/tool/verify/wapi/ajax.html',
  // 获取短信验证码
  GET_SMS_CODE: '/tool/get_sms_code/wapi/ajax.html',
  // 校验短信验证码
  CHECK_SMS_CODE: '/tool/check_sms_code/wapi/ajax.html',
  /**
   * 新闻相关
   */
  // 快讯列表
  GET_NEWS_LIST: '/news/news_list/wapi/ajax.html',
  GET_LASTEST_NEWS: '/news/latest_news_list/wapi/ajax.html',
  // 获取最新新闻条数接口
  GET_NEWS_NUM: '/news/latest_news_num/wapi/ajax.html',
  /**
   * 搜索相关
   */
  // 搜索联想
  SEARCH: '/search/s/wapi/ajax.html',
  // 币相关新闻
  SEARCH_COIN_NEWS: '/search/get_coin_news/wapi/ajax.html',
  // 搜索联想
  SEARCH_KEYWORD: '/search/keyword/wapi/ajax.html',
  /**
   * 行情相关
   */
  // 首页行情列表
  GET_QUOTATIONS: '/market/get_quotations/wapi/ajax.html',
  // 行情列表主页
  GET_QUOTATIONS_LIST: '/market/quotations_list/wapi/ajax.html',
  GET_REALTIME_QUOTATIONS: '/market/get_realtime_quotation/wapi/ajax.html',
  USDT_EX_RATE: '/coin/usdt_exchange_rate/wapi/ajax.html',
  USDT_EX_RATE_CODE: '/coin/usdt_exchange_rate_by_code/wapi/ajax.html',
  CONCERN_QUOTATIONS: '/market/get_user_concern_coin/wapi/ajax.html',
  QUOTATIONS_LIST: '/market/quotations_rank_list/wapi/ajax.html',
  UPDOWN_AMOUNT: '/market/up_down_count/wapi/ajax.html',
  /**
   * 币相关
   */
  GET_COIN_NEWS: '/coin/get_coin_news/wapi/ajax.html',
  // 币主页行情
  GET_MIN_QUOTATION: '/market/get_min_quotation/wapi/ajax.html',
  /**
   * 账号相关
   */
  // 获取用户信息
  GET_USER_INFO: '/account/get_user_info/wapi/ajax.html',
  // 登录
  LOGIN: '/account/login/wapi/ajax.html',
  // 注册
  REGISTER: '/account/register/wapi/ajax.html',
  // 退出登录
  LOGOUT: '/account/logout/wapi/ajax.html',
  // 重设密码 (未登录状态下)
  RESET_PASSWORD: '/account/reset_password/wapi/ajax.html',
  // 重置密码 （个人中心重置密码）
  UPDATE_PASSWORD: '/account/update_password/wapi/ajax.html',
  // 设置密码
  CREATE_PASSWORD: '/account/create_password/wapi/ajax.html',
  // 更新用户基本信息
  UPDATE_INFO: '/account/update_user_basic_info/wapi/ajax.html',
  // 更换头像
  CHANGE_PORTRAIT: '/account/change_head_pic/wapi/ajax.html',
  // 绑定手机号
  BIND_PHONE: '/account/account_bind_phone/wapi/ajax.html',
  // 校验原手机号
  CHECK_CURRENT_PHONE: '/account/check_user_current_phone/wapi/ajax.html',
  /**
   * 用户喜好相关
   */
  // 获取用户喜好
  GET_USER_FAVORITE: '/user/get_user_own_favorite/wapi/ajax.html',
  // 获取用户收藏
  GET_USER_COLLECT: '/user/get_user_own_collect/wapi/ajax.html',
  // 操作用户喜好
  OPERATE_USER_FAVORITE: '/user/do_user_favorite/wapi/ajax.html',
};

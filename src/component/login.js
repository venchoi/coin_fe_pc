import $ from 'jquery';
import mustache from 'mustache';
import ajax from '../lib/ajax';
import hexMd5 from '../vendor/md5';
import hintTemplete from '../template/layer/hint.html';
import hint from './layer/hint';
import {
  countDown,
  verifyPhone,
  verifyPassWord,
  cofirmPassWord,
  verifyCheckCode,
  autoVerify,
} from './form/form-validate';

let phone;
let smsCode;
const hintTpl = mustache.render(hintTemplete);
const initLogin = () => {
  $('body').append(hintTpl);
  // todo tab跳转， 图片验证码更改
  autoVerify();
  $('.forget-password').on('click', () => {
    $('.log-modal').addClass('hidden').siblings('.find-password-dialog').removeClass('hidden');
  });
  $('.phone-verification').on('click', () => {
    $('.use-password').addClass('hidden').siblings('.use-verification').removeClass('hidden');
  });
  $('.phone-password').on('click', () => {
    $('.use-verification').addClass('hidden').siblings('.use-password').removeClass('hidden');
  });
  $('.find-password-dialog .back').on('click', () => {
    $('.log-modal').removeClass('hidden').siblings('.find-password-dialog').addClass('hidden');
  });
  const smsOptions = {
    area_code: '+86',
    phone: '',
    sms_code: '',
    type: '', // log find reg
  };
  $('.find-password-dialog .next').on('click', () => {
    const $phone = $('.find-password-dialog').find('.phone .phone-number');
    const $verification = $('.find-password-dialog').find('.verification-code');
    if (verifyPhone($phone)) {
      smsOptions.phone = $phone.val();
      smsOptions.sms_code = $verification.val();
      smsOptions.type = 'find';
      ajax.CHECK_SMS_CODE({
        param: smsOptions,
        success: (res) => {
          if (res.error_code === '0') {
            phone = $phone.val();
            smsCode = $verification.val();
            $('.find-password-dialog').addClass('hidden').siblings('.reset-password-dialog').removeClass('hidden');
          } else {
            hint('fault', 'red', res.msg, 1500);
          }
        },
      });
    }
  });
  $('.reset-password-dialog .cancel').on('click', () => {
    $('.login input').val('');
    $('.login').addClass('hidden');
  });
  $('.log').on('click', () => {
    $('.login').removeClass('hidden');
  });
  $('.login .close').on('click', () => {
    $('.login input').val('');
    $('.login').addClass('hidden');
  });
  $('.layer-bg').on('click', () => {
    $('.layer').addClass('hidden');
  });
  const logOptions = {
    area_code: '+86',
    account: '',
    password: '',
    type: '', // 1密码登录2短信登录
  };
  // 获取短信验证码 —— 短信登录、找回密码、注册
  const verificationOptions = {
    area_code: '+86',
    phone: '',
    verify_code: '', // 图片验证码
    type: '', // log find reg
  };
  $('.request-button').on('click', function () {
    const $this = $(this);
    const $phoneDom = $this.parent().siblings('.phone').find('.phone-number');
    const $checkCodeDom = $this.parent().siblings('.check-code').find('input');
    verificationOptions.type = $this.data('msg-type');
    verificationOptions.verify_code = $this.parent().siblings('.check-code').find('input').val();
    if (verifyPhone($phoneDom) && verifyCheckCode($checkCodeDom) && !$this.hasClass('disabled')) {
      verificationOptions.phone = $phoneDom.val();
      ajax.GET_SMS_CODE({
        param: verificationOptions,
        success: (res) => {
          if (res.error_code === '0') {
            countDown($this);
          } else {
            hint('fault', 'red', res.msg, 1500);
          }
        },
      });
    }
  });
  // 登录——密码登录/短信验证码登录
  $('.log-modal .sign-in').on('click', () => {
    const $logWayDom = $('.log-modal [data-tab-signin]').children('div:not(.hidden):not(.button)');
    const logType = $logWayDom.data('type');
    const $accountDom = $logWayDom.find('.phone .phone-number');
    let $passwordDom;
    let flag = false;
    if (logType === 'password') {
      logOptions.type = 1;
      $passwordDom = $logWayDom.find('.password input');
      flag = verifyPassWord($passwordDom);
      logOptions.password = hexMd5($passwordDom.val());
    } else if (logType === 'verification') {
      logOptions.type = 2;
      $passwordDom = $logWayDom.find('.verification input');
      flag = true;
      logOptions.password = $passwordDom.val();
    }
    if (verifyPhone($accountDom) && flag) {
      logOptions.account = $accountDom.val();
      ajax.LOGIN({
        param: logOptions,
        success: (res) => {
          if (res.error_code === '0') {
            $('.login').addClass('hidden');
            hint('success', 'green', res.msg, 1500);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            hint('fault', 'red', res.msg, 1500);
          }
        },
      });
    }
  });
  const registerOptions = {
    area_code: '+86',
    phone: '',
    sms_code: '',
    password: '',
  };
  // 注册
  $('.log-modal .sign-up').on('click', () => {
    const $signUpDom = $('.content-item[data-tab-signup]');
    const $phoneDom = $signUpDom.find('.phone .phone-number');
    const $verificationDom = $signUpDom.find('.verification input');
    const $passwordDom = $signUpDom.find('.create-password input');
    if (verifyPhone($phoneDom) && verifyPassWord($passwordDom)) {
      registerOptions.phone = $phoneDom.val();
      registerOptions.sms_code = $verificationDom.val();
      registerOptions.password = hexMd5($passwordDom.val());
      ajax.REGISTER({
        param: registerOptions,
        success: (res) => {
          if (res.error_code === '0') {
            $('.login').addClass('hidden');
            hint('success', 'green', res.msg, 1500);
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            hint('fault', 'red', res.msg, 1500);
          }
        },
      });
    }
  });
  const resetOption = {
    area_code: '+86',
    phone: '',
    sms_code: '',
    password: '',
    repassword: '',
  };
  // 重设密码
  $('.finish').on('click', () => {
    const $signUpDom = $('.reset-password-dialog .content-item');
    const $srcPswDom = $signUpDom.find('.enter-password input');
    const $checkPswDom = $signUpDom.find('.check-password input');
    if (verifyPassWord($srcPswDom) && cofirmPassWord($srcPswDom, $checkPswDom)) {
      resetOption.phone = phone;
      resetOption.sms_code = smsCode;
      resetOption.password = hexMd5($srcPswDom.val());
      resetOption.repassword = hexMd5($checkPswDom.val());
      ajax.RESET_PASSWORD({
        param: resetOption,
        success: (res) => {
          if (res.error_code === '0' || res.error_code === 0) {
            $('.login').addClass('hidden');
            hint('success', 'green', res.msg, 1500);
            setTimeout(() => {
              $('.reset-password-dialog').addClass('hidden');
              $('.log-modal').removeClass('hidden');
            }, 1500);
          } else {
            hint('fault', 'red', res.msg, 1500);
          }
        },
      });
    }
  });
  $('.log-modal .content-item[data-tab-signin] .password input,.log-modal .content-item[data-tab-signin] .verification').keydown((e) => {
    if (e.keyCode === 13) {
      $('.log-modal .sign-in').trigger('click');
    }
  });
  $('.log-modal .content-item[data-tab-signup] .create-password input').keydown((e) => {
    if (e.keyCode === 13) {
      $('.log-modal .sign-up').trigger('click');
    }
  });
  $('.find-password-dialog .verification input').keydown((e) => {
    if (e.keyCode === 13) {
      $('.find-password-dialog .next').trigger('click');
    }
  });
};
export default initLogin;

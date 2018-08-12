import $ from 'jquery';
import mustache from 'mustache';
import 'cropper';
import 'cropper/dist/cropper.min.css';
import './common';
import hexMd5 from '../vendor/md5';
import ajax from '../lib/ajax';
import '../sass/views/user-center.scss';
import {
  countDown,
  verifyPhone,
  verifyPassWord,
  cofirmPassWord,
  verifyCheckCode,
  autoVerify,
} from '../component/form/form-validate';
import resetPhoneTpl from '../template/form/form-resetPhone.html';
import resetPswTpl from '../template/form/form-resetPsw.html';
import setPsw from '../template/form/form-setPsw.html';
import confirmTpl from '../template/layer/comfirm.html';
import hintTpl from '../template/layer/hint.html';
import { each, merge } from '../util/baseUtil';
import renderNews from '../component/card/news';
import renderDeepNews from '../component/card/deep-news-card';
import { bindClick, imgZoom } from '../component/action/newsButtonClick';
import coinButtonClick from '../component/action/coinButtonClick';
import renderCoinSubject from '../component/card/search-coin-card';
import hint from '../component/layer/hint';
import { updateCoins } from './common/updateCoin';
import newPhoneTpl from '../template/form/form-newPhone.html';

let changeFlag = false;
let collectInit = true;
let concernInit = true;
const phone = $('.account-item .phone').data('phone');
const $resetPhoneTpl = mustache.render(resetPhoneTpl, {
  phone,
});
const $resetPswTpl = mustache.render(resetPswTpl);
const $newPhoneTpl = mustache.render(newPhoneTpl);
const $modifyConfirmDom = mustache.render(confirmTpl, {
  title: '<span><i class="iconfont icon-warning"></i></span><span>当前编辑内容未保存，是否保存？</span>',
  content: '当前页面编辑的内容未保存，如果离开将失去修改的内容',
  reverse: '不保存',
  forward: '保存',
});
const $hintTpl = mustache.render(hintTpl);
const $setPsw = mustache.render(setPsw);
$('body').append($resetPhoneTpl, $resetPswTpl, $modifyConfirmDom, $hintTpl, $setPsw, $newPhoneTpl);
$('.confirm .button.forward').addClass('save');
$('.confirm .button.reverse').on('click', () => {
  changeFlag = false;
  $('.confirm').addClass('hidden');
});
$('aside .tabs').find('li.level-menu').on('click', function () {
  const $this = $(this);
  if (changeFlag) {
    $('.confirm').removeClass('hidden');
  } else if (!$this.hasClass('disabled') && !$this.hasClass('active')) {
    $this.addClass('active').siblings().removeClass('active')
      .parents()
      .find('.tabs-content')
      .find($(this).attr('data-tab'))
      .addClass('active')
      .siblings()
      .removeClass('active');
  }
});
$('section .action').on('click', function () {
  const $this = $(this);
  const type = $this.data('type');
  if (type === 'phone') {
    $('.reset-phone').removeClass('hidden');
  } else if (type === 'reset-password') {
    $('.reset-password').removeClass('hidden');
  } else if (type === 'set-password') {
    $('.set-password').removeClass('hidden');
  }
});
autoVerify();
// 获取短信验证码 —— 短信登录、找回密码、注册
const verificationOptions = {
  area_code: '+86',
  phone: '',
  verify_code: '', // 图片验证码
  type: '', // log find reg
};
$('.request-button').on('click', function () {
  let phoneFlag = false;
  const $this = $(this);
  const $phoneDom = $this.parent().siblings('.phone').find('.phone-number');
  const $checkCodeDom = $this.parent().siblings('.check-code').find('input');
  verificationOptions.type = $this.data('msg-type');
  verificationOptions.verify_code = $this.parent().siblings('.check-code').find('input').val();
  if (!$phoneDom.length) {
    phoneFlag = true;
    verificationOptions.phone = phone;
  } else {
    phoneFlag = verifyPhone($phoneDom);
    verificationOptions.phone = $phoneDom.val();
  }
  if (phoneFlag && verifyCheckCode($checkCodeDom) && !$this.hasClass('disabled')) {
    ajax.GET_SMS_CODE({
      param: verificationOptions,
      success: (res) => {
        if (res.error_code === '0') {
          countDown($this);
          $this.data('msg-type', 'bind');
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
// 重设密码
const resetPswOptions = {
  old_password: '',
  password: '',
  repassword: '',
};
$('.reset-password .button.bind').on('click', () => {
  const $pswDom = $('.reset-password .password input');
  const $newPsw = $('.reset-password .enter-password input');
  const $confirmPsw = $('.reset-password .check-password input');
  if (verifyPassWord($pswDom) && verifyPassWord($newPsw) && cofirmPassWord($confirmPsw, $newPsw)) {
    resetPswOptions.old_password = hexMd5($pswDom.val());
    resetPswOptions.password = hexMd5($newPsw.val());
    resetPswOptions.repassword = hexMd5($confirmPsw.val());
    ajax.UPDATE_PASSWORD({
      param: resetPswOptions,
      success: (res) => {
        if (res.error_code === '0') {
          $('.reset-password').addClass('hidden');
          hint('success', 'green', res.msg, 1500);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
// 设置密码
const setPswOptions = {
  password: '',
  repassword: '',
};
$('.set-password .button.finish').on('click', () => {
  const $newPsw = $('.set-password .enter-password input');
  const $confirmPsw = $('.set-password .check-password input');
  if (cofirmPassWord($newPsw, $confirmPsw)) {
    setPswOptions.password = hexMd5($newPsw.val());
    setPswOptions.repassword = hexMd5($confirmPsw.val());
    ajax.CREATE_PASSWORD({
      param: setPswOptions,
      success: (res) => {
        if (res.error_code === '0') {
          $('.set-password').addClass('hidden');
          hint('success', 'green', res.msg, 1500);
        } else {
          hint('fault', 'red', res.msg, 1500);
        }
      },
    });
  }
});
$('.set-password .button.cancel').on('click', () => {
  $('.set-password input').val('');
  $('.set-password').addClass('hidden');
});
$('.intro-desc').on('keydown', function (e) {
  const $this = $(this);
  const length = $this.val().length;
  changeFlag = true;
  if (length > 400 && e.keyCode !== 8) {
    e.preventDefault();
  } else {
    $('.intro .tip i').html(length);
  }
});
$('.nick-name').on('keydown', function (e) {
  const $this = $(this);
  const length = $this.val().length;
  changeFlag = true;
  if (length > 10 && e.keyCode !== 8) {
    e.preventDefault();
  }
});
const userIntroOptions = {
  nick: '',
  info: '',
};
const saveInfo = () => {
  userIntroOptions.nick = $('.nick-name').val();
  userIntroOptions.info = $('.intro-desc').val();
  ajax.UPDATE_INFO({
    param: userIntroOptions,
    success: (res) => {
      if (res.error_code === '0' || res.error_code === 0) {
        hint('success', 'green', res.msg, 1500);
        changeFlag = false;
        $('.layer').addClass('hidden');
      } else {
        hint('fault', 'red', res.msg, 1500);
      }
    },
  });
};
$('.save').on('click', () => {
  saveInfo();
});
$('.layer-bg,.layer .close').on('click', () => {
  $('.layer').addClass('hidden');
});
// 验证原手机号——绑定新手机号
const oldPhoneOptions = {
  phone,
  sms_code: '', // 短信
};
const newPhoneOptions = {
  area_code: '+86',
  phone: '',
  sms_code: '',
};
$('.reset-phone .button.bind').on('click', () => {
  oldPhoneOptions.sms_code = $('.reset-phone').find('.verification-code').val();
  ajax.CHECK_CURRENT_PHONE({
    param: oldPhoneOptions,
    success: (res) => {
      if (res.error_code === '0') {
        hint('success', 'green', res.msg, 1500);
        $('.reset-phone').addClass('hidden');
        $('.new-phone').removeClass('hidden');
      } else {
        hint('fault', 'red', res.msg, 1500);
      }
    },
  });
});
$('.new-phone .button.bind').on('click', () => {
  newPhoneOptions.sms_code = $('.new-phone').find('.verification-code').val();
  newPhoneOptions.phone = $('.new-phone').find('.phone-number').val();
  ajax.BIND_PHONE({
    param: newPhoneOptions,
    success: (res) => {
      if (res.error_code === '0') {
        hint('success', 'green', res.msg, 1500);
      } else {
        hint('fault', 'red', res.msg, 1500);
      }
    },
  });
});
// =============================我的收藏
const options = {
  type: 'news',
  min_time: '',
};
// 请求新闻列表用户对应的喜好
const userNewsListOptions = {
  type: 'news',
  favorite_types: ['collect', 'attitude_up', 'attitude_down'],
  source_ids: [],
};
let hasData = true;
const request = () => {
  if (hasData) {
    $('.press-container').find('.loading-page').removeClass('hidden');
    $('.press-container').find('.more').addClass('hidden');
    // 获取无状态新闻列表
    ajax.GET_USER_COLLECT({
      param: options,
      success: (res) => {
        if (res.error_code === '0') {
          // newData是最终渲染需要的数据
          const newsData = res.data;
          // todo 数据处理
          userNewsListOptions.source_ids = newsData.newsIds;
          if (newsData.dataList && newsData.dataList.length > 0) {
            if (collectInit) {
              collectInit = false;
            }
            // 获取列表对应用户状态
            options.min_time = newsData.min_time;
            ajax.GET_USER_FAVORITE({
              param: userNewsListOptions,
              success: (response) => {
                if (response.error_code === '0') {
                  each(newsData.dataList, (news) => {
                    each(response.data, (value) => {
                      if (news.news_id === value.news_id) {
                        merge(news, value, true);
                      }
                    });
                  });
                  each((newsData.dataList), (news) => {
                    let $news;
                    if (news.catalog_id === '200') {
                      $news = renderDeepNews(news, 'timeDate');
                    } else {
                      $news = renderNews(news, 'timeDate');
                    }
                    $('.press-container .panel').append($news);
                  });
                  $('.press-container').find('.loading-page').addClass('hidden');
                  $('.press-container > .more').removeClass('hidden');
                  bindClick();
                  imgZoom($('.my-gallery img'), '.my-gallery');
                }
              },
            });
          } else if (collectInit) {
            collectInit = false;
            $('.press-container').find('.loading-page').addClass('hidden');
            $('.press-container').siblings('.collect-none').removeClass('hidden');
            $('.press-container > .more').addClass('hidden');
          } else {
            hasData = !hasData;
            $('.press-container').find('.loading-page').addClass('hidden');
            $('.press-container > .more').removeClass('hidden');
            $('.press-container > .more .button').addClass('disabled').html('已无更多');
          }
        }
      },
    });
  }
};
request();
$('.press-container .more').on('click', () => {
  request();
});
// ========================================== 我的关注
// let page = 1;
const coinOptions = {
  type: 'coin',
  min_time: '',
};
const quotationRequest = () => {
  ajax.GET_USER_COLLECT({
    param: coinOptions,
    success: (res) => {
      const $coinList = $('<div class="panel"></div>');
      if (res.data.dataList && res.data.dataList.length > 0) {
        if (concernInit) {
          concernInit = false;
        }
        coinOptions.min_time = res.data.min_time;
        each(res.data.dataList, (coin) => {
          const $coin = renderCoinSubject(coin);
          $coinList.append($coin);
        });
        $('.coins-container').append($coinList);
        coinButtonClick();
        updateCoins();
      } else if (concernInit) {
        concernInit = false;
        $('.coins-container').siblings('.collect-none').removeClass('hidden');
        $('.coins-container').siblings('.more').addClass('hidden');
      } else {
        const $more = $('.coins-container').siblings('.more').removeClass('hidden');
        // if ($more.length > 0) {
        $more.find('.button').addClass('disabled').html('已无更多');
        // }
      }
    },
  });
};
quotationRequest();
$('.coins-container').siblings('.more').on('click', () => {
  quotationRequest();
});

// 上传头像系列操作
const cropper = function initCropper() {
  const $image = $('#image');
  const minAspectRatio = 0.5;
  const maxAspectRatio = 1.5;
  const $inputImage = $('#inputImage');
  const URL = window.URL || window.webkitURL;
  let blobURL;
  let fileurl;

  if ($image.length === 0) {
    return;
  }
  if (URL) {
    $inputImage.change(function changeImg() {
      const files = this.files;
      let file;

      if (!$image.data('cropper')) {
        return;
      }

      if (files && files.length) {
        file = files[0];

        if (/^image\/\w+$/.test(file.type)) {
          blobURL = URL.createObjectURL(file);
          $image.one('built.cropper', () => {
            URL.revokeObjectURL(blobURL);
          }).cropper('reset').cropper('replace', blobURL);
          fileurl = files[0];
        } else {
          hint('fault', 'red', '请选择图片', 1500);
        }
      }
      $('.img-layer').removeClass('hidden');
    });
  }
  $image.cropper({
    aspectRatio: 1,
    preview: '.img-preview',
    built() {
      const containerData = $image.cropper('getContainerData');
      const cropBoxData = $image.cropper('getCropBoxData');
      const aspectRatio = cropBoxData.width / cropBoxData.height;
      let newCropBoxWidth;

      if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
        newCropBoxWidth = cropBoxData.height * ((minAspectRatio + maxAspectRatio) / 2);

        $image.cropper('setCropBoxData', {
          left: (containerData.width - newCropBoxWidth) / 2,
          width: newCropBoxWidth,
        });
      }
    },
    cropmove() {
      const cropBoxData = $image.cropper('getCropBoxData');
      const aspectRatio = cropBoxData.width / cropBoxData.height;

      if (aspectRatio < minAspectRatio) {
        $image.cropper('setCropBoxData', {
          width: cropBoxData.height * minAspectRatio,
        });
      } else if (aspectRatio > maxAspectRatio) {
        $image.cropper('setCropBoxData', {
          width: cropBoxData.height * maxAspectRatio,
        });
      }
    },
  });

  return {
    getImgData() {
      return $image.cropper('getData');
    },
    getFileUrl() {
      return fileurl;
    },
  };
};
const cropperInstance = cropper();
$('#inputImage').on('change', () => {
  $('.img-layer').removeClass('hidden');
});
$('.portrait-save').on('click', () => {
  const cropperData = cropperInstance.getImgData();
  const imgUrl = cropperInstance.getFileUrl();
  document.getElementsByClassName('upload-user-icon').value = imgUrl;
  const x = cropperData.x;
  const y = cropperData.y;
  const width = cropperData.width;
  const height = cropperData.height;
  const imageQua = [x, y, width, height];
  const portraitOption = {
    url: '/account/change_head_pic/wapi/ajax.html',
    param: {
      head_pic: imgUrl,
      image_qua: imageQua,
    },
  };
  ajax.form({
    param: portraitOption,
    success: (res) => {
      if (res.error_code === '0') {
        hint('success', 'green', '修改成功！', 1500);
        $('.change-portrait img').attr('src', res.data.url);
        setTimeout(() => {
          $('.img-layer').addClass('hidden');
        }, 1500);
      } else {
        hint('fault', 'red', '上传失败');
      }
    },
  });
});

updateCoins();

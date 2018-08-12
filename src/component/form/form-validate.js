import $ from 'jquery';

const reg = {
  password: /[A-Za-z\d]$/,
  tel: /^1[34578]\d{9}$/,
  // formatPassword: /[^\w\s\\\[\]`~!@#$%^&*()-+={};:'"|,.<>/?]/g,
};
const countDown = ($dom) => { // 倒计时
  const checkedValue = $dom.text();
  let i = 60;
  $dom.addClass('disabled');
  function count() {
    $dom.text(`已发送${i}s`);
    i -= 1;
    if (i < 0 || !$dom.hasClass('disabled')) {
      $dom.removeClass('disabled');
      $dom.text(checkedValue);
      return;
    }
    setTimeout(() => {
      count();
    }, 1000);
  }
  count();
};
const verifyPhone = ($input) => {
  const $tip = $input.siblings('.tip');
  if (!$input.val()) {
    $tip.html('请输入手机号码').removeClass('hidden');
  } else if (reg.tel.test($input.val())) {
    $input.parent('.input').removeClass('form-error');
    $tip.html('').addClass('hidden');
    return true;
  } else {
    $tip.html('手机号码格式错误').removeClass('hidden');
  }
  $input.parent('.input').addClass('form-error');
  return false;
};
const cofirmPassWord = ($input, $sourceInput) => {
  const $tip = $input.siblings('.tip');
  if ($input.val() === $sourceInput.val()) {
    $tip.html('').addClass('hidden');
    return true;
  }
  $tip.html('密码不一致').removeClass('hidden');
  return false;
};
const verifyPassWord = ($input) => {
  const $tip = $input.siblings('.tip');
  if (!$input.val()) {
    $tip.html('请输入密码').removeClass('hidden');
  } else if ($input.val().length < 6 || $input.val().length > 16) {
    $tip.html('请输入6~16位密码').removeClass('hidden');
  } else if (reg.password.test($input.val())) {
    $input.parent('.input').removeClass('form-error');
    $tip.html('').addClass('hidden');
    const $parentDom = $input.parents('.enter-password');
    if ($parentDom.length) {
      const $checkPswDom = $parentDom.siblings('.check-password');
      if ($checkPswDom.length && $checkPswDom.find('input').val()) {
        cofirmPassWord($checkPswDom.find('input'), $input);
      }
    }
    return true;
  }
  $input.parent('.input').addClass('form-error');
  return false;
};
const verifyCheckCode = ($input) => {
  const $tip = $input.siblings('.tip');
  if (!$input.val()) {
    $tip.html('请先输入').removeClass('hidden');
    $input.parent('.input').addClass('form-error');
    return false;
  }
  $input.parent('.input').removeClass('form-error');
  $tip.html('').addClass('hidden');
  return true;
};
const autoVerify = () => {
  $('.phone-number').on('blur', function () {
    const $this = $(this);
    verifyPhone($this);
  });
  $('.enter-password input').on('blur', function () {
    const $this = $(this);
    verifyPassWord($this);
  });
  $('.create-password input').on('blur', function () {
    const $this = $(this);
    verifyPassWord($this);
  });
  $('.check-password input').on('blur', function () {
    const $this = $(this);
    const $sourceInput = $this.parent().parent().parent()
      .siblings('.enter-password')
      .find('.password');
    cofirmPassWord($this, $sourceInput);
  });
  $('.check-code span > img').on('click', function () {
    const $this = $(this);
    $this.attr('src', '/tool/verify/wapi/ajax');
  });
  $('input').on('focus', function () {
    const $this = $(this);
    const $tip = $this.siblings('.tip');
    $this.parent().removeClass('form-error');
    $tip.html('').addClass('hidden');
  });
};
export {
  countDown,
  verifyPhone,
  verifyPassWord,
  cofirmPassWord,
  verifyCheckCode,
  autoVerify,
};

import $ from 'jquery';
import mustache from 'mustache';
import initPhotoSwipeFromDOM from './init';
import './photo.scss';
import photoTpl from './photoTpl.html';

const $pswpTpl = mustache.render(photoTpl);
if (!$('.pswp').length) {
  $('body').append($pswpTpl);
}
export default initPhotoSwipeFromDOM;

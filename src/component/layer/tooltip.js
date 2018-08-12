import mustache from 'mustache';
import tpl from '../../template/layer/tooltip.html';

const tooltip = (selector) => {
  const inner = selector.attr('data-tooltip');
  const $tpl = mustache.render(tpl, inner);
  selector.find('.tooltip-header').on('mouseover', () => {
    selector.append($tpl);
  });
  selector.find('.tooltip-header').on('mouseout', () => {
    selector.find('.tooltip-content').remove();
  });
};
export default tooltip;

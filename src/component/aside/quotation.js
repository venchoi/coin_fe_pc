import $ from 'jquery';
// import echarts from '../../vendor/echarts.min';
import ajax from '../../lib/ajax';
import coinButtonClick from '../../component/action/coinButtonClick';
import renderCoinSubject from '../../component/card/search-coin-card';
import { each } from '../../util/baseUtil';

const isDev = process.env.NODE_ENV === 'development';
let echarts;
if (isDev) {
  // eslint-disable-next-line
  echarts = require('../../vendor/echarts');
} else {
  // eslint-disable-next-line
  echarts = require('../../vendor/echarts.min');
}

let upChart;
let downChart;
// ==================== 行情
const requestCoinList = (param) => {
  ajax.GET_QUOTATIONS({
    param,
    success: (jsonData) => {
      const $coinList = $('<div class="panel"></div>');
      if (jsonData.error_code === '0' && jsonData.data.length > 0) {
        const ids = new Set();
        each(jsonData.data, (coin) => {
          ids.add(coin.coin_id);
        });
        // coinInterestOptions.source_ids = Array.from(ids);
        each(jsonData.data, (coin) => {
          const $coin = renderCoinSubject(coin);
          $coinList.append($coin);
        });
        $('.coins-container').html($coinList);
        coinButtonClick();
      } else {
        const $more = $('.coins-container').siblings('.more');
        if ($more.length > 0) {
          $more.find('.button').addClass('disabled').html('已无更多');
        }
      }
    },
  });
};
// 全市场涨跌
const upDownList = (upSelector, downSelector, jsonData, isInit) => {
  const arr = Object.keys(jsonData.chart_data).map(key => jsonData.chart_data[key].num);
  const max = Math.max(...arr);
  const builderJson = {
    all: 0,
    up: [],
    down: [],
  };
  each(jsonData.chart_data, (item, index) => {
    if (index < 6) {
      builderJson.up.unshift(item.num);
    } else {
      builderJson.down.unshift(item.num);
    }
  });
  // builderJson.all = 668;
  const downOptions = {
    grid: [{
      top: 13,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    }],
    xAxis: [{
      type: 'value',
      max,
      show: false,
      splitLine: {
        show: false,
      },
    }],
    yAxis: [{
      type: 'category',
      data: ['跌幅＞10%', '跌幅＞8~10%', '跌幅＞6~8%', '跌幅＞4~6%', '跌幅＞2~4%', '跌幅＞0~2%'],
      axisLabel: {
        fontFamily: 'din',
        fontSize: 14,
        color: '#0B1013',
        // width: 80,
        margin: 95,
        textStyle: {
          align: 'left',
          baseline: 'middle',
        },
      },
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    }, {
      type: 'category',
      data: Object.keys(builderJson.down).map(key => builderJson.down[key]),
      axisLabel: {
        fontFamily: 'din',
        fontSize: 14,
        color: '#FF6262',
        width: 80,
      },
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    }],
    series: [{
      type: 'bar',
      stack: 'chart',
      z: 3,
      itemStyle: {
        color: '#FF6262',
      },
      barWidth: 10,
      data: Object.keys(builderJson.down).map(key => builderJson.down[key]),
    }],
  };
  const upOptions = {
    xAxis: [{
      type: 'value',
      max,
      show: false,
      splitLine: {
        show: false,
      },
    }],
    grid: [{
      top: 16,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    }],
    yAxis: [{
      type: 'category',
      data: ['涨幅＞0~2%', '涨幅＞2~4%', '涨幅＞4~6%', '涨幅＞6~8%', '涨幅＞8~10%', '涨幅＞10%'],
      axisLabel: {
        fontFamily: 'din',
        fontSize: 14,
        color: '#0B1013',
        // width: 80,
        margin: 95,
        textStyle: {
          align: 'left',
          baseline: 'middle',
        },
      },
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
    }, {
      type: 'category',
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      data: Object.keys(builderJson.up).map(key => builderJson.up[key]),
      axisLabel: {
        fontFamily: 'din',
        fontSize: 14,
        color: '#55DBB3',
        width: 80,
      },
    }],
    series: [{
      type: 'bar',
      stack: 'chart',
      z: 3,
      barWidth: 10,
      itemStyle: {
        color: '#55DBB3',
      },
      data: Object.keys(builderJson.up).map(key => builderJson.up[key]),
    }],
  };
  if (isInit) {
    upChart = echarts.init(upSelector);
    downChart = echarts.init(downSelector);
    // } else {
    //   upChart = upChartIns;
    //   downChart = downChartIns;
  }
  upChart.setOption(upOptions);
  downChart.setOption(downOptions);
  return {
    upChart,
    downChart,
  };
};
export {
  requestCoinList,
  upDownList,
};

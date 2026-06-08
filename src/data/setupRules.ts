import type { SetupRule, SetupType } from "@/types/trade";

export const setupRules: Record<SetupType, SetupRule> = {
  "破底翻": {
    setup: "破底翻",
    premise: "只做多：在关键支撑附近先破底，再快速拉回，并出现拒绝下跌。",
    riskLabel: "有 87% 下破风险",
    questions: [
      {
        id: "location",
        text: "位置：是否在 60m 重要支撑 / 区间下沿附近？",
        options: [
          { id: "clear", label: "是，位置清楚", points: 2 },
          { id: "uncertain", label: "一般/不确定", points: 1 },
          { id: "middle", label: "否，中间位置", points: 0, hardBlock: true }
        ]
      },
      {
        id: "reclaim",
        text: "破底翻：是否先破底，然后快速拉回？",
        options: [
          { id: "clear", label: "明确破底拉回", points: 2 },
          { id: "uncertain", label: "只是下影/不确定", points: 1 },
          { id: "none", label: "没有拉回", points: 0, hardBlock: true }
        ]
      },
      {
        id: "sharp_candle",
        text: "尖尖K：是否有明显长下影 / 拒绝下跌？",
        options: [
          { id: "clear", label: "明显", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "none", label: "没有", points: 0, hardBlock: true }
        ]
      },
      {
        id: "entry",
        text: "入场：是否靠近支撑，而不是追高？",
        options: [
          { id: "near", label: "靠近支撑", points: 2 },
          { id: "high", label: "有点高", points: 1 },
          { id: "chasing", label: "追高", points: 0, hardBlock: true }
        ]
      }
    ]
  },
  "2-2": {
    setup: "2-2",
    premise: "只做多：同一水平支撑的二次测试，刺破后收回并靠近支撑入场。",
    riskLabel: "支撑已经被有效跌破",
    questions: [
      {
        id: "support",
        text: "支撑线：是否有清楚的水平支撑？",
        options: [
          { id: "clear", label: "清楚", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "unclear", label: "不清楚", points: 0, hardBlock: true }
        ]
      },
      {
        id: "second_test",
        text: "二次测试：是否是第二次测试同一支撑？",
        options: [
          { id: "clear", label: "是，第二次很清楚", points: 2 },
          { id: "maybe", label: "有点像", points: 1 },
          { id: "no", label: "不是", points: 0, hardBlock: true }
        ]
      },
      {
        id: "pierce_reclaim",
        text: "刺破收回：第二次是否刺破后收回？",
        options: [
          { id: "clear", label: "明确刺破收回", points: 2 },
          { id: "uncertain", label: "不确定", points: 1 },
          { id: "none", label: "没有收回", points: 0, hardBlock: true }
        ]
      },
      {
        id: "entry",
        text: "入场：是否靠近支撑/第二点，而不是追高？",
        options: [
          { id: "near", label: "靠近", points: 2 },
          { id: "high", label: "有点高", points: 1 },
          { id: "chasing", label: "追高", points: 0, hardBlock: true }
        ]
      }
    ]
  },
  "互换": {
    setup: "互换",
    premise: "只做多：清楚的压力/支撑线被有效突破，回踩站上后在线附近判断。",
    riskLabel: "回踩已经跌回线下",
    questions: [
      {
        id: "line",
        text: "线：前面的压力/支撑线是否清楚？",
        options: [
          { id: "clear", label: "清楚", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "unclear", label: "不清楚", points: 0, hardBlock: true }
        ]
      },
      {
        id: "breakout",
        text: "突破：是否已经有效突破这条线？",
        options: [
          { id: "valid", label: "有效突破", points: 2 },
          { id: "uncertain", label: "刚刚突破/不确定", points: 1 },
          { id: "none", label: "没有突破", points: 0, hardBlock: true }
        ]
      },
      {
        id: "retest",
        text: "回踩：回踩是否站在线上？",
        options: [
          { id: "above", label: "明确站上", points: 2 },
          { id: "touching", label: "贴着线", points: 1 },
          { id: "below", label: "跌回线下", points: 0, hardBlock: true }
        ]
      },
      {
        id: "entry",
        text: "入场：是否靠近互换线，而不是离线太远？",
        options: [
          { id: "near", label: "靠近", points: 2 },
          { id: "far", label: "有点远", points: 1 },
          { id: "chasing", label: "追高", points: 0, hardBlock: true }
        ]
      }
    ]
  },
  "破小": {
    setup: "破小",
    premise: "只做多：大跌后的弱反弹小结构被假破，但不破大低点并守住。",
    riskLabel: "跌破后继续加速下跌",
    questions: [
      {
        id: "background",
        text: "背景：前面是否有一波明显大跌？",
        options: [
          { id: "clear", label: "明显大跌", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "none", label: "没有", points: 0, hardBlock: true }
        ]
      },
      {
        id: "small_structure",
        text: "小结构：是否形成小角度上升通道/小反弹？",
        options: [
          { id: "clear", label: "清楚", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "unclear", label: "不清楚", points: 0, hardBlock: true }
        ]
      },
      {
        id: "fake_break",
        text: "假破：是否跌破小结构，但没有破前面大低点？",
        options: [
          { id: "clear", label: "是，很清楚", points: 2 },
          { id: "uncertain", label: "不确定", points: 1 },
          { id: "major_low", label: "否，破了大低点", points: 0, hardBlock: true }
        ]
      },
      {
        id: "sharp_candle",
        text: "尖尖K：跌破后是否出现尖尖K并守住？",
        options: [
          { id: "held", label: "明显守住", points: 2 },
          { id: "normal", label: "一般", points: 1 },
          { id: "none", label: "没有", points: 0, hardBlock: true }
        ]
      }
    ]
  }
};

import { NextResponse } from "next/server";
import { isChartAnalysisResult } from "@/lib/chartAnalysis";
import { chartTimeframes } from "@/types/chartAnalysis";
import { instruments, setups } from "@/types/trade";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-5.5";
const MAX_IMAGE_DATA_URL_LENGTH = 21_000_000;

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallDecision",
    "confidence",
    "summary",
    "detectedSetups",
    "keyObservations",
    "riskWarnings",
    "waitFor",
    "missingContext"
  ],
  properties: {
    overallDecision: { type: "string", enum: ["不做", "等待", "可关注", "可以试单"] },
    confidence: { type: "string", enum: ["低", "中", "高"] },
    summary: { type: "string" },
    detectedSetups: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "grade", "reasons"],
        properties: {
          name: { type: "string", enum: [...setups] },
          grade: { type: "string", enum: ["A", "B", "C", "不适用", "不做"] },
          reasons: { type: "array", items: { type: "string" } }
        }
      }
    },
    keyObservations: { type: "array", items: { type: "string" } },
    riskWarnings: { type: "array", items: { type: "string" } },
    waitFor: { type: "array", items: { type: "string" } },
    missingContext: { type: "array", items: { type: "string" } }
  }
} as const;

const frameworkInstructions = `你是一个保守的交易框架助手，只分析用户提供的图表截图，不提供金融建议，不发出买卖指令，也不假装能执行交易。

框架限制：只评估做多。必须把“位置”放在“形态”之前。60分钟支撑/阻力、区间边界的重要性高于小周期形状；5分钟信号只有在关键位置附近才有意义。不要追价，必须存在清晰的止损逻辑位置，但不要计算或编造止损价格。看不清的价格、指标或线条不要猜。

四种形态：
1. 破底翻：跌破关键低点后快速收回，假跌破/收复明确，长下影或尖尖K可增强可信度。
2. 2-2：对支撑的第二次测试要有拒绝，最好重新站回关键位。
3. 互换：原阻力/支撑清楚切换角色，价格站在线上并守住。
4. 破小：大跌后形成浅的小型上升通道，在尾端跌破小结构但不破此前大低点，随后形成长下影并守住。

“87%破位风险”指斜向下压接近水平支撑，对做多危险。截图不清晰时明确说明。只有5分钟截图而没有高周期信息时，missingContext 必须指出缺少60分钟背景。

结论必须保守：条件不清楚用“不做”或“等待”；“可以试单”只用于位置、形态、拒绝/收复、风险条件都非常清楚的高质量框架匹配。confidence 表示你对图像判断的可信程度，不表示交易胜率。分析四种形态各一次，detectedSetups 必须恰好包含破底翻、2-2、互换、破小且不重复。用简洁、具体的中文输出。`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "服务器尚未配置 OPENAI_API_KEY。请在 .env.local 中添加后重启开发服务器。" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式无效。" }, { status: 400 });
  }

  const validation = validateRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { imageDataUrl, instrument, timeframe, note } = validation.value;
  const userContext = [
    `品种：${instrument}`,
    `截图周期：${timeframe}`,
    note ? `用户观察：${note}` : "用户观察：未提供",
    "请只根据可见证据和上述框架进行结构化判断。"
  ].join("\n");

  try {
    const openAIResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: frameworkInstructions,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: userContext },
              { type: "input_image", image_url: imageDataUrl }
            ]
          }
        ],
        reasoning: { effort: "low" },
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "chart_analysis",
            strict: true,
            schema: analysisSchema
          }
        },
        max_output_tokens: 2200
      })
    });

    if (!openAIResponse.ok) {
      const details = await safeOpenAIError(openAIResponse);
      console.error("OpenAI chart analysis failed", openAIResponse.status, details);
      return NextResponse.json(
        { error: openAIResponse.status === 401 ? "OPENAI_API_KEY 无效或无权限。" : "图表分析服务暂时失败，请稍后重试。" },
        { status: 502 }
      );
    }

    const payload = (await openAIResponse.json()) as unknown;
    const outputText = extractOutputText(payload);
    if (!outputText) {
      console.error("OpenAI response did not include output text", payload);
      return NextResponse.json({ error: "模型没有返回可读取的分析。" }, { status: 502 });
    }

    const result = JSON.parse(outputText) as unknown;
    if (!isChartAnalysisResult(result)) {
      console.error("OpenAI response did not match analysis schema", result);
      return NextResponse.json({ error: "模型返回的分析格式无效，请重试。" }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chart analysis route error", error);
    return NextResponse.json({ error: "无法连接图表分析服务，请检查网络后重试。" }, { status: 502 });
  }
}

type ValidRequest = {
  imageDataUrl: string;
  instrument: (typeof instruments)[number];
  timeframe: (typeof chartTimeframes)[number];
  note: string;
};

function validateRequest(body: unknown): { ok: true; value: ValidRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "请求内容不能为空。" };
  const value = body as Record<string, unknown>;
  const imageDataUrl = typeof value.imageDataUrl === "string" ? value.imageDataUrl : "";
  const instrument = value.instrument;
  const timeframe = value.timeframe;
  const note = typeof value.note === "string" ? value.note.trim() : "";

  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(imageDataUrl)) {
    return { ok: false, error: "请上传 PNG、JPEG 或 WebP 图表截图。" };
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    return { ok: false, error: "截图过大，请使用 15MB 以内的图片。" };
  }
  if (!instruments.includes(instrument as never)) return { ok: false, error: "不支持该品种。" };
  if (!chartTimeframes.includes(timeframe as never)) return { ok: false, error: "不支持该周期。" };
  if (note.length > 1000) return { ok: false, error: "补充说明不能超过 1000 字。" };

  return { ok: true, value: { imageDataUrl, instrument: instrument as ValidRequest["instrument"], timeframe: timeframe as ValidRequest["timeframe"], note } };
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return undefined;
  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return undefined;

  for (const item of response.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return undefined;
}

async function safeOpenAIError(response: Response) {
  try {
    const json = (await response.json()) as { error?: { message?: string } };
    return json.error?.message ?? "Unknown OpenAI API error";
  } catch {
    return "Unreadable OpenAI API error";
  }
}

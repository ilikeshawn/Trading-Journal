
import { GoogleGenAI, Type } from "@google/genai";
import { TradeEntry, TradingAccount } from "./types";

const TRADE_EXTRACTION_SCHEMA = {
  type: Type.ARRAY,
  description: "An array of trade entries extracted from the screenshot.",
  items: {
    type: Type.OBJECT,
    properties: {
      accountNumber: {
        type: Type.STRING,
        description: "The unique trading account number or ID.",
      },
      date: {
        type: Type.STRING,
        description: "The date in YYYY-MM-DD format.",
      },
      netProfit: {
        type: Type.NUMBER,
        description: "The net profit or loss amount.",
      },
      tradesCount: {
        type: Type.NUMBER,
        description: "Total number of trades executed.",
      },
      winCount: {
        type: Type.NUMBER,
        description: "Number of winning trades.",
      },
      lossCount: {
        type: Type.NUMBER,
        description: "Number of losing trades.",
      },
      avgTradeDuration: {
        type: Type.STRING,
        description: "The average duration of trades.",
      }
    },
    required: ["netProfit", "accountNumber"],
  }
};

const ACCOUNT_EXTRACTION_SCHEMA = {
  type: Type.ARRAY,
  description: "An array of trading accounts found in the screenshot.",
  items: {
    type: Type.OBJECT,
    properties: {
      accountNumber: {
        type: Type.STRING,
        description: "The unique account ID (e.g., APEX...).",
      },
      accountName: {
        type: Type.STRING,
        description: "The display name of the account.",
      },
      broker: {
        type: Type.STRING,
        description: "The platform or broker name.",
      },
      currency: {
        type: Type.STRING,
        description: "Currency code (e.g., USD, EUR).",
      }
    },
    required: ["accountNumber"],
  }
};

const BULK_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    accounts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          accountNumber: { type: Type.STRING },
          accountName: { type: Type.STRING },
          broker: { type: Type.STRING },
          currency: { type: Type.STRING }
        },
        required: ["accountNumber"]
      }
    },
    entries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          accountNumber: { type: Type.STRING },
          date: { type: Type.STRING },
          netProfit: { type: Type.NUMBER },
          tradesCount: { type: Type.NUMBER },
          winCount: { type: Type.NUMBER },
          lossCount: { type: Type.NUMBER }
        },
        required: ["accountNumber", "netProfit"]
      }
    }
  }
};

export const extractTradeData = async (base64Image: string): Promise<Partial<TradeEntry>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: "Analyze this trading screenshot. Extract every trade row or performance summary. Return strictly valid JSON array.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: TRADE_EXTRACTION_SCHEMA,
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Extraction failed:", error);
    throw error;
  }
};

export const extractAccountData = async (base64Image: string): Promise<Partial<TradingAccount>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: "Extract all unique trading accounts from this image. Return strictly valid JSON array.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: ACCOUNT_EXTRACTION_SCHEMA,
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Account extraction failed:", error);
    throw error;
  }
};

export const parseBulkText = async (text: string): Promise<{ accounts: Partial<TradingAccount>[], entries: Partial<TradeEntry>[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Parse the following raw text for trading account details and P&L entries. Extract as much structured data as possible. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: BULK_EXTRACTION_SCHEMA,
      },
    });

    return JSON.parse(response.text || '{"accounts": [], "entries": []}');
  } catch (error) {
    console.error("Bulk parsing failed:", error);
    throw error;
  }
};

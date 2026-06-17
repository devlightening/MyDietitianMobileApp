import apiClient from "./client";
import type { Ingredient } from "../types/alternative";
import type { AnalyzeImageResponse } from "./vision";

export interface PantryItem {
  ingredientId: string;
  ingredientName: string;
  quantity?: number | null;
  unit?: string | null;
  updatedAtUtc: string;
  lastReceiptLine?: PantryReceiptLine | null;
}

interface PantryResponse {
  items: PantryItem[];
}

export interface PantryReceiptLine {
  id?: string;
  receiptId?: string;
  savedAtUtc?: string;
  ingredientId: string;
  ingredientName?: string;
  rawLine: string;
  productName: string;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  lineTotal?: number | null;
  currency?: string | null;
  sortOrder?: number;
}

export interface PantryReceipt {
  id: string;
  sessionId?: string | null;
  savedAtUtc: string;
  receiptDate?: string | null;
  storeName?: string | null;
  currency: string;
  totalAmount?: number | null;
  lines: PantryReceiptLine[];
}

interface PantryReceiptsResponse {
  receipts: PantryReceipt[];
}

export interface PantryReceiptPayload {
  sessionId?: string | null;
  savedAtUtc?: string;
  receiptDate?: string | null;
  storeName?: string | null;
  currency?: string | null;
  totalAmount?: number | null;
  lines: PantryReceiptLine[];
}

export async function getPantry(): Promise<PantryItem[]> {
  const res = await apiClient.get<PantryResponse>("/api/client/pantry");
  return res.data?.items ?? [];
}

export type PantryUpdateSource = "manual" | "barcode" | "photo" | "receipt";

export async function replacePantry(
  items: Ingredient[],
  options?: { sourceType?: PantryUpdateSource; receipt?: PantryReceiptPayload },
): Promise<PantryItem[]> {
  const res = await apiClient.put<PantryResponse>("/api/client/pantry", {
    items: items.map((item) => ({
      ingredientId: item.id,
      quantity: null,
      unit: null,
    })),
    sourceType: options?.sourceType ?? "manual",
    receipt: options?.receipt,
  });

  return res.data?.items ?? [];
}

export async function getRecentPantryReceipts(limit: number = 10): Promise<PantryReceipt[]> {
  const res = await apiClient.get<PantryReceiptsResponse>("/api/client/pantry/receipts/recent", {
    params: { limit },
  });

  return res.data?.receipts ?? [];
}

export async function analyzeReceiptPantryImage(
  base64Image: string,
  mediaType: string = "image/jpeg",
): Promise<AnalyzeImageResponse> {
  const res = await apiClient.post<AnalyzeImageResponse>(
    "/api/client/pantry/analyze-receipt",
    { base64Image, mediaType },
    { timeout: 35_000 },
  );

  return res.data;
}

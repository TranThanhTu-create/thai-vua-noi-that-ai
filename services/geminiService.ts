
import { GoogleGenAI } from "@google/genai";
import { RoomType, DesignStyle } from "../types";

const API_KEY = process.env.API_KEY || '';

const generateWithRetry = async (
  ai: any,
  roomImageBase64: string,
  prompt: string,
  maxRetries: number = 2
): Promise<{ imageUrl: string; description: string } | null> => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: roomImageBase64.split(',')[1],
                mimeType: 'image/png',
              },
            },
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9", // Chuyển sang tỉ lệ 16:9 toàn cảnh
          }
        }
      });

      let imageUrl = '';
      let description = '';

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          description += part.text;
        }
      }

      if (imageUrl) {
        return { imageUrl, description };
      }
    } catch (error) {
      lastError = error;
      console.error(`Lỗi tại lần thử ${attempt + 1}:`, error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
};

export const generateInteriorDesigns = async (
  roomImageBase64: string,
  roomType: RoomType,
  style: DesignStyle,
  budget: string,
  requirements: string,
  count: number = 3
): Promise<{ imageUrl: string; description: string }[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const finalResults: { imageUrl: string; description: string }[] = [];
  
  const variations = [
    "Tập trung vào sự sang trọng, sử dụng vật liệu cao cấp như đá marble và gỗ óc chó.",
    "Tối ưu không gian mở, ánh sáng tự nhiên và bố cục tối giản, thanh lịch.",
    "Tạo không gian ấm cúng với tone màu trung tính, đèn decor nghệ thuật và cây xanh lọc không khí."
  ];

  for (let i = 0; i < count; i++) {
    const variationPrompt = variations[i % variations.length];
    const prompt = `YÊU CẦU THIẾT KẾ NỘI THẤT CAO CẤP (PHƯƠNG ÁN ${i + 1}):
    1. HIỆN TRẠNG: Dựa trên ảnh chụp căn phòng thực tế được đính kèm.
    2. NHIỆM VỤ: Thiết kế nội thất cho ${roomType} theo phong cách ${style}.
    3. YÊU CẦU RIÊNG CỦA KHÁCH HÀNG: "${requirements || 'Thiết kế đẹp, sang trọng và tối ưu công năng'}". AI PHẢI TUÂN THỦ NGHIÊM NGẶT YÊU CẦU NÀY.
    4. QUY TẮC HIỂN THỊ: SỬ DỤNG TỈ LỆ 16:9 (NGANG). Phải tạo góc nhìn toàn cảnh (Wide-angle) để khách hàng thấy được sự biến đổi của toàn bộ không gian phòng theo chiều ngang.
    5. CHẤT LƯỢNG: Ảnh photorealistic 8K, cực kỳ sắc nét. Nội thất phải chân thực, ánh sáng ấm áp, hài hòa.
    6. ĐIỂM NHẤN RIÊNG: ${variationPrompt}
    7. NGÔN NGỮ: Mô tả chi tiết các vật liệu và ý tưởng kiến tạo không gian bằng Tiếng Việt.`;

    const result = await generateWithRetry(ai, roomImageBase64, prompt);
    
    if (result) {
      finalResults.push({
        imageUrl: result.imageUrl,
        description: result.description || `Phương án ${i + 1}: Thiết kế ${roomType} đẳng cấp theo yêu cầu.`
      });
    }
  }

  return finalResults;
};

export const editInteriorDesign = async (
  currentImageBase64: string,
  editPrompt: string
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `CHỈNH SỬA NỘI THẤT CHI TIẾT:
  Yêu cầu: "${editPrompt}".
  LƯU Ý: Duy trì tỉ lệ khung hình 16:9 toàn cảnh. Đảm bảo các thay đổi vật liệu hay bố cục nhìn thật và sắc nét. Mô tả kết quả bằng Tiếng Việt.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: currentImageBase64.split(',')[1],
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
};

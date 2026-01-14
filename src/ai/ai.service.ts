import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private genAI: GoogleGenerativeAI | null = null;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('Gemini AI Service initialized with API Key.');
        } else {
            this.logger.warn('GEMINI_API_KEY not found. Running in MOCK mode.');
        }
    }

    async generateContent(prompt: string, context?: string): Promise<string> {
        if (!this.genAI) {
            // Mock logic for local development without API key
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return `### [MOCK] ${prompt}에 대한 Gemini AI 응답\n\n현재 \`GEMINI_API_KEY\`가 설정되지 않아 **테스트용 가공 데이터**를 반환합니다.\n\n- **주요 내용**: "${prompt}"에 대한 Gemini Flash 모델 기반 모의 분석입니다.\n- **참고**: .env 파일에 GEMINI_API_KEY를 설정하면 실제 기능을 사용할 수 있습니다.\n\n\`\`\`javascript\n// Example Code\nfunction helloGemini() {\n  console.log("Gemini Flash is ready!");\n}\n\`\`\``;
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

            const systemInstruction = '당신은 전문적인 소프트웨어 엔지니어이자 마스터 플래너입니다. 사용자의 요청에 대해 명확하고 구조화된 Markdown 형식으로 답변하세요. 코드 조각이 포함될 경우 적절한 언어 태그를 사용하세요.';

            const finalPrompt = context
                ? `${systemInstruction}\n\n다음은 현재 작성 중인 문서의 내용입니다:\n---\n${context}\n---\n이 문맥을 참고하여 다음 요청을 수행하세요: ${prompt}`
                : `${systemInstruction}\n\n요청사항: ${prompt}`;

            const result = await model.generateContent(finalPrompt);
            const response = await result.response;
            return response.text() || '생성된 내용이 없습니다.';
        } catch (error) {
            this.logger.error('Gemini API Error:', error);
            // If still 404, we might need to list models to see what's available
            throw new Error(`Gemini 콘텐츠 생성 중 오류가 발생했습니다. (모델: gemini-3-flash-preview)`);
        }
    }
}

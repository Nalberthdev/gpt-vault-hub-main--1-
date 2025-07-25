import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url?: string;
  }[];
}

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  clearChat: () => void;
  processCommand: (command: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Eu sou seu assistente GPT personalizado. Como posso ajudá-lo hoje?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  const simulateTyping = (duration: number = 2000) => {
    setIsTyping(true);
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, duration);
    });
  };

  const generateResponse = useCallback((userMessage: string, attachments?: File[]): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Command detection
    if (lowerMessage.includes('relatório') || lowerMessage.includes('relatorio')) {
      if (user?.role === 'admin') {
        return 'Perfeito! Vou gerar um relatório detalhado com base nos dados disponíveis. Como administrador, você tem acesso completo a todas as métricas e análises.';
      } else {
        return 'Entendo que você quer um relatório. Como usuário comum, posso gerar relatórios básicos dos seus próprios dados. Precisa de algo específico?';
      }
    }

    if (lowerMessage.includes('upload') || lowerMessage.includes('enviar')) {
      if (attachments && attachments.length > 0) {
        const fileTypes = attachments.map(f => f.type).join(', ');
        return `Excelente! Recebi ${attachments.length} arquivo(s): ${fileTypes}. Vou analisar o conteúdo e extrair as informações relevantes para você.`;
      }
      
      if (user?.role === 'admin') {
        return 'Como administrador, você pode fazer upload ilimitado de arquivos. Suporto PDF, CSV, DOCX e outros formatos. O que gostaria de enviar?';
      } else {
        const limit = user?.permissions.uploadLimit || 0;
        return `Você pode fazer upload de arquivos. Seu limite atual é de ${limit} arquivos por mês. Que tipo de arquivo gostaria de enviar?`;
      }
    }

    if (lowerMessage.includes('download') || lowerMessage.includes('baixar')) {
      if (user?.role === 'admin') {
        return 'Como administrador, você tem acesso irrestrito para download. Posso gerar relatórios em PDF, gráficos em PNG, ou exportar dados em CSV. O que precisa?';
      } else {
        return 'Posso ajudá-lo a baixar seus arquivos autorizados. Que tipo de arquivo está procurando?';
      }
    }

    if (lowerMessage.includes('tema') || lowerMessage.includes('escuro') || lowerMessage.includes('claro')) {
      return 'Você pode alternar entre tema claro e escuro usando o botão no canto superior direito da tela, ou me peça: "Ative o tema escuro" ou "Ative o tema claro".';
    }

    if (lowerMessage.includes('csv')) {
      return 'Ótimo! Para arquivos CSV, posso extrair dados, criar gráficos, calcular estatísticas e gerar relatórios. Você tem algum arquivo CSV específico em mente?';
    }

    if (lowerMessage.includes('pdf')) {
      return 'Perfeito! Com PDFs, posso fazer resumos automáticos, extrair texto e dados importantes, e criar análises detalhadas. Quer enviar um PDF para análise?';
    }

    // Generic responses based on user role
    if (user?.role === 'admin') {
      return `Como administrador, você tem acesso completo ao sistema. Posso ajudá-lo com análises avançadas, relatórios detalhados, gerenciamento de usuários e muito mais. O que precisa hoje?`;
    } else {
      return `Entendi sua solicitação! Como usuário, posso ajudá-lo com análise de documentos pessoais, resumos e assistência geral. Como posso ser útil?`;
    }
  }, [user]);

  const sendMessage = async (content: string, attachments?: File[]) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachments: attachments?.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate processing time
    await simulateTyping();

    // Generate and add assistant response
    const response = generateResponse(content, attachments);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const processCommand = async (command: string) => {
    await sendMessage(command);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat limpo! Como posso ajudá-lo?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const value: ChatContextType = {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    processCommand,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
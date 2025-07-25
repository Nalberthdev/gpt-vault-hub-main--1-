import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
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

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

interface ChatContextType {
  messages: ChatMessage[];
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  clearChat: () => void;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  processCommand: (command: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const createInitialConversation = (): Conversation => ({
    id: Date.now().toString(),
    title: 'Nova Conversa',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Olá! Eu sou seu assistente GPT personalizado. Como posso ajudá-lo hoje?',
        timestamp: new Date().toISOString(),
      },
    ],
  });

  // Load conversations from localStorage when user changes
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`gpt-conversations-${user.id}`);
      if (stored) {
        const convs: Conversation[] = JSON.parse(stored);
        setConversations(convs);
        setActiveConversationId(convs[0]?.id || null);
      } else {
        const conv = createInitialConversation();
        setConversations([conv]);
        setActiveConversationId(conv.id);
      }
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [user]);

  // Persist conversations
  useEffect(() => {
    if (user) {
      localStorage.setItem(`gpt-conversations-${user.id}`, JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const messages =
    conversations.find(c => c.id === activeConversationId)?.messages || [];

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
    if (!activeConversationId) return;

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

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              title: c.title === 'Nova Conversa' ? content.slice(0, 20) : c.title,
              messages: [...c.messages, userMessage],
            }
          : c
      )
    );

    await simulateTyping();

    const response = generateResponse(content, attachments);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      )
    );
  };

  const processCommand = async (command: string) => {
    await sendMessage(command);
  };

  const clearChat = () => {
    if (!activeConversationId) return;
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? {
              ...c,
              title: 'Nova Conversa',
              messages: [
                {
                  id: '1',
                  role: 'assistant',
                  content: 'Chat limpo! Como posso ajudá-lo?',
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );
  };

  const startNewConversation = () => {
    const conv = createInitialConversation();
    setConversations(prev => [conv, ...prev]);
    setActiveConversationId(conv.id);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const value: ChatContextType = {
    messages,
    conversations,
    activeConversationId,
    isTyping,
    sendMessage,
    clearChat,
    startNewConversation,
    selectConversation,
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

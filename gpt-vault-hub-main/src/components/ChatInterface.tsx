'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Download, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, isTyping, sendMessage } = useChat();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    if (user?.role !== 'admin' && attachments.length > 0) {
      const limit = user?.permissions.uploadLimit || 0;
      if (attachments.length > limit) {
        toast.error(`Limite de upload excedido. Máximo: ${limit} arquivos`);
        return;
      }
    }

    await sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const validFiles = files.filter(file =>
      allowedTypes.includes(file.type) || file.type.startsWith('text/')
    );

    if (validFiles.length !== files.length) {
      toast.error('Alguns arquivos não são suportados. Tipos aceitos: PDF, CSV, DOCX, TXT');
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const quickCommands = [
    {
      label: 'Gerar Relatório',
      command: 'Quero gerar um relatório com base nos dados disponíveis',
      icon: BarChart3,
      adminOnly: false,
    },
    {
      label: 'Analisar CSV',
      command: 'Preciso analisar dados de um arquivo CSV',
      icon: FileText,
      adminOnly: false,
    },
    {
      label: 'Download de Dados',
      command: 'Quero baixar meus dados processados',
      icon: Download,
      adminOnly: false,
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Título central */}
      <div className="text-center py-6">
        <h1 className="text-xl font-semibold">O que tem na agenda de hoje?</h1>
      </div>

      {/* Mensagens */}
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 pb-44 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex items-end', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {/* Avatar com lógica de tema */}
            <div className={cn(
              'w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center mr-2 mb-1',
              message.role === 'user'
                ? 'order-2 ml-2'
                : 'order-1 mr-2',
              'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            )}>
              {message.role === 'user' ? 'A' : 'G'}
            </div>

            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                message.role === 'user'
                  ? 'bg-chat-bubble-user text-primary-foreground ml-auto'
                  : 'bg-chat-bubble-assistant text-foreground mr-auto'
              )}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>

              {message.attachments?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-xs opacity-80"
                    >
                      <FileText className="h-3 w-3" />
                      <span>{attachment.name}</span>
                      <span>({(attachment.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-60 mt-1">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-chat-bubble-assistant text-gray-900 dark:text-white rounded-2xl px-4 py-3 shadow-sm mr-auto">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixo */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-input rounded-full px-4 py-2 shadow-lg border border-border">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isTyping}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-muted-foreground"
          />

          <Button
            type="submit"
            variant="chat"
            size="icon"
            disabled={isTyping || (!input.trim() && attachments.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Comandos rápidos abaixo do input */}
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {quickCommands
            .filter(cmd => !cmd.adminOnly || user?.role === 'admin')
            .map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(cmd.command)}
                className="text-xs"
              >
                <cmd.icon className="h-3 w-3 mr-1" />
                {cmd.label}
              </Button>
            ))}
        </div>
      </div>

      {/* Pré-visualização dos anexos */}
      {attachments.length > 0 && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-2">
          <Card className="p-3">
            <div className="text-sm font-medium mb-2">Arquivos anexados:</div>
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;

// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...outros configs
}

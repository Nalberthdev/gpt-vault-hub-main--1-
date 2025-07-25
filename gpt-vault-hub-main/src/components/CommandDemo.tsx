import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, BarChart3, Download, Upload, Palette, Crown } from 'lucide-react';

const CommandDemo: React.FC = () => {
  const { processCommand } = useChat();
  const { user } = useAuth();

  const commands = [
    {
      category: 'Análise de Arquivos',
      icon: FileText,
      adminOnly: false,
      commands: [
        {
          label: 'Analisar PDF',
          description: 'Extrair informações de um documento PDF',
          command: 'Quero enviar um PDF para análise e extração de dados',
        },
        {
          label: 'Processar CSV',
          description: 'Analisar dados de planilha CSV',
          command: 'Preciso processar um arquivo CSV e gerar insights',
        },
        {
          label: 'Resumir Documento',
          description: 'Criar resumo automático de documentos',
          command: 'Faça um resumo detalhado do documento que vou enviar',
        },
      ],
    },
    {
      category: 'Relatórios',
      icon: BarChart3,
      adminOnly: false,
      commands: [
        {
          label: 'Gerar Relatório',
          description: 'Criar relatório com base nos dados',
          command: 'Gere um relatório completo com base nos dados disponíveis',
        },
        {
          label: 'Estatísticas',
          description: 'Calcular estatísticas dos dados',
          command: 'Quero ver estatísticas e métricas dos meus dados',
        },
        {
          label: 'Visualização',
          description: 'Criar gráficos e visualizações',
          command: 'Crie gráficos visuais dos dados processados',
        },
      ],
    },
    {
      category: 'Downloads',
      icon: Download,
      adminOnly: false,
      commands: [
        {
          label: 'Baixar Relatório PDF',
          description: 'Download de relatório em PDF',
          command: 'Quero baixar o relatório gerado em formato PDF',
        },
        {
          label: 'Exportar Dados',
          description: 'Exportar dados processados',
          command: 'Exportar os dados processados em formato CSV',
        },
        {
          label: 'Baixar Gráficos',
          description: 'Download de gráficos e visualizações',
          command: 'Fazer download dos gráficos em alta resolução',
        },
      ],
    },
    {
      category: 'Configurações',
      icon: Palette,
      adminOnly: false,
      commands: [
        {
          label: 'Tema Escuro',
          description: 'Ativar modo escuro',
          command: 'Ativar o tema escuro',
        },
        {
          label: 'Tema Claro',
          description: 'Ativar modo claro',
          command: 'Ativar o tema claro',
        },
        {
          label: 'Ajuda',
          description: 'Mostrar comandos disponíveis',
          command: 'Mostrar todos os comandos disponíveis para meu perfil',
        },
      ],
    },
  ];

  const adminCommands = [
    {
      category: 'Administração',
      icon: Crown,
      adminOnly: true,
      commands: [
        {
          label: 'Relatório de Usuários',
          description: 'Ver estatísticas de todos os usuários',
          command: 'Gere um relatório completo de atividade dos usuários',
        },
        {
          label: 'Análise Avançada',
          description: 'Análises completas do sistema',
          command: 'Preciso de uma análise avançada de todos os dados do sistema',
        },
        {
          label: 'Backup de Dados',
          description: 'Fazer backup de todos os dados',
          command: 'Gerar backup completo de todos os dados e relatórios',
        },
      ],
    },
  ];

  const allCommands = user?.role === 'admin' ? [...commands, ...adminCommands] : commands;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Comandos Disponíveis</h2>
        <p className="text-muted-foreground">
          Experimente estes comandos para explorar as funcionalidades do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allCommands.map((category, categoryIndex) => {
          const IconComponent = category.icon;
          
          return (
            <Card key={categoryIndex} className="relative">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  {category.adminOnly && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-admin-accent text-admin-accent-foreground">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    </div>
                  )}
                </div>
                <CardDescription>
                  {category.adminOnly ? 'Comandos administrativos avançados' : 'Comandos disponíveis para seu perfil'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.commands.map((cmd, cmdIndex) => (
                  <div key={cmdIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{cmd.label}</h4>
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => processCommand(cmd.command)}
                        className="ml-2"
                      >
                        Testar
                      </Button>
                    </div>
                    {cmdIndex < category.commands.length - 1 && (
                      <div className="border-b border-border/50" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Upload de Arquivos:</strong> Use o ícone de clipe 📎 para anexar PDFs, CSVs ou documentos.</p>
          <p>• <strong>Comandos Naturais:</strong> Você pode digitar comandos em linguagem natural como "Analise este CSV".</p>
          <p>• <strong>Limites:</strong> {user?.role === 'admin' ? 'Como admin, você tem acesso ilimitado.' : `Seu limite mensal: ${user?.permissions.uploadLimit} uploads, ${user?.permissions.downloadLimit} downloads.`}</p>
          <p>• <strong>Contexto:</strong> O assistente mantém o contexto da conversa e lembra dos arquivos enviados.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommandDemo;
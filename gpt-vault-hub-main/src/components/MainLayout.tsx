import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import ChatInterface from './ChatInterface';
import AdminPanel from './AdminPanel';
import CommandDemo from './CommandDemo';
import { 
  LogOut, 
  Sun, 
  Moon, 
  MessageSquare, 
  Settings, 
  User,
  Crown,
  Terminal
} from 'lucide-react';


import { cn } from '@/lib/utils';

type ActiveTab = 'chat' | 'admin' | 'demo';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { clearChat } = useChat();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Tem certeza que deseja limpar o chat?')) {
      clearChat();
    }
  };

  const tabs = [
    {
      id: 'chat' as ActiveTab,
      label: 'Chat',
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      id: 'demo' as ActiveTab,
      label: 'Comandos',
      icon: Terminal,
      adminOnly: false,
    },
    {
      id: 'admin' as ActiveTab,
      label: 'Administração',
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
          
            <h1 className="text-lg font-bold">Audtax Copilot</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {user?.role === 'admin' ? (
                <Crown className="h-5 w-5 text-primary-foreground" />
              ) : (
                <User className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <span className={cn(
                "inline-block px-2 py-1 text-xs rounded-full mt-1",
                user?.role === 'admin' 
                  ? "bg-admin-accent text-admin-accent-foreground" 
                  : "bg-secondary text-secondary-foreground"
              )}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {tabs
              .filter(tab => !tab.adminOnly || user?.role === 'admin')
              .map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
          </nav>

          {/* Chat Actions */}
          {activeTab === 'chat' && (
            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClearChat}
              >
                Limpar Chat
              </Button>
            </div>
          )}

          {/* User Permissions Info */}
         
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold">
              {activeTab === 'chat' && 'Chat'}
              {activeTab === 'demo' && 'Comandos Disponíveis'}
              {activeTab === 'admin' && 'Painel Administrativo'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'chat' && 'Converse com seu assistente inteligente'}
              {activeTab === 'demo' && 'Explore os comandos e funcionalidades'}
              {activeTab === 'admin' && 'Gerencie usuários e permissões'}
            </p>
          </div>
          
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'demo' && <CommandDemo />}
          {activeTab === 'admin' && user?.role === 'admin' && <AdminPanel />}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
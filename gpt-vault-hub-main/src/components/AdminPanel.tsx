import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, User, UserRole } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Users, Shield, FileUp, Download } from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as UserRole,
    uploadLimit: 10,
    downloadLimit: 50,
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Nome e email são obrigatórios');
      return;
    }

    // Check if email already exists
    if (users.find(u => u.email === newUser.email)) {
      toast.error('Email já existe no sistema');
      return;
    }

    const userData: Omit<User, 'id' | 'createdAt'> = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: {
        uploadLimit: newUser.role === 'admin' ? null : newUser.uploadLimit,
        downloadLimit: newUser.role === 'admin' ? null : newUser.downloadLimit,
        canAccessReports: newUser.role === 'admin',
        canManageUsers: newUser.role === 'admin',
      },
    };

    addUser(userData);
    toast.success('Usuário adicionado com sucesso!');
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      uploadLimit: 10,
      downloadLimit: 50,
    });
  };

  const handleEditUser = () => {
    if (!editingUser) return;

    const updatedData: Partial<User> = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      permissions: {
        uploadLimit: editingUser.role === 'admin' ? null : editingUser.permissions.uploadLimit,
        downloadLimit: editingUser.role === 'admin' ? null : editingUser.permissions.downloadLimit,
        canAccessReports: editingUser.role === 'admin',
        canManageUsers: editingUser.role === 'admin',
      },
    };

    updateUser(editingUser.id, updatedData);
    toast.success('Usuário atualizado com sucesso!');
    setIsEditUserOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
      toast.success('Usuário excluído com sucesso!');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditUserOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    regularUsers: users.filter(u => u.role === 'user').length,
    recentLogins: users.filter(u => u.lastLogin && 
      new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button variant="admin">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === 'user' && (
                <>
                  <div>
                    <Label htmlFor="uploadLimit">Limite de Upload (por mês)</Label>
                    <Input
                      id="uploadLimit"
                      type="number"
                      value={newUser.uploadLimit}
                      onChange={(e) => setNewUser(prev => ({ ...prev, uploadLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="downloadLimit">Limite de Download (por mês)</Label>
                    <Input
                      id="downloadLimit"
                      type="number"
                      value={newUser.downloadLimit}
                      onChange={(e) => setNewUser(prev => ({ ...prev, downloadLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUser}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Comuns</CardTitle>
            <FileUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regularUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Recentes</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentLogins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie todos os usuários e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Upload Limit</TableHead>
                <TableHead>Download Limit</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.permissions.uploadLimit === null ? 'Ilimitado' : user.permissions.uploadLimit}
                  </TableCell>
                  <TableCell>
                    {user.permissions.downloadLimit === null ? 'Ilimitado' : user.permissions.downloadLimit}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: UserRole) => 
                    setEditingUser(prev => prev ? { ...prev, role: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser.role === 'user' && (
                <>
                  <div>
                    <Label htmlFor="edit-uploadLimit">Limite de Upload</Label>
                    <Input
                      id="edit-uploadLimit"
                      type="number"
                      value={editingUser.permissions.uploadLimit || 0}
                      onChange={(e) => setEditingUser(prev => prev ? {
                        ...prev,
                        permissions: { ...prev.permissions, uploadLimit: parseInt(e.target.value) }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-downloadLimit">Limite de Download</Label>
                    <Input
                      id="edit-downloadLimit"
                      type="number"
                      value={editingUser.permissions.downloadLimit || 0}
                      onChange={(e) => setEditingUser(prev => prev ? {
                        ...prev,
                        permissions: { ...prev.permissions, downloadLimit: parseInt(e.target.value) }
                      } : null)}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditUser}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { UserCog, UserPlus, X, CheckCircle } from 'lucide-react';

interface Moderator {
  id: string;
  user_id: string;
  fandom_id: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string | null;
  };
  fandom: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Fandom {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

export default function ModeratorsPanel() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [fandoms, setFandoms] = useState<Fandom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFandom, setSelectedFandom] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [addingModerator, setAddingModerator] = useState(false);

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fandom_moderators')
        .select(`
          id,
          user_id,
          fandom_id,
          created_at,
          user:user_id(id, username, avatar_url, full_name),
          fandom:fandom_id(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModerators(data as unknown as Moderator[]);
    } catch (error) {
      console.error('Error al cargar moderadores:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los moderadores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = async () => {
    setAddDialogOpen(true);
    try {
      // Cargar fandoms disponibles
      const { data: fandomsData, error: fandomsError } = await supabase
        .from('fandoms')
        .select('id, name, slug')
        .order('name');

      if (fandomsError) throw fandomsError;
      setFandoms(fandomsData as Fandom[]);

      // Cargar usuarios que podrían ser moderadores
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .order('username');

      if (usersError) throw usersError;
      setUsers(usersData as User[]);
    } catch (error) {
      console.error('Error al cargar datos para añadir moderador:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive"
      });
    }
  };

  const handleAddModerator = async () => {
    if (!selectedFandom || !selectedUser) {
      toast({
        title: "Error", 
        description: "Por favor selecciona un fandom y un usuario",
        variant: "destructive"
      });
      return;
    }

    try {
      setAddingModerator(true);
      
      // Verificar si ya existe este moderador
      const { data: existingMod, error: checkError } = await supabase
        .from('fandom_moderators')
        .select('id')
        .eq('fandom_id', selectedFandom)
        .eq('user_id', selectedUser)
        .single();
      
      if (existingMod) {
        toast({
          title: "Error",
          description: "Este usuario ya es moderador de este fandom",
          variant: "destructive"
        });
        return;
      }

      // Añadir nuevo moderador
      const { error } = await supabase
        .from('fandom_moderators')
        .insert({
          fandom_id: selectedFandom,
          user_id: selectedUser
        });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Moderador añadido correctamente"
      });
      setAddDialogOpen(false);
      fetchModerators();
      
      // Resetear selecciones
      setSelectedFandom(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al añadir moderador:', error);
      toast({
        title: "Error",
        description: "No se pudo añadir al moderador",
        variant: "destructive"
      });
    } finally {
      setAddingModerator(false);
    }
  };

  const handleRemoveModerator = async (moderatorId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar a este moderador?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fandom_moderators')
        .delete()
        .eq('id', moderatorId);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Moderador eliminado correctamente"
      });
      fetchModerators();
    } catch (error) {
      console.error('Error al eliminar moderador:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar al moderador",
        variant: "destructive"
      });
    }
  };

  const filteredModerators = moderators.filter(mod => 
    mod.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.fandom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Gestión de Moderadores</CardTitle>
          <Button onClick={handleOpenAddDialog} className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir Moderador
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por usuario o fandom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Fandom</TableHead>
                  <TableHead>Asignado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModerators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No se encontraron moderadores.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModerators.map((moderator) => (
                    <TableRow key={moderator.id}>
                      <TableCell className="font-medium">
                        {moderator.user.username}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                          {moderator.fandom.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(moderator.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveModerator(moderator.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir nuevo moderador</DialogTitle>
            <DialogDescription>
              Asigna un usuario como moderador de un fandom específico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fandom">Fandom</Label>
              <Select value={selectedFandom || ''} onValueChange={setSelectedFandom}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un fandom" />
                </SelectTrigger>
                <SelectContent>
                  {fandoms.map((fandom) => (
                    <SelectItem key={fandom.id} value={fandom.id}>
                      {fandom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} {user.full_name ? `(${user.full_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddModerator} 
              disabled={addingModerator || !selectedFandom || !selectedUser}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {addingModerator ? (
                <>Añadiendo...</>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
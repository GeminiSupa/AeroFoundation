import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Megaphone, Plus, Pin, Users, Calendar, AlertCircle, CheckCircle, Info, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isElevatedRole } from '../../utils/roles';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../lib/api/announcements';
import { Checkbox } from '../ui/checkbox';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  audience: string[];
  pinned: boolean;
  views: number;
}

export function AnnouncementsPage() {
  const { user } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: '',
    pinned: false,
    audiences: [] as string[]
  });

  const canCreate = isElevatedRole(user?.role) || user?.role === 'teacher';

  // Live announcements
  const queryClient = useQueryClient();
  const { data: announcementsData, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await getAnnouncements();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  const announcements: Announcement[] = useMemo(() => {
    return (announcementsData || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.body,
      author: a.author_name || 'Admin',
      authorRole: '-',
      date: (a.created_at || '').slice(0, 10),
      priority: 'medium',
      category: 'General',
      audience: a.audience || ['admin','teacher','student','parent'],
      pinned: !!a.published,
      views: 0,
    }));
  }, [announcementsData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/50';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const filteredAnnouncements = selectedCategory === 'all'
    ? announcements
    : announcements.filter(a => a.category === selectedCategory);

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.pinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.pinned);

  const createMutation = useMutation({
    mutationFn: (payload: any) => createAnnouncement(payload),
    onSuccess: () => {
      toast.success('Announcement Published Successfully! ✅');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsCreateOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', category: '', priority: '', pinned: false, audiences: [] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to publish announcement'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: any) => updateAnnouncement(id, updates),
    onSuccess: () => {
      toast.success('Announcement Updated Successfully! ✅');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsCreateOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', category: '', priority: '', pinned: false, audiences: [] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update announcement'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => {
      toast.success('Announcement Deleted');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteAnnouncementId(null);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete announcement'),
  });

  const handlePublishAnnouncement = () => {
    if (!formData.title || !formData.content || !formData.category || !formData.priority) {
      toast.error('Please fill in all required fields');
      return;
    }
    const payload = {
      title: formData.title,
      body: formData.content,
      audience: formData.audiences.length ? formData.audiences : ['admin','teacher','student','parent'],
      published: true,
      author_id: user?.id || null,
      author_name: user?.name || null,
    } as any;
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, updates: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      priority: announcement.priority,
      pinned: announcement.pinned,
      audiences: announcement.audience
    });
    setIsCreateOpen(true);
  };

  const handleDeleteAnnouncement = () => {
    if (!deleteAnnouncementId) return;
    deleteMutation.mutate(deleteAnnouncementId);
  };

  const toggleAudience = (audience: string) => {
    setFormData(prev => ({
      ...prev,
      audiences: prev.audiences.includes(audience)
        ? prev.audiences.filter(a => a !== audience)
        : [...prev.audiences, audience]
    }));
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-module-announcements">
            <Megaphone className="w-7 h-7 sm:w-8 sm:h-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {canCreate 
              ? 'View and manage school-wide announcements' 
              : 'Stay updated with important school information'}
          </p>
        </div>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-module-announcements hover:bg-module-announcements/90">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </DialogTitle>
                <DialogDescription>
                  {editingAnnouncement ? 'Update your announcement details' : 'Post an announcement to inform your audience'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    placeholder="Write your announcement..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Events">Events</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Facilities">Facilities</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Audience *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="students"
                        checked={formData.audiences.includes('students')}
                        onCheckedChange={() => toggleAudience('students')}
                      />
                      <label htmlFor="students" className="text-sm cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        Students
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="parents"
                        checked={formData.audiences.includes('parents')}
                        onCheckedChange={() => toggleAudience('parents')}
                      />
                      <label htmlFor="parents" className="text-sm cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        Parents
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="teachers"
                        checked={formData.audiences.includes('teachers')}
                        onCheckedChange={() => toggleAudience('teachers')}
                      />
                      <label htmlFor="teachers" className="text-sm cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        Teachers
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="pinned"
                    checked={formData.pinned}
                    onCheckedChange={(checked) => setFormData({ ...formData, pinned: !!checked })}
                  />
                  <Label htmlFor="pinned" className="cursor-pointer">
                    Pin this announcement
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingAnnouncement(null);
                    setFormData({ title: '', content: '', category: '', priority: '', pinned: false, audiences: [] });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handlePublishAnnouncement}>
                    {editingAnnouncement ? 'Update' : 'Publish'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Category:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Academic">Academic</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Facilities">Facilities</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-primary" />
            <h2>Pinned Announcements</h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin className="h-4 w-4 text-primary" />
                      <CardTitle>{announcement.title}</CardTitle>
                      <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                        {getPriorityIcon(announcement.priority)}
                        <span className="ml-1">{announcement.priority}</span>
                      </Badge>
                    </div>
                    <CardDescription>
                      Posted by {announcement.author} ({announcement.authorRole}) • {announcement.date}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    {announcement.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>{announcement.content}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>For: {announcement.audience.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Megaphone className="h-4 w-4" />
                      <span>{announcement.views} views</span>
                    </div>
                  </div>
                  {canCreate && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeleteAnnouncementId(announcement.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error/Empty States */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading announcements...</div>
      ) : error ? (
        <div className="text-destructive">{(error as any).message || 'Failed to load announcements'}</div>
      ) : null}

      {/* Regular Announcements */}
      <div className="space-y-3">
        {pinnedAnnouncements.length > 0 && (
          <h2>Recent Announcements</h2>
        )}
        {regularAnnouncements.length === 0 && !isLoading && !error && (
          <Card>
            <CardContent className="p-6 text-muted-foreground">No announcements yet</CardContent>
          </Card>
        )}
        {regularAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                      {getPriorityIcon(announcement.priority)}
                      <span className="ml-1">{announcement.priority}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Posted by {announcement.author} ({announcement.authorRole}) • {announcement.date}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {announcement.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>{announcement.content}</p>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>For: {announcement.audience.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Megaphone className="h-4 w-4" />
                    <span>{announcement.views} views</span>
                  </div>
                </div>
                {canCreate && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDeleteAnnouncementId(announcement.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAnnouncementId} onOpenChange={() => setDeleteAnnouncementId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The announcement will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAnnouncement}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

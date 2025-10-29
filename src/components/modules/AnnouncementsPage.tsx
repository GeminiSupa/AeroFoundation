import React, { useState } from 'react';
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
import { toast } from 'sonner';
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

  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  // Mock data
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Midterm Exam Schedule Released',
      content: 'The midterm examination schedule for Fall 2025 has been published. Please check the academic calendar for your exam dates and times. Make sure to arrive 15 minutes early for all exams.',
      author: 'Dr. Sarah Johnson',
      authorRole: 'Principal',
      date: '2025-10-18',
      priority: 'high',
      category: 'Academic',
      audience: ['students', 'parents', 'teachers'],
      pinned: true,
      views: 342
    },
    {
      id: '2',
      title: 'Parent-Teacher Conference Sign-ups Open',
      content: 'Sign-ups for Fall parent-teacher conferences are now open. Conferences will be held October 26-27. Please use the portal to book your preferred time slots.',
      author: 'Admin Team',
      authorRole: 'Administration',
      date: '2025-10-17',
      priority: 'medium',
      category: 'Events',
      audience: ['parents', 'teachers'],
      pinned: true,
      views: 256
    },
    {
      id: '3',
      title: 'Science Fair Registration Deadline',
      content: 'Reminder: The deadline to register for the Annual Science Fair is October 25th. All interested students must submit their project proposals by this date.',
      author: 'Emily Rodriguez',
      authorRole: 'Science Department Head',
      date: '2025-10-16',
      priority: 'medium',
      category: 'Academic',
      audience: ['students'],
      pinned: false,
      views: 189
    },
    {
      id: '4',
      title: 'New Library Hours',
      content: 'Starting next week, the library will extend its hours on weekdays until 6 PM to accommodate after-school study sessions. Weekend hours remain unchanged.',
      author: 'James Wilson',
      authorRole: 'Librarian',
      date: '2025-10-15',
      priority: 'low',
      category: 'Facilities',
      audience: ['students', 'teachers'],
      pinned: false,
      views: 134
    },
    {
      id: '5',
      title: 'Winter Sports Tryouts Announced',
      content: 'Tryouts for winter sports teams (Basketball, Swimming, Wrestling) will begin November 1st. All students interested in participating should register with Coach Martinez by October 28th.',
      author: 'Coach Martinez',
      authorRole: 'Athletics Director',
      date: '2025-10-14',
      priority: 'medium',
      category: 'Sports',
      audience: ['students', 'parents'],
      pinned: false,
      views: 221
    },
    {
      id: '6',
      title: 'Campus Wi-Fi Maintenance',
      content: 'The IT department will perform network maintenance on Saturday, October 21st from 2-4 AM. Wi-Fi services may be briefly interrupted during this time.',
      author: 'IT Department',
      authorRole: 'Technical Services',
      date: '2025-10-13',
      priority: 'low',
      category: 'Technology',
      audience: ['students', 'teachers', 'parents'],
      pinned: false,
      views: 98
    }
  ];

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

  const handlePublishAnnouncement = () => {
    if (!formData.title || !formData.content || !formData.category || !formData.priority) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (editingAnnouncement) {
      toast.success('Announcement Updated Successfully! ✅', {
        description: 'The announcement has been updated and is now visible to selected audiences.'
      });
    } else {
      toast.success('Announcement Published Successfully! ✅', {
        description: 'Your announcement is now visible to selected audiences.'
      });
    }
    
    setIsCreateOpen(false);
    setEditingAnnouncement(null);
    setFormData({ title: '', content: '', category: '', priority: '', pinned: false, audiences: [] });
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
    toast.success('Announcement Deleted', {
      description: 'The announcement has been removed from the system.'
    });
    setDeleteAnnouncementId(null);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">Announcements</h1>
          <p className="text-gray-400 mt-1">
            {canCreate 
              ? 'View and manage school-wide announcements' 
              : 'Stay updated with important school information'}
          </p>
        </div>
        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingAnnouncement ? 'Update your announcement details' : 'Post an announcement to inform your audience'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title *</Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white" 
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="text-gray-300">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={5}
                    placeholder="Write your announcement..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
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
                    <Label htmlFor="priority" className="text-gray-300">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 block">Audience *</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="students"
                        checked={formData.audiences.includes('students')}
                        onCheckedChange={() => toggleAudience('students')}
                      />
                      <label htmlFor="students" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-400" />
                        Students
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="parents"
                        checked={formData.audiences.includes('parents')}
                        onCheckedChange={() => toggleAudience('parents')}
                      />
                      <label htmlFor="parents" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-purple-400" />
                        Parents
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="teachers"
                        checked={formData.audiences.includes('teachers')}
                        onCheckedChange={() => toggleAudience('teachers')}
                      />
                      <label htmlFor="teachers" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                        <Users className="h-3 w-3 text-green-400" />
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
                  <Label htmlFor="pinned" className="text-gray-300 cursor-pointer">
                    Pin this announcement
                  </Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingAnnouncement(null);
                    setFormData({ title: '', content: '', category: '', priority: '', pinned: false, audiences: [] });
                  }} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handlePublishAnnouncement} className="bg-blue-600 hover:bg-blue-700">
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
        <Label className="text-gray-300">Filter by Category:</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
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
            <Pin className="h-5 w-5 text-blue-400" />
            <h2 className="text-white">Pinned Announcements</h2>
          </div>
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="bg-gray-800 border-blue-500/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pin className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-white">{announcement.title}</CardTitle>
                      <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                        {getPriorityIcon(announcement.priority)}
                        <span className="ml-1">{announcement.priority}</span>
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Posted by {announcement.author} ({announcement.authorRole}) • {announcement.date}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400">
                    {announcement.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300">{announcement.content}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
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
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeleteAnnouncementId(announcement.id)}
                        className="text-red-400 hover:text-red-300"
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

      {/* Regular Announcements */}
      <div className="space-y-3">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-white">Recent Announcements</h2>
        )}
        {regularAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-white">{announcement.title}</CardTitle>
                    <Badge variant="outline" className={getPriorityColor(announcement.priority)}>
                      {getPriorityIcon(announcement.priority)}
                      <span className="ml-1">{announcement.priority}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400">
                    Posted by {announcement.author} ({announcement.authorRole}) • {announcement.date}
                  </CardDescription>
                </div>
                <Badge className="bg-gray-700 text-gray-300">
                  {announcement.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-300">{announcement.content}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-400">
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
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setDeleteAnnouncementId(announcement.id)}
                      className="text-red-400 hover:text-red-300"
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
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. The announcement will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAnnouncement}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

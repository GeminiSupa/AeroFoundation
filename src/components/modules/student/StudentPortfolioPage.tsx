import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Upload, FileText, Image as ImageIcon, Video, Award, Share2, Download, Trash2, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';

interface PortfolioItem {
  id: string;
  title: string;
  subject: string;
  type: 'essay' | 'project' | 'artwork' | 'video' | 'certificate';
  dateAdded: string;
  grade?: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  featured: boolean;
}

export function StudentPortfolioPage() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data
  const portfolioItems: PortfolioItem[] = [
    {
      id: '1',
      title: 'Research Paper: Climate Change Impact',
      subject: 'Science',
      type: 'essay',
      dateAdded: '2025-09-15',
      grade: 'A',
      description: 'Comprehensive analysis of climate change effects on marine ecosystems',
      fileUrl: '#',
      tags: ['research', 'environmental science', 'marine biology'],
      featured: true
    },
    {
      id: '2',
      title: 'Robotics Competition - 1st Place',
      subject: 'Engineering',
      type: 'certificate',
      dateAdded: '2025-08-20',
      description: 'Regional robotics championship winner',
      fileUrl: '#',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
      tags: ['robotics', 'competition', 'STEM'],
      featured: true
    },
    {
      id: '3',
      title: 'Historical Documentary: Civil Rights Movement',
      subject: 'History',
      type: 'video',
      dateAdded: '2025-10-01',
      grade: 'A+',
      description: '15-minute documentary on the impact of the Civil Rights Movement',
      fileUrl: '#',
      thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      tags: ['history', 'documentary', 'multimedia'],
      featured: false
    },
    {
      id: '4',
      title: 'Abstract Art Collection',
      subject: 'Art',
      type: 'artwork',
      dateAdded: '2025-09-28',
      description: 'Series of abstract paintings exploring color theory',
      fileUrl: '#',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      tags: ['art', 'painting', 'color theory'],
      featured: false
    },
    {
      id: '5',
      title: 'Math Olympiad Participation',
      subject: 'Mathematics',
      type: 'certificate',
      dateAdded: '2025-07-10',
      description: 'Qualified for state-level mathematics competition',
      fileUrl: '#',
      tags: ['mathematics', 'competition'],
      featured: false
    },
    {
      id: '6',
      title: 'Science Fair Project: Solar Energy',
      subject: 'Physics',
      type: 'project',
      dateAdded: '2025-06-15',
      grade: 'A',
      description: 'Working model of solar panel efficiency optimization',
      fileUrl: '#',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      tags: ['physics', 'renewable energy', 'innovation'],
      featured: true
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay': return <FileText className="h-5 w-5" />;
      case 'project': return <FileText className="h-5 w-5" />;
      case 'artwork': return <ImageIcon className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'certificate': return <Award className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay': return 'bg-blue-500/10 text-blue-400';
      case 'project': return 'bg-purple-500/10 text-purple-400';
      case 'artwork': return 'bg-pink-500/10 text-pink-400';
      case 'video': return 'bg-red-500/10 text-red-400';
      case 'certificate': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const filteredItems = selectedSubject === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.subject === selectedSubject);

  const featuredItems = portfolioItems.filter(item => item.featured);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-student">
            My Digital Portfolio
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Showcase your best academic work and achievements</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Portfolio</DialogTitle>
                <DialogDescription>
                  Generate a shareable link for teachers, counselors, or colleges
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shareWith">Share With</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="counselor">School Counselor</SelectItem>
                      <SelectItem value="college">College Admissions</SelectItem>
                      <SelectItem value="public">Public Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shareLink">Shareable Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="shareLink"
                      value="https://sms.school.edu/portfolio/student123"
                      readOnly
                    />
                    <Button variant="outline">
                      Copy
                    </Button>
                  </div>
                </div>
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <AlertDescription className="text-blue-200 text-sm">
                    This link will be valid for 30 days. You can revoke access at any time.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Generate New Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-role-student hover:bg-role-student/90">
                <Upload className="mr-2 h-4 w-4" />
                Add Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add to Portfolio</DialogTitle>
                <DialogDescription>
                  Upload your best academic work
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="itemTitle">Title</Label>
                    <Input id="itemTitle" />
                  </div>
                  <div>
                    <Label htmlFor="itemSubject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="itemType">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay/Paper</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="artwork">Artwork</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="certificate">Certificate/Award</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="itemDescription">Description</Label>
                    <Textarea
                      id="itemDescription"
                      placeholder="Describe your work..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemGrade">Grade Received (Optional)</Label>
                    <Input id="itemGrade" placeholder="e.g., A+" />
                  </div>
                  <div>
                    <Label htmlFor="itemTags">Tags</Label>
                    <Input id="itemTags" placeholder="Separate with commas" />
                  </div>
                  <div className="col-span-2">
                    <Label>Upload File</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-border/80 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG, PNG, MP4 (Max 50MB)</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-role-student hover:bg-role-student/90">Add to Portfolio</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-3xl">{portfolioItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">In your portfolio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Featured</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{featuredItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Best work highlighted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Subjects</CardDescription>
            <CardTitle className="text-3xl">
              {new Set(portfolioItems.map(item => item.subject)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Areas covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awards</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {portfolioItems.filter(item => item.type === 'certificate').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">All Work</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-blue-600">Featured</TabsTrigger>
          </TabsList>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="History">History</SelectItem>
              <SelectItem value="Art">Art</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:border-border/80 transition-colors">
                {item.thumbnailUrl && (
                  <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.featured && (
                      <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {item.subject}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(item.type)}>
                      {getTypeIcon(item.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  {item.grade && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Grade:</span>
                      <Badge className="bg-green-500/10 text-green-400">{item.grade}</Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{item.dateAdded}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredItems.map((item) => (
              <Card key={item.id} className="border-blue-500/50">
                {item.thumbnailUrl && (
                  <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                      Featured
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {item.subject}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(item.type)}>
                      {getTypeIcon(item.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.grade && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Grade:</span>
                      <Badge className="bg-green-500/10 text-green-400">{item.grade}</Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{item.dateAdded}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

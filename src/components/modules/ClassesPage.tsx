import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Users, Plus, Calendar, Upload, FileText, Paperclip, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useState } from 'react';

export function ClassesPage() {
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const classes = [
    { id: 1, name: 'Mathematics 10A', students: 32, room: 'Room 201', schedule: 'Mon, Wed, Fri 9:00 AM', status: 'active' },
    { id: 2, name: 'Mathematics 10B', students: 30, room: 'Room 201', schedule: 'Tue, Thu 11:00 AM', status: 'active' },
    { id: 3, name: 'Algebra 9A', students: 25, room: 'Room 105', schedule: 'Mon, Wed 2:00 PM', status: 'active' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleCreateAssignment = () => {
    if (!selectedClass || !assignmentTitle || !assignmentDescription || !dueDate) {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields'
      });
      return;
    }

    toast.success('Assignment Created!', {
      description: `Assignment "${assignmentTitle}" has been created for ${classes.find(c => c.id.toString() === selectedClass)?.name}`
    });

    // Reset form
    setSelectedClass('');
    setAssignmentTitle('');
    setAssignmentDescription('');
    setDueDate('');
    setUploadedFiles([]);
    setIsAssignmentDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            My Classes
          </h1>
          <p className="text-muted-foreground">Manage your teaching assignments</p>
        </div>
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create a new assignment with description and attach files for your students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="class">Select Class *</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id.toString()}>
                        {classItem.name} - {classItem.students} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 5 Homework - Quadratic Equations"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Assignment Notes/Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Write detailed instructions for the assignment...&#10;&#10;Example:&#10;- Complete problems 1-15 from the textbook&#10;- Show all work and calculations&#10;- Submit before the due date"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  rows={8}
                  className="min-h-[200px] font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {assignmentDescription.length} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">
                  <Paperclip className="w-4 h-4 inline mr-2" />
                  Attach Files (PDFs, Images, Documents)
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <Label htmlFor="files" className="cursor-pointer text-primary hover:underline">
                        Click to upload files
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                      </p>
                    </div>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm">Attached Files ({uploadedFiles.length}):</p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 bg-secondary rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsAssignmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <h2 className="mt-2">5</h2>
                <Badge className="mt-2">Active</Badge>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <h2 className="mt-2">142</h2>
                <Badge className="mt-2" variant="secondary">Enrolled</Badge>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <h2 className="mt-2">15</h2>
                <Badge className="mt-2" variant="secondary">Sessions</Badge>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Overview</CardTitle>
          <CardDescription>All your teaching assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-500 p-2 rounded-lg text-white">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {classItem.name}
                    </div>
                  </TableCell>
                  <TableCell>{classItem.students} students</TableCell>
                  <TableCell>
                    <Badge variant="outline">{classItem.room}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{classItem.schedule}</TableCell>
                  <TableCell>
                    <Badge variant="default">{classItem.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Students</Button>
                      <Button size="sm" variant="outline">Mark Attendance</Button>
                      <Button size="sm">Add Assignment</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 p-2 rounded-lg text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-base">{classItem.name}</CardTitle>
                </div>
                <Badge>{classItem.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <span>{classItem.students}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Room</span>
                <span>{classItem.room}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Schedule</span>
                <span className="text-xs">{classItem.schedule}</span>
              </div>
              <div className="pt-2 space-y-2">
                <Button size="sm" className="w-full" variant="outline">View Details</Button>
                <Button size="sm" className="w-full">Take Attendance</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
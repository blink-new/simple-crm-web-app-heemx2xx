
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getContact, getActivities, createActivity, deleteActivity, updateContact } from '../../lib/api';
import { Contact, Activity, Tag } from '../../types';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityType, setActivityType] = useState<'Call' | 'Meeting' | 'Email' | 'Note'>('Note');
  const [activityDescription, setActivityDescription] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [contactData, activitiesData] = await Promise.all([
          getContact(id),
          getActivities(id)
        ]);
        setContact(contactData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load contact data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddActivity = async () => {
    if (!id || !activityDescription.trim()) return;
    
    setIsAddingActivity(true);
    try {
      const newActivity = await createActivity({
        contact_id: id,
        type: activityType,
        description: activityDescription,
        date: new Date().toISOString(),
      });
      
      setActivities([newActivity, ...activities]);
      setActivityDescription('');
      setIsDialogOpen(false);
      toast.success('Activity added successfully');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('Failed to add activity');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      setActivities(activities.filter(activity => activity.id !== activityId));
      toast.success('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    } finally {
      setActivityToDelete(null);
    }
  };

  const handleStatusChange = async (status: 'Lead' | 'Prospect' | 'Customer') => {
    if (!id || !contact) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedContact = await updateContact(id, { status });
      setContact({ ...contact, status: updatedContact.status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'Email':
        return <Mail className="h-5 w-5 text-green-500" />;
      case 'Meeting':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'Note':
        return <Edit className="h-5 w-5 text-yellow-500" />;
      default:
        return <Edit className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead':
        return 'bg-blue-100 text-blue-800';
      case 'Prospect':
        return 'bg-green-100 text-green-800';
      case 'Customer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Contact not found</h3>
        <p className="text-muted-foreground mt-1">
          The contact you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/contacts">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to contacts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/contacts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {contact.first_name} {contact.last_name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Select
            value={contact.status}
            onValueChange={(value) => handleStatusChange(value as 'Lead' | 'Prospect' | 'Customer')}
            disabled={isUpdatingStatus}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          
          <Button asChild>
            <Link to={`/contacts/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                <p className="text-sm text-muted-foreground">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </p>
              </div>
            </div>
            
            {contact.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="font-medium hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}
            
            {contact.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="font-medium hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
            
            {contact.company && (
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{contact.company}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(contact.created_at), 'PPP')}
                </p>
              </div>
            </div>
            
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 text-muted-foreground mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                    <path d="M7 7h.01"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contact.tags.map(tag => (
                      <Badge 
                        key={tag.id} 
                        style={{ backgroundColor: tag.color }}
                        className="text-white"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activities</CardTitle>
              <CardDescription>
                Recent interactions with this contact
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Activity</DialogTitle>
                  <DialogDescription>
                    Record a new interaction with this contact.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Activity Type</label>
                    <Select
                      value={activityType}
                      onValueChange={(value) => setActivityType(value as 'Call' | 'Meeting' | 'Email' | 'Note')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      placeholder="Enter details about the activity..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddActivity}
                    disabled={isAddingActivity || !activityDescription.trim()}
                  >
                    {isAddingActivity ? 'Adding...' : 'Add Activity'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="calls">Calls</TabsTrigger>
                <TabsTrigger value="meetings">Meetings</TabsTrigger>
                <TabsTrigger value="emails">Emails</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-10 border rounded-lg">
                    <h3 className="text-lg font-medium">No activities yet</h3>
                    <p className="text-muted-foreground mt-1">
                      Record your first interaction with this contact.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Activity
                    </Button>
                  </div>
                ) : (
                  activities.map(activity => (
                    <ActivityItem 
                      key={activity.id}
                      activity={activity}
                      onDelete={() => setActivityToDelete(activity.id)}
                      getActivityIcon={getActivityIcon}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="calls" className="space-y-4">
                {activities.filter(a => a.type === 'Call').length === 0 ? (
                  <div className="text-center py-10 border rounded-lg">
                    <h3 className="text-lg font-medium">No calls recorded</h3>
                    <p className="text-muted-foreground mt-1">
                      Record your first call with this contact.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setActivityType('Call');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Call
                    </Button>
                  </div>
                ) : (
                  activities
                    .filter(a => a.type === 'Call')
                    .map(activity => (
                      <ActivityItem 
                        key={activity.id}
                        activity={activity}
                        onDelete={() => setActivityToDelete(activity.id)}
                        getActivityIcon={getActivityIcon}
                      />
                    ))
                )}
              </TabsContent>
              
              <TabsContent value="meetings" className="space-y-4">
                {activities.filter(a => a.type === 'Meeting').length === 0 ? (
                  <div className="text-center py-10 border rounded-lg">
                    <h3 className="text-lg font-medium">No meetings recorded</h3>
                    <p className="text-muted-foreground mt-1">
                      Record your first meeting with this contact.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setActivityType('Meeting');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Meeting
                    </Button>
                  </div>
                ) : (
                  activities
                    .filter(a => a.type === 'Meeting')
                    .map(activity => (
                      <ActivityItem 
                        key={activity.id}
                        activity={activity}
                        onDelete={() => setActivityToDelete(activity.id)}
                        getActivityIcon={getActivityIcon}
                      />
                    ))
                )}
              </TabsContent>
              
              <TabsContent value="emails" className="space-y-4">
                {activities.filter(a => a.type === 'Email').length === 0 ? (
                  <div className="text-center py-10 border rounded-lg">
                    <h3 className="text-lg font-medium">No emails recorded</h3>
                    <p className="text-muted-foreground mt-1">
                      Record your first email with this contact.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setActivityType('Email');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Email
                    </Button>
                  </div>
                ) : (
                  activities
                    .filter(a => a.type === 'Email')
                    .map(activity => (
                      <ActivityItem 
                        key={activity.id}
                        activity={activity}
                        onDelete={() => setActivityToDelete(activity.id)}
                        getActivityIcon={getActivityIcon}
                      />
                    ))
                )}
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                {activities.filter(a => a.type === 'Note').length === 0 ? (
                  <div className="text-center py-10 border rounded-lg">
                    <h3 className="text-lg font-medium">No notes recorded</h3>
                    <p className="text-muted-foreground mt-1">
                      Add your first note about this contact.
                    </p>
                    <Button 
                className="mt-4"
                      onClick={() => {
                        setActivityType('Note');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                ) : (
                  activities
                    .filter(a => a.type === 'Note')
                    .map(activity => (
                      <ActivityItem 
                        key={activity.id}
                        activity={activity}
                        onDelete={() => setActivityToDelete(activity.id)}
                        getActivityIcon={getActivityIcon}
                      />
                    ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!activityToDelete} onOpenChange={() => setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => activityToDelete && handleDeleteActivity(activityToDelete)}
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

type ActivityItemProps = {
  activity: Activity;
  onDelete: () => void;
  getActivityIcon: (type: string) => JSX.Element;
};

function ActivityItem({ activity, onDelete, getActivityIcon }: ActivityItemProps) {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      <div className="bg-primary/10 rounded-full p-2 mt-1">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">
            {activity.type}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
          <span className="mx-1">•</span>
          {format(new Date(activity.date), 'PPp')}
        </p>
        <p className="mt-2 text-sm whitespace-pre-wrap">{activity.description}</p>
      </div>
    </div>
  );
}
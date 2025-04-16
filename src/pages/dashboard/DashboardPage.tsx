
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContacts, getActivities } from '../../lib/api';
import { Contact, Activity } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, UserPlus, Phone, Mail, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const contactsData = await getContacts();
        setContacts(contactsData);
        
        // Get activities for the first 5 contacts
        const activitiesPromises = contactsData
          .slice(0, 5)
          .map(contact => getActivities(contact.id));
        
        const activitiesResults = await Promise.all(activitiesPromises);
        const allActivities = activitiesResults
          .flat()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setRecentActivities(allActivities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'Email':
        return <Mail className="h-5 w-5 text-green-500" />;
      case 'Meeting':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'Note':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Link to="/contacts/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contacts.filter(c => c.status === 'Lead').length} leads, {contacts.filter(c => c.status === 'Prospect').length} prospects, {contacts.filter(c => c.status === 'Customer').length} customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => 
                c.status === 'Lead' && 
                new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              +{contacts.filter(c => 
                new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.length ? 
                Math.round((contacts.filter(c => c.status === 'Customer').length / contacts.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lead to customer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>
              Your most recently added contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No contacts yet</p>
                  <Link to="/contacts/new" className="text-primary hover:underline mt-2 inline-block">
                    Add your first contact
                  </Link>
                </div>
              ) : (
                contacts.slice(0, 5).map(contact => (
                  <div key={contact.id} className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Link to={`/contacts/${contact.id}`} className="font-medium hover:underline">
                        {contact.first_name} {contact.last_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{contact.company || 'No company'}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {contacts.length > 0 && (
              <div className="mt-4 text-center">
                <Link to="/contacts" className="text-primary hover:underline text-sm">
                  View all contacts
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest interactions with your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No activities yet</p>
                  <Link to="/contacts" className="text-primary hover:underline mt-2 inline-block">
                    Add an activity to a contact
                  </Link>
                </div>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">
                        {activity.type}{' '}
                        <span className="font-normal text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </span>
                      </p>
                      <p className="text-sm">{activity.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
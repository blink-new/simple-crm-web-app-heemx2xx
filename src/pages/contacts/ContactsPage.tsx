
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getContacts, getTags, deleteContact } from '../../lib/api';
import { Contact, Tag } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Phone, 
  Mail 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsData, tagsData] = await Promise.all([
          getContacts(),
          getTags()
        ]);
        setContacts(contactsData);
        setFilteredContacts(contactsData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = contacts;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(contact => 
        contact.first_name.toLowerCase().includes(query) ||
        contact.last_name.toLowerCase().includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.company && contact.company.toLowerCase().includes(query))
      );
    }
    
    if (statusFilter) {
      result = result.filter(contact => contact.status === statusFilter);
    }
    
    setFilteredContacts(result);
  }, [contacts, searchQuery, statusFilter]);

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteContact(id);
      setContacts(contacts.filter(contact => contact.id !== id));
      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setContactToDelete(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <Link to="/contacts/new">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No contacts found</h3>
          <p className="text-muted-foreground mt-1">
            {contacts.length === 0 
              ? "You haven't added any contacts yet." 
              : "No contacts match your search criteria."}
          </p>
          {contacts.length === 0 && (
            <Link to="/contacts/new">
              <Button className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                Add your first contact
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link 
                      to={`/contacts/${contact.id}`}
                      className="font-medium hover:underline"
                    >
                      {contact.first_name} {contact.last_name}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contact.email ? (
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="flex items-center text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="mr-1 h-4 w-4" />
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contact.phone ? (
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="flex items-center text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="mr-1 h-4 w-4" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contact.company || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/contacts/${contact.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            View/Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setContactToDelete(contact.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this contact and all associated activities.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => contactToDelete && handleDeleteContact(contactToDelete)}
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
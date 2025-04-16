
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createContact, updateContact, getContact, getTags, getContactTags, addTagToContact, removeTagFromContact } from '../../lib/api';
import { Contact, Tag } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  status: z.enum(['Lead', 'Prospect', 'Customer']),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      status: 'Lead',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tagsData = await getTags();
        setAvailableTags(tagsData);
        
        if (isEditMode && id) {
          const contactData = await getContact(id);
          reset({
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            email: contactData.email || '',
            phone: contactData.phone || '',
            company: contactData.company || '',
            status: contactData.status,
          });
          
          const contactTags = await getContactTags(id);
          setSelectedTags(contactTags);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSaving(true);
    try {
      if (isEditMode && id) {
        await updateContact(id, data);
        toast.success('Contact updated successfully');
      } else {
        const newContact = await createContact(data);
        
        // Add selected tags to the new contact
        if (selectedTags.length > 0) {
          await Promise.all(
            selectedTags.map(tag => addTagToContact(newContact.id, tag.id))
          );
        }
        
        toast.success('Contact created successfully');
      }
      navigate('/contacts');
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedTagId) return;
    
    const tagToAdd = availableTags.find(tag => tag.id === selectedTagId);
    if (!tagToAdd) return;
    
    // Check if tag is already selected
    if (selectedTags.some(tag => tag.id === selectedTagId)) {
      toast.error('This tag is already added');
      return;
    }
    
    setSelectedTags([...selectedTags, tagToAdd]);
    setSelectedTagId('');
    
    // If in edit mode, add tag to contact in database
    if (isEditMode && id) {
      try {
        await addTagToContact(id, selectedTagId);
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
    
    // If in edit mode, remove tag from contact in database
    if (isEditMode && id) {
      try {
        await removeTagFromContact(id, tagId);
      } catch (error) {
        console.error('Error removing tag:', error);
      }
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Contact' : 'Add New Contact'}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? 'Update contact information' 
              : 'Enter the details of your new contact'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Acme Inc."
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                defaultValue="Lead"
                onValueChange={(value) => setValue('status', value as 'Lead' | 'Prospect' | 'Customer')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Prospect">Prospect</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    style={{ backgroundColor: tag.color }}
                    className="text-white flex items-center gap-1"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 rounded-full hover:bg-white/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.length === 0 && (
                  <span className="text-sm text-muted-foreground">No tags selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedTagId}
                  onValueChange={setSelectedTagId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  disabled={!selectedTagId}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contacts')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditMode ? 'Update Contact' : 'Create Contact'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
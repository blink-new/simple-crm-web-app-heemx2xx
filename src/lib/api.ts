
import { supabase } from './supabase';
import { Contact, Activity, Tag } from '../types';

// Contacts API
export async function getContacts(search = '', status = '') {
  let query = supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Contact[];
}

export async function getContact(id: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Get tags for this contact
  const { data: tagData } = await supabase
    .from('contact_tags')
    .select('tags(*)')
    .eq('contact_id', id);
  
  const tags = tagData?.map(item => item.tags) as Tag[] || [];
  
  return { ...data, tags } as Contact;
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...contact, user_id: userData.user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Contact;
}

export async function updateContact(id: string, contact: Partial<Contact>) {
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...contact, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(id: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Activities API
export async function getActivities(contactId: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('contact_id', contactId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data as Activity[];
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('activities')
    .insert([{ ...activity, user_id: userData.user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Tags API
export async function getTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Tag[];
}

export async function createTag(tag: Omit<Tag, 'id'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('tags')
    .insert([{ ...tag, user_id: userData.user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Tag;
}

export async function deleteTag(id: string) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function addTagToContact(contactId: string, tagId: string) {
  const { error } = await supabase
    .from('contact_tags')
    .insert([{ contact_id: contactId, tag_id: tagId }]);
  
  if (error) throw error;
}

export async function removeTagFromContact(contactId: string, tagId: string) {
  const { error } = await supabase
    .from('contact_tags')
    .delete()
    .eq('contact_id', contactId)
    .eq('tag_id', tagId);
  
  if (error) throw error;
}

export async function getContactTags(contactId: string) {
  const { data, error } = await supabase
    .from('contact_tags')
    .select('tags(*)')
    .eq('contact_id', contactId);
  
  if (error) throw error;
  return data.map(item => item.tags) as Tag[];
}
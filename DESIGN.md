# Simple CRM Web Application Design

## Overview
A responsive web application for managing contacts and tracking interactions with features like adding, editing, deleting contacts, logging activities, and organizing contacts with tags.

## Core Features
1. **User Authentication**
   - Email/password login and registration
   - Protected routes for authenticated users

2. **Contact Management**
   - Add, edit, and delete contacts
   - View contact details
   - Search and filter contacts
   - Contact fields: name, email, phone, company, etc.

3. **Activity Tracking**
   - Log activities (calls, meetings, emails) for contacts
   - View activity history per contact
   - Add notes to activities

4. **Contact Organization**
   - Tag contacts with labels (Lead, Prospect, Customer)
   - Filter contacts by tags/status

## Database Schema

### Users Table
- id (uuid, primary key)
- email (string, unique)
- created_at (timestamp)

### Contacts Table
- id (uuid, primary key)
- user_id (uuid, foreign key to users.id)
- first_name (string)
- last_name (string)
- email (string)
- phone (string)
- company (string)
- status (string) - Lead, Prospect, Customer
- created_at (timestamp)
- updated_at (timestamp)

### Activities Table
- id (uuid, primary key)
- contact_id (uuid, foreign key to contacts.id)
- user_id (uuid, foreign key to users.id)
- type (string) - Call, Meeting, Email, Note
- description (text)
- date (timestamp)
- created_at (timestamp)

### Tags Table
- id (uuid, primary key)
- user_id (uuid, foreign key to users.id)
- name (string)
- color (string)

### Contact_Tags Table (Junction table)
- contact_id (uuid, foreign key to contacts.id)
- tag_id (uuid, foreign key to tags.id)
- Primary key: (contact_id, tag_id)

## UI Components

### Layout
- Sidebar navigation
- Main content area
- Responsive design for mobile and desktop

### Pages
1. **Authentication**
   - Login
   - Register
   - Forgot Password

2. **Dashboard**
   - Overview of contacts
   - Recent activities
   - Quick stats

3. **Contacts**
   - Contact list with search and filters
   - Contact details view
   - Add/Edit contact forms

4. **Activities**
   - Activity list per contact
   - Add activity form

5. **Settings**
   - User profile
   - Tag management

## Technical Stack
- React with Vite
- Tailwind CSS for styling
- ShadCN UI components
- Supabase for authentication and database
- React Router for navigation
- React Hook Form for form handling
- Zod for validation

## User Flow
1. User registers/logs in
2. Lands on dashboard with overview
3. Can navigate to contacts list
4. Can add/edit/delete contacts
5. Can view contact details
6. Can add activities to contacts
7. Can filter and search contacts

## Implementation Plan
1. Set up project structure and dependencies
2. Implement authentication with Supabase
3. Create database schema in Supabase
4. Build UI components and pages
5. Implement contact CRUD operations
6. Add activity tracking functionality
7. Implement tagging system
8. Add search and filtering capabilities
9. Polish UI and UX
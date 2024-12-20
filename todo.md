# What to do, and the upcoming tasks

## Sotware design - setting up the functionalities, including database design

### Functionalities
The main goal is to track the workload of workers in the company, and showing some necessary diagrams and queries about it.
- create an authorization system (maybe connected with the user/worker data table)
- create a customer registration system with the possibility to connect to the existing system via customer id
- create projects with referring ID
- create tasks with referring ID
- create assignment in a form of a calender, where user can book the necessary days/hours to the project/task

### Database design

´
Table users {
  id integer [primary key]
  username varchar
  initials varchar
  weeklyHours integer
  role varchar
  created_at timestamp
}

Table customers {
  id integer [primary key]
  customer varchar
  userId integer
}

Table projects {
  id integer [primary key]
  projectName varchar
  projectNumber decimal
  description varchar
  projectHours decimal
  start date
  ready date
  plannedStart date
  plannedReady date
  userId integer
  customerId integer
  customer varchar
}

Table tasks {
  id integer [primary key]
  task varchar
  taskNumber decimal
  description varchar
  estimatedTime decimal
  username varchar
  userId integer
  projectId integer
  projectName varchar
  projectNumber decimal
  customerId integer
  customerName varchar
}

Table assignments {
  id integer [primary key]
  start date
  stop date
  year integer
  weekNr integer
  hoursPerWeek decimal
  username varchar
  userId integer
  customerId integer
  customerName varchar
  projectId integer
  projectName varchar
  projectNumber decimal
  taskNumber decimal
  taskName varchar
  taskId integer
}

Ref: customers.userId > users.id 
Ref: projects.userId > users.id
Ref: projects.customerId > customers.id
Ref: tasks.projectId > projects.id
Ref: tasks.customerId > customers.id
Ref: tasks.userId > users.id
Ref: assignments.projectId > projects.id
Ref: assignments.userId > users.id
Ref: assignments.taskId > tasks.id
Ref: assignments.customerId > customers.id
´

## Tasks to do

### Python moduls

The necessary python moduls:
- to the database
- to the CRUD
- to the user interface 

### DB

Creating / generating the model.py file

### Software

Using the forms
Creating the main.py
Creating the forms.py

### Test

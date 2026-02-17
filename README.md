# Restaurant Management System

> Fullstack application developed independently, featuring a custom-designed relational database, a Spring Boot backend using JDBC, and a React dashboard performing full CRUD operations via REST APIs.

## Overview

This project is an end-to-end restaurant management system built from scratch, covering database design, backend development, and frontend integration.

The system allows managing operational data through a React dashboard that communicates with a Spring Boot REST API. The backend interacts directly with the database using Spring Data JDBC and custom SQL queries.

This project was developed as part of a database-focused academic challenge, emphasizing system design, data modeling, and fullstack integration.

---

## Key Highlights

- Fullstack architecture (React + Spring Boot)
- Backend implemented with Spring Data JDBC (direct SQL control)
- Custom relational database designed from scratch
- REST APIs handling business logic and data operations
- React dashboard performing complete CRUD operations
- Data visualization using charts
- Stored procedures, triggers, views, and SQL optimization
- End-to-end frontend–backend integration

---

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Data JDBC
- SQL

### Frontend
- React
- Vite
- Axios
- Recharts

### Database
- MySQL
- Views
- Triggers
- Stored Procedures
- Functions
- Index optimization

---

## System Architecture

The application follows a client–server architecture:

- React dashboard consumes backend REST APIs
- Spring Boot handles business logic
- JDBC provides direct database interaction
- Database layer manages persistence and data rules

Project structure:

- `proj-front/` → React dashboard
- `proj-back/` → Spring Boot backend
- `Entregaveis/` → Database models, scripts, and SQL artifacts

---

## Running the Project

### 1) Start the Backend

Navigate to: 
```
  proj-back/restaurante
```

Configure the database in `application.properties`:
  ```
  spring.datasource.url=jdbc:mysql://localhost:3306/bd_restaurante
  spring.datasource.username=root
  spring.datasource.password=root
```

Run the application:
```
mvn spring-boot:run
```


---

### 2) Create and Populate the Database

Inside the `Entregaveis` folder, execute:

1. `bd_criacao.sql`
2. `bd_dados.sql`

This will create the database schema and populate it with sample data.

---

### 3) Start the Frontend

Navigate to:

```
proj-front/dashboard
```

Install dependencies:
```
npm install
```

Run the application:
```
npm run dev
```

---

## Main Features

The system supports full CRUD operations across core entities:

- Clients
- Tables
- Orders (Comandas)
- Reservations

All operations are performed through the React dashboard and handled by the backend API.

---

## Database Features

This project includes a complete database design and advanced SQL resources:

- Conceptual model
- Logical model
- Relational model
- Queries and data extraction
- Views for analytical insights
- Stored procedures
- Triggers for automated rules
- Functions
- Index optimization

---

## Data Visualization

The dashboard includes graphical insights built using Recharts, such as:

- Revenue indicators
- Operational metrics
- Analytical summaries from database views

---

## Academic Requirements Implemented

This project was developed to meet the following technical requirements:

- CRUD for at least four tables
- Use of procedures, triggers, and functions
- Creation of views and advanced queries
- Integration with a software system (Spring Boot + React)

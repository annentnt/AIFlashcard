# Intelligent Flashcard Generation System

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
    - [Front-end](#front-end-installation)
    - [Back-end](#back-end-installation)
    - [Database](#database-setup)
---

## Overview

The Intelligent Flashcard Generation System is designed to automatically create, manage, and serve flashcards using advanced AI algorithms. It aims to assist learners by generating personalized study material and providing an interactive learning experience.

---

## Features

- Automatic flashcard generation from content
- Learning platform to assist users in vocabulary learning
- User authentication and profile management
- RESTful API for integration
- Interactive front-end for reviewing and testing
- Admin dashboard and analytics

---

## Technologies Used

### Front-end
- **NextJS**  
  (Located in `/client`)

### Back-end
- **Python** (Django framework)  
  (Located in `/server`)

### Database
- **PostgreSQL**  
  (Configured via Django settings)

---

## Prerequisites

- **Python 3.11**
- **pipenv**
- **Node.js & npm/yarn**
- **PostgreSQL**

---

## Installation

### <a name="front-end-installation"></a>Front-end

```bash
cd client
# If using React/Vue/etc.
npm install
npm start
```
*Adjust as needed for your stack.*

### <a name="back-end-installation"></a>Back-end

```bash
cd server
pipenv shell
pipenv sync
python manage.py migrate
python manage.py runserver
```

### <a name="database-setup"></a>Database

This repository uses PostgreSQL as database, update `server/settings.py` and install the relevant drivers, then run migrations.
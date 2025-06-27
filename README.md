### 1. Project Title & Description
- **Meta Menu**  
  A dynamic restaurant menu system built with Node.js, MySQL, HTML/CSS, and JavaScript. Features real-time price updates and automated triggers for pricing and billing.

### 2. Features
- Real-time menu updates
- Automated pricing and billing triggers
- Responsive frontend (HTML/CSS/JS)
- Node.js backend with Express
- MySQL database integration

### 3. Screen Recording
https://github.com/user-attachments/assets/620b2b1a-56f7-4ef3-98e0-bf677a5e5ccb

### 4. Getting Started

#### Prerequisites
- Node.js
- MySQL

#### Installation
```bash
git clone https://github.com/devinapshetty/meta-menu.git
cd meta-menu/backend
npm install
```

#### Database Setup
- Create a MySQL database.
- Run the scripts in `database/init.sql` and `database/sample-data.sql` to set up tables and sample data.

#### Environment Variables
- Create a `backend/.env` file with your database credentials:
  ```
  DB_HOST=localhost
  DB_USER=youruser
  DB_PASSWORD=yourpassword
  DB_NAME=yourdbname
  ```

#### Running the App
- Start the backend server:
  ```bash
  node backend/server.js
  ```
- Open `frontend/index.html` in your browser.

### 5. Future Scope
- Admin Dashboard: Add a dashboard for restaurant managers to analyze sales, update menus, and manage staff.
- Mobile App Integration: Develop a mobile app for customers and staff to interact with the menu.
- Payment Integration: Add support for online payments and billing.

### 6. Folder Structure
```
restaurant-menu/
  backend/
  database/
  frontend/
```

### 7. Contact
- To contact/know me more visit https://devinapshetty.github.io/

---

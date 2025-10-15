# 🍽️ Restaurant Management System

A full-stack **Restaurant Management System** built using **Node.js, Express, and MongoDB**.  
This project was developed as a **college mini-project** to simplify restaurant operations — from managing food items to handling customer orders and generating bills.

---

## 🚀 Features

### 👨‍💼 Admin Panel
- Add new food items to the menu  
- Update existing food details (name, price, category, etc.)  
- Remove unavailable food items  

### 🍔 Customer Side
- Browse and order food items  
- Generate order bills (currently supports **cash payment only**)  

### 💾 Data Management
- All data (menu, orders, customers) stored securely in **MongoDB Atlas**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ORM) |
| Runtime | npm, Node environment |

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

```bash
# 1️⃣ Clone this repository
git clone https://github.com/yashkk-07/Restaurant-Management-System.git

# 2️⃣ Move into the project folder
cd Restaurant-Management-System

# 3️⃣ Install dependencies
npm install

# 4️⃣ Create a .env file in the backend folder and add your MongoDB URI
MONGO_URI=your_mongodb_connection_string

# 5️⃣ Start the server
npm start
🧩 Folder Structure
Restaurant-Management-System/
│
├── backend/
│   ├── models/          # MongoDB models (food, orders, etc.)
│   ├── routes/          # Express routes
│   ├── server.js        # Main backend server
│   └── .env             # Environment variables (ignored by Git)
│
├── public/              # Frontend files (HTML, CSS, JS)
├── package.json         # Project dependencies and scripts
├── package-lock.json
├── .gitignore           # Ignore node_modules and .env
└── README.md            # Project documentation

🧠 Future Enhancements
💳 Add online payment gateway (Razorpay / Stripe)
🧾 Generate digital invoices
👤 Implement user login and authentication
📊 Add admin dashboard with analytics

👨‍🎓 Author

Yash Kandhare
GitHub: yashkk-07
College Mini Project (B.E. IT)

🪪 License
This project is open-source and available under the MIT License.

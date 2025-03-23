# 📌 API Documentation - Auth System (AdonisJS v6)

## 📖 Daftar Endpoint
| Method | Endpoint | Deskripsi | Auth |
|--------|---------|-----------|------|
| `POST` | `/api/auth/login` | Login user | ❌ |
| `POST` | `/api/auth/register` | Register user | ❌ |
| `POST` | `/api/auth/logout` | Logout user | ✅ (Token) |

---

## 🔐 Authentication
Gunakan **Bearer Token** dalam header untuk mengakses endpoint yang membutuhkan autentikasi.

```http
Authorization: Bearer <your_token>
```

---

## 1️⃣ Register User
### **Endpoint**
```http
POST /api/auth/register
```
### **Request Body**
```json
{
  "full_name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123"
}
```
### **Response**
```json
{
  "message": "Berhasil mendaftar"
}
```
---
## 2️⃣ Login User
### **Endpoint**
```http
POST /api/auth/login
```
### **Request Body**
```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```
### **Response**
```json
{
  "message": "success",
  "status": 200,
  "token": "<your_token>",
  "data": {
    "full_name": "John Doe",
    "email": "johndoe@example.com"
  }
}
```
---
## 3️⃣ Logout User
### **Endpoint**
```http
POST /api/auth/logout
```
### **Headers**
```http
Authorization: Bearer <your_token>
```
### **Response**
```json
{
  "success": true,
  "message": "User logged out",
  "data": "<your_token>"
}
```

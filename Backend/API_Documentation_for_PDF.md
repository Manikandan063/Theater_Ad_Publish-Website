# 🎭 Theatre Ad System - Complete API Guide & Postman JSONs

**Date:** March 27, 2026  
**Status:** Functional (Headless Edge rendering)  
**Base URL:** `http://localhost:5000/api`  

---

## 🔐 1. Authentication & Registration (Body Raw JSON)

### 👑 1.1 Super Admin (System Access)
- **URL:** `POST /api/theater-owners/register` (Set role manually or via this structure)
```json
{
  "name": "Super Admin",
  "email": "admin@theater.com",
  "password": "admin123_Secure",
  "theaterName": "HQ System Control",
  "location": "Central Hub",
  "contactNumber": "9998887776",
  "role": "admin"
}
```

### 🎥 1.2 Theater Owner
- **URL:** `POST /api/theater-owners/register`
```json
{
  "name": "Theater Manager",
  "email": "owner@theater.com",
  "password": "owner_password",
  "theaterName": "Xtown Cinema Hall",
  "location": "Chennai",
  "contactNumber": "9345577285"
}
```

### 💰 1.3 Ad Seller
- **URL:** `POST /api/ad-sellers/register`
```json
{
  "name": "Ad Agency X",
  "email": "agency@seller.com",
  "password": "seller_password",
  "agencyName": "Pro Ads Media",
  "contactPerson": "Mani K",
  "contactNumber": "9345577285",
  "address": "4th Street, Bangalore"
}
```

---

## 📢 2. Advertisements (Ad Seller Operation)

### 2.1 Create Advertisement
- **URL:** `POST /api/advertisements`
- **Auth:** Bearer Token (Ad Seller)
```json
{
  "title": "Nike Sports Campaign",
  "description": "Premium 30s Sports Video Ad",
  "mediaUrl": "https://ads.nike.com/summer_promo.mp4",
  "duration": 30,
  "adType": "video",
  "targetAudience": "Athletes"
}
```

---

## 💬 3. Quotations & Negotiations

### 3.1 Request Quote (Seller to Owner)
- **URL:** `POST /api/quotations`
```json
{
  "advertisementId": "{{AD_ID}}",
  "theaterOwnerId": "{{OWNER_ID}}",
  "price": 8500,
  "validUntil": "2024-12-31",
  "message": "Looking for the 7:00 PM interval slot."
}
```

### 3.2 Approve / Reject Quote (Owner Response)
- **URL:** `PATCH /api/quotations/{{QUOTE_ID}}/status`
```json
{
  "status": "accepted", // OR "rejected"
  "message": "Quota accepted. Please pay for 5 screens."
}
```

---

## 💳 4. Payments & Automatic Commission Splits (70 / 20 / 10)

### 4.1 Process Payment (Confirm Ad Display)
- **URL:** `POST /api/payments/process`
- **Note:** This automatically splits funds and tracks **Number of Screens**.
```json
{
  "advertisementId": "{{AD_ID}}",
  "theaterOwnerId": "{{OWNER_ID}}",
  "adSellerId": "{{SELLER_ID}}",
  "amount": 10000,
  "numberOfScreens": 5,
  "paymentType": "screen-wise",
  "remarks": "Displaying on 5 Screens - Weekly Slot"
}
```

### 📊 4.2 Financial Records & History
- **URL:** `GET /api/payments/my/history`
- **Output:** Returns JSON with summary totals for each party's share.

---

## 🚀 Pro Tips for Postman
1. **Bearer Token:** Always copy the `token` from the login response and paste it into the **Authorization** tab as a **Bearer Token**.
2. **Dynamic IDs:** Use the ID returned from the "Create Ad" or "Get Ads" calls to fill the variables in Quotations and Payments.

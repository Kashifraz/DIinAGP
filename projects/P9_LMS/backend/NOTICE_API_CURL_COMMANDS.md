# Notice/Announcement System API - CURL Commands

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require JWT authentication. Replace `YOUR_JWT_TOKEN` with your actual token.

---

## 1. Create Notice (Coordinator Only)

**POST** `/notices`

```bash
curl -X POST http://localhost:8080/api/notices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Midterm Exam Schedule",
    "content": "The midterm exams will be held from November 25-30, 2025. Please check your course schedules.",
    "category": "EXAM",
    "priority": "HIGH",
    "expirationDate": "2025-12-01T23:59:59"
  }'
```

**Response:** 201 Created
```json
{
  "id": 1,
  "coordinatorId": 1,
  "coordinatorName": "John Coordinator",
  "title": "Midterm Exam Schedule",
  "content": "The midterm exams will be held from November 25-30, 2025...",
  "category": "EXAM",
  "priority": "HIGH",
  "expirationDate": "2025-12-01T23:59:59",
  "status": "DRAFT",
  "readCount": 0,
  "isRead": false
}
```

---

## 2. Get All Published Notices (All Users)

**GET** `/notices`

```bash
curl -X GET http://localhost:8080/api/notices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "coordinatorId": 1,
    "coordinatorName": "John Coordinator",
    "title": "Midterm Exam Schedule",
    "content": "The midterm exams will be held...",
    "category": "EXAM",
    "priority": "HIGH",
    "expirationDate": "2025-12-01T23:59:59",
    "status": "PUBLISHED",
    "readCount": 5,
    "isRead": false
  }
]
```

---

## 3. Get All Notices for Coordinator (Coordinator Only)

**GET** `/notices/coordinator`

```bash
curl -X GET http://localhost:8080/api/notices/coordinator \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "coordinatorId": 1,
    "coordinatorName": "John Coordinator",
    "title": "Midterm Exam Schedule",
    "content": "The midterm exams will be held...",
    "category": "EXAM",
    "priority": "HIGH",
    "expirationDate": "2025-12-01T23:59:59",
    "status": "DRAFT",
    "readCount": 0,
    "isRead": false
  },
  {
    "id": 2,
    "status": "PUBLISHED",
    ...
  }
]
```

---

## 4. Get Notice by ID

**GET** `/notices/{id}`

```bash
curl -X GET http://localhost:8080/api/notices/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK
```json
{
  "id": 1,
  "coordinatorId": 1,
  "coordinatorName": "John Coordinator",
  "title": "Midterm Exam Schedule",
  "content": "The midterm exams will be held from November 25-30, 2025...",
  "category": "EXAM",
  "priority": "HIGH",
  "expirationDate": "2025-12-01T23:59:59",
  "status": "PUBLISHED",
  "createdAt": "2025-11-20T10:00:00",
  "updatedAt": "2025-11-20T10:00:00",
  "readCount": 5,
  "isRead": false
}
```

---

## 5. Update Notice (Coordinator Only)

**PUT** `/notices/{id}`

```bash
curl -X PUT http://localhost:8080/api/notices/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Midterm Exam Schedule",
    "content": "The midterm exams have been rescheduled to December 1-5, 2025.",
    "category": "EXAM",
    "priority": "HIGH",
    "expirationDate": "2025-12-06T23:59:59"
  }'
```

**Response:** 200 OK
```json
{
  "id": 1,
  "title": "Updated Midterm Exam Schedule",
  ...
}
```

**Note:** Cannot update published notices. Must be in DRAFT status.

---

## 6. Delete Notice (Coordinator Only)

**DELETE** `/notices/{id}`

```bash
curl -X DELETE http://localhost:8080/api/notices/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content

---

## 7. Publish Notice (Coordinator Only)

**PUT** `/notices/{id}/publish`

```bash
curl -X PUT http://localhost:8080/api/notices/1/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK
```json
{
  "id": 1,
  "status": "PUBLISHED",
  ...
}
```

---

## 8. Mark Notice as Read

**POST** `/notices/{id}/read`

```bash
curl -X POST http://localhost:8080/api/notices/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK

---

## 9. Get Unread Count

**GET** `/notices/unread/count`

```bash
curl -X GET http://localhost:8080/api/notices/unread/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 200 OK
```json
3
```

---

## Quick Test Flow

1. **Login as Coordinator:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coordinator@example.com",
    "password": "password"
  }'
```
Save the token from response.

2. **Create a Draft Notice:**
```bash
curl -X POST http://localhost:8080/api/notices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Holiday Notice",
    "content": "The university will be closed on December 25, 2025.",
    "category": "HOLIDAY",
    "priority": "MEDIUM",
    "expirationDate": "2025-12-31T23:59:59"
  }'
```

3. **Publish the Notice:**
```bash
curl -X PUT http://localhost:8080/api/notices/1/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Login as Student/Professor:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password"
  }'
```

5. **Get All Published Notices:**
```bash
curl -X GET http://localhost:8080/api/notices \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

6. **Get Unread Count:**
```bash
curl -X GET http://localhost:8080/api/notices/unread/count \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

7. **Mark Notice as Read:**
```bash
curl -X POST http://localhost:8080/api/notices/1/read \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

8. **Verify Unread Count Decreased:**
```bash
curl -X GET http://localhost:8080/api/notices/unread/count \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

---

## Error Responses

**400 Bad Request** - Validation errors
```json
{
  "message": "Title is required"
}
```

**403 Forbidden** - Not authorized
```json
{
  "message": "You don't have permission to update this notice"
}
```

**404 Not Found** - Notice not found
```json
{
  "message": "Notice not found with id: 999"
}
```

**400 Bad Request** - Cannot update published notice
```json
{
  "message": "Cannot update a published notice. Create a new notice or unpublish first."
}
```


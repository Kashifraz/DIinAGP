# Attendance System API - CURL Commands

**Base URL:** `http://localhost:8080/api`

**Note:** Replace `YOUR_JWT_TOKEN` with actual JWT token obtained from login.

---

## 1. Create Attendance Session (Professor)

```bash
curl -X POST "http://localhost:8080/api/attendance/courses/1/sessions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionDate": "2025-01-15",
    "durationMinutes": 15
  }'
```

**Response:** Returns AttendanceSessionDTO with QR code and expiration time.

---

## 2. Get Active Session (Professor)

```bash
curl -X GET "http://localhost:8080/api/attendance/courses/1/sessions/active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Returns active AttendanceSessionDTO or 404 if no active session.

---

## 3. Get All Sessions for Course (Professor)

```bash
curl -X GET "http://localhost:8080/api/attendance/courses/1/sessions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Returns list of AttendanceSessionDTO objects.

---

## 4. Get QR Code Image (Professor)

```bash
curl -X GET "http://localhost:8080/api/attendance/sessions/1/qr-code" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output qr-code.png
```

**Response:** Returns PNG image of QR code. Save to file with `--output`.

---

## 5. Scan QR Code (Student)

```bash
curl -X POST "http://localhost:8080/api/attendance/scan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "LMS_ATTENDANCE_<uuid-from-session>"
  }'
```

**Response:** Returns AttendanceRecordDTO confirming attendance marked.

---

## 6. Close Session (Professor)

```bash
curl -X PUT "http://localhost:8080/api/attendance/sessions/1/close" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** 204 No Content on success.

---

## 7. Get Records by Session (Professor)

```bash
curl -X GET "http://localhost:8080/api/attendance/sessions/1/records" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Returns list of AttendanceRecordDTO objects for the session.

---

## 8. Get Records by Student

```bash
curl -X GET "http://localhost:8080/api/attendance/students/3/records" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Returns list of all AttendanceRecordDTO objects for the student.

---

## 9. Get Records by Course and Student

```bash
curl -X GET "http://localhost:8080/api/attendance/courses/1/students/3/records" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:** Returns list of AttendanceRecordDTO objects for student in specific course.

---

## Quick Test Flow

1. **Login as Professor:**
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "professor@example.com", "password": "password"}' \
  | jq -r '.token'
```

2. **Create Session:**
```bash
TOKEN="YOUR_JWT_TOKEN"
curl -X POST "http://localhost:8080/api/attendance/courses/1/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionDate": "2025-01-15", "durationMinutes": 15}' \
  | jq '.qrCode'
```

3. **Get QR Code Image:**
```bash
curl -X GET "http://localhost:8080/api/attendance/sessions/1/qr-code" \
  -H "Authorization: Bearer $TOKEN" \
  --output qr-code.png
```

4. **Login as Student:**
```bash
STUDENT_TOKEN=$(curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password"}' \
  | jq -r '.token')
```

5. **Scan QR Code:**
```bash
curl -X POST "http://localhost:8080/api/attendance/scan" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "LMS_ATTENDANCE_<uuid>"}'
```

6. **View Records:**
```bash
curl -X GET "http://localhost:8080/api/attendance/sessions/1/records" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

- **401 Unauthorized:** Invalid or missing JWT token
- **403 Forbidden:** User doesn't have required role
- **404 Not Found:** Resource not found
- **400 Bad Request:** Invalid request data or QR code expired
- **409 Conflict:** Student already scanned (duplicate attendance)

